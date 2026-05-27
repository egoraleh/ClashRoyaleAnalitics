import { useEffect, useMemo, useState } from 'react';
import { Trophy, TrendingUp, Target, Zap, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/api/auth-context';
import { getProfile, getDashboard, refreshProfile } from '@/api/profiles';
import { listDecks } from '@/api/decks';
import type { ProfileResponse, DashboardResponse } from '@/api/profiles';
import type { DeckShort } from '@/api/decks';

function parseBattleTime(bt: string): Date {
    const y = parseInt(bt.substring(0, 4));
    const m = parseInt(bt.substring(4, 6)) - 1;
    const d = parseInt(bt.substring(6, 8));
    const h = parseInt(bt.substring(9, 11));
    const min = parseInt(bt.substring(11, 13));
    return new Date(y, m, d, h, min);
}

function fmtTime(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtTimeFull(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [decks, setDecks] = useState<DeckShort[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = () => {
        if (!user) return;
        getProfile().then(setProfile).catch(() => {});
        getDashboard().then(setDashboard).catch(() => {});
        listDecks().then(res => setDecks(res.items)).catch(() => {});
    };

    useEffect(() => {
        if (!user) return;
        load();
        setRefreshing(true);
        refreshProfile().then(() => {
            setTimeout(() => {
                load();
                setRefreshing(false);
            }, 2000);
        }).catch(() => setRefreshing(false));
    }, [user]);

    const cache = profile?.cache;

    const trophies = cache?.trophies ?? null;
    const bestTrophies = cache?.bestTrophies ?? null;
    const winRate = cache?.battleStats?.winRate as number | undefined;
    const playerName = cache?.playerName;
    const fmt = (n: number) => n.toLocaleString();

    const recentMatches = cache?.battleStats?.recentMatches as Array<Record<string, unknown>> | undefined;

    const battleChartData = useMemo(() => {
        if (!recentMatches || recentMatches.length === 0) return null;
        const withTrophy = recentMatches
            .map(m => {
                const team = (m.team as Array<Record<string, unknown>>)?.[0];
                if (!team || team.trophyChange == null || team.startingTrophies == null) return null;
                const bt = String(m.battleTime ?? '');
                return {
                    date: bt ? parseBattleTime(bt) : new Date(),
                    startingTrophies: Number(team.startingTrophies),
                    trophyChange: Number(team.trophyChange),
                };
            })
            .filter((x): x is NonNullable<typeof x> => x != null)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (withTrophy.length === 0) return null;

        return withTrophy.map(p => ({
            date: fmtTime(p.date),
            rating: p.startingTrophies + p.trophyChange,
            change: p.trophyChange,
        }));
    }, [recentMatches]);

    const ratingHistory = dashboard?.charts?.ratingHistory as Array<{ rating: number; changedAt: string }> | undefined;
    const ratingData = ratingHistory?.map(p => ({
        date: new Date(p.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rating: p.rating,
    })) ?? [];

    const chartData = battleChartData ?? (ratingData.length > 0 ? ratingData : null);

    if (!user) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className='text-center text-muted-foreground bg-card border border-border rounded-xl p-8 shadow-xl'>
                    <Trophy className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <h2 className='mb-2'>Welcome to Royale Analytics</h2>
                    <p>Sign in to view your Clash Royale stats</p>
                </div>
            </div>
        );
    }

    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-8'>
                <div className='flex items-center gap-2 mb-4'>
                    <h1 className='flex-1'>Dashboard</h1>
                    {refreshing && <RefreshCw className='w-4 h-4 animate-spin text-muted-foreground' />}
                </div>

                {!playerName && !refreshing && (
                    <div className='bg-card border border-border rounded-xl p-8 shadow-xl mb-6 text-center text-muted-foreground'>
                        No Clash Royale data yet. The profile will refresh automatically.
                    </div>
                )}

                {playerName && (
                    <div className='grid grid-cols-4 gap-4 mb-6'>
                        <StatCard icon={Trophy} label='Trophies' value={trophies != null ? fmt(trophies) : '--'}
                            trend={bestTrophies != null && bestTrophies > (trophies ?? 0) ? `Best: ${fmt(bestTrophies)}` : 'Best!'}
                            color='from-[#6366f1] to-[#4f46e5]' />
                        <StatCard icon={TrendingUp} label='Win Rate' value={winRate != null ? `${Math.round(winRate)}%` : '--'}
                            trend='Season' color='from-[#8b5cf6] to-[#7c3aed]' />
                        <StatCard icon={Target} label='Best Trophies' value={bestTrophies != null ? fmt(bestTrophies) : '--'}
                            trend='All time' color='from-[#06b6d4] to-[#0891b2]' />
                        <StatCard icon={Zap} label='Player' value={playerName ?? '--'}
                            trend={cache?.expLevel != null ? `Lvl ${cache.expLevel}` : ''}
                            color='from-[#10b981] to-[#059669]' />
                    </div>
                )}

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-6'>Trophy Progression</h2>
                    {!chartData ? (
                        <div className='text-center text-muted-foreground py-16'>
                            {refreshing ? 'Loading chart...' : 'No battle data yet'}
                        </div>
                    ) : (
                        <div>
                            <ResponsiveContainer width='100%' height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#1e293b' />
                                    <XAxis dataKey='date' stroke='#94a3b8' fontSize={11} />
                                    <YAxis stroke='#94a3b8' domain={['auto', 'auto']} fontSize={11} />
                                    <Tooltip
                                        wrapperClassName='chart-tooltip'
                                        formatter={(value: number, name: string) => [fmt(value), 'Trophies']}
                                    />
                                    <Line type='monotone' dataKey='rating' stroke='#6366f1' strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            {battleChartData && (
                                <div className='flex items-center justify-center gap-6 mt-3 text-sm text-muted-foreground'>
                                    <span className='flex items-center gap-1'><ArrowUp className='w-3.5 h-3.5 text-[#10b981]' /> {battleChartData.filter(d => d.change > 0).length} wins</span>
                                    <span className='flex items-center gap-1'><ArrowDown className='w-3.5 h-3.5 text-[#ef4444]' /> {battleChartData.filter(d => d.change < 0).length} losses</span>
                                    <span>{battleChartData.length} battles</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl mt-6'>
                    <h2 className='mb-4'>Recent Matches</h2>
                    {(!recentMatches || recentMatches.length === 0) ? (
                        <div className='text-center text-muted-foreground py-8'>
                            {refreshing ? 'Loading matches...' : 'No recent matches found'}
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            {recentMatches.slice(0, 15).map((match: Record<string, unknown>, i) => {
                                const team = (match.team as Array<Record<string, unknown>>) ?? [];
                                const opponent = (match.opponent as Array<Record<string, unknown>>) ?? [];
                                const me = team[0] ?? {};
                                const trophyChange = me.trophyChange as number | undefined;
                                const teamCrowns = Math.max(...team.map(t => (t.crowns as number) ?? 0), 0);
                                const oppCrowns = Math.max(...opponent.map(o => (o.crowns as number) ?? 0), 0);
                                const isWin = teamCrowns > oppCrowns;
                                const oppName = opponent.map(o => o.name as string).filter(Boolean).join(', ') || 'Unknown';
                                const matchType = match.type as string ?? 'Unknown';
                                const battleTime = match.battleTime as string | undefined;
                                return (
                                    <div key={i} className='flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors'>
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${isWin ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
                                            <span className='text-muted-foreground text-xs w-16 shrink-0'>{battleTime ? fmtTimeFull(parseBattleTime(battleTime)) : ''}</span>
                                            <span className='truncate w-28'>{oppName}</span>
                                        </div>
                                        <div className='flex items-center gap-4 shrink-0'>
                                            {trophyChange != null && (
                                                <span className={`text-sm font-medium ${trophyChange > 0 ? 'text-[#10b981]' : trophyChange < 0 ? 'text-[#ef4444]' : ''}`}>
                                                    {trophyChange > 0 ? '+' : ''}{trophyChange}
                                                </span>
                                            )}
                                            <span className='text-muted-foreground text-xs'>{matchType}</span>
                                            <span className='text-xs w-10 text-right'>{teamCrowns}-{oppCrowns}</span>
                                            <span className={`w-10 text-right text-sm ${isWin ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                                {isWin ? 'W' : 'L'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className='col-span-12 lg:col-span-4'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4'>Deck Performance</h2>
                    {decks.length === 0 ? (
                        <div className='text-center text-muted-foreground py-8'>
                            Create your first deck!
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {decks.slice(0, 5).map((deck) => {
                                const wr = deck.qualityScore ?? 50;
                                return (
                                    <div key={deck.id} className='p-4 rounded-lg bg-gradient-to-br from-background/50 to-background border border-border/50'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <h3>{deck.name}</h3>
                                            <span className='text-[#10b981]'>{Math.round(wr)}%</span>
                                        </div>
                                        <div className='w-full bg-background rounded-full h-2 mb-3'>
                                            <div className='bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-2 rounded-full transition-all' style={{ width: `${wr}%` }} />
                                        </div>
                                        <div className='flex justify-between text-sm text-muted-foreground'>
                                            <span>{deck.deckType}</span>
                                            {deck.strategy && <span>{deck.strategy}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    trend: string;
    color: string;
};

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
    return (
        <div className='bg-card border border-border rounded-xl p-4 shadow-xl relative overflow-hidden'>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
            <div className='relative'>
                <div className='flex items-center justify-between mb-2'>
                    <Icon className='w-5 h-5 text-muted-foreground' />
                    {trend && <span className='text-sm text-[#10b981]'>{trend}</span>}
                </div>
                <div className='text-2xl mb-1'>{value}</div>
                <div className='text-sm text-muted-foreground'>{label}</div>
            </div>
        </div>
    );
}
