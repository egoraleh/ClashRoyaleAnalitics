import { useEffect, useState, type ComponentType } from 'react';
import { Trophy, Target, TrendingUp, Award, RefreshCw, Swords, Users, Star, Zap, Shield, GitBranch, Clover, Flame } from 'lucide-react';
import { useAuth } from '@/api/auth-context';
import { getProfile, refreshProfile } from '@/api/profiles';
import type { ProfileResponse } from '@/api/profiles';
import type { CardShort } from '@/api/cards';

export function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = () => {
        if (!user) return;
        getProfile().then(setProfile).catch(() => {});
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
    const puser = profile?.user ?? user;
    const pd = cache?.profileData as Record<string, unknown> | undefined;

    const totalGames = (cache?.battleStats?.totalBattles ?? pd?.battleCount) as number | undefined;
    const totalWins = (cache?.battleStats?.totalWins ?? pd?.wins) as number | undefined;
    const totalLosses = (cache?.battleStats?.totalLosses ?? pd?.losses) as number | undefined;
    const threeCrownWins = pd?.threeCrownWins as number | undefined;
    const currentStreak = pd?.currentWinLoseStreak as number | undefined;
    const challengeWins = pd?.challengeCardsWon as number | undefined;
    const challengeMax = pd?.challengeMaxWins as number | undefined;
    const tourneyCards = pd?.tournamentCardsWon as number | undefined;
    const tourneyBattles = pd?.tournamentBattleCount as number | undefined;
    const role = pd?.role as string | undefined;
    const totalDonations = pd?.totalDonations as number | undefined;
    const clanCardsCollected = pd?.clanCardsCollected as number | undefined;
    const warDayWins = pd?.warDayWins as number | undefined;
    const arenaObj = pd?.arena as Record<string, unknown> | undefined;
    const clanObj = pd?.clan as Record<string, unknown> | undefined;
    const badges = pd?.badges as Array<Record<string, unknown>> | undefined;
    const leagueStats = pd?.leagueStatistics as Record<string, unknown> | undefined;
    const currentSeason = leagueStats?.currentSeason as Record<string, unknown> | undefined;
    const bestSeason = leagueStats?.bestSeason as Record<string, unknown> | undefined;
    const careerWinRate = totalGames && totalGames > 0 ? (totalWins ?? 0) / totalGames * 100 : null;
    const currentDeck = cache?.currentDeck;

    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-4 space-y-6'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <div className='flex items-center gap-2 mb-4'>
                        <h2 className='flex-1'>Player</h2>
                        {refreshing && <RefreshCw className='w-4 h-4 animate-spin text-muted-foreground' />}
                    </div>
                    <div className='flex flex-col items-center mb-4'>
                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-xl shadow-primary/30 mb-3'>
                            <span className='text-4xl'>👑</span>
                        </div>
                        <h2 className='mb-1'>{cache?.playerName ?? '--'}</h2>
                        <p className='text-muted-foreground text-sm'>{puser?.playerTag ?? '#'}</p>
                        {arenaObj && <p className='text-xs text-muted-foreground mt-1'>{arenaObj.name as string}</p>}
                    </div>
                    <div className='space-y-2'>
                        <Row label='Level' value={`${pd?.expLevel ?? cache?.expLevel ?? '--'}`} />
                        <Row label='Trophies' value={`${cache?.trophies?.toLocaleString() ?? '--'}`} color='text-[#10b981]' />
                        <Row label='Best Trophies' value={`${cache?.bestTrophies?.toLocaleString() ?? '--'}`} color='text-[#06b6d4]' />
                        {currentSeason && <Row label='Season Best' value={`${(currentSeason.bestTrophies as number)?.toLocaleString() ?? '--'}`} />}
                        {bestSeason && <Row label='All-Time Best' value={`${(bestSeason.trophies as number)?.toLocaleString() ?? '--'} (${bestSeason.id})`} />}
                        {role && <Row label='Role' value={role} />}
                    </div>
                </div>

                {clanObj && (
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                        <h2 className='mb-4 flex items-center gap-2'><Shield className='w-4 h-4' /> Clan</h2>
                        <div className='space-y-2'>
                            <Row label='Name' value={clanObj.name as string} />
                            <Row label='Tag' value={clanObj.tag as string} />
                            <Row label='Role' value={role ?? '--'} />
                            <Row label='Total Donations' value={totalDonations?.toLocaleString() ?? '--'} />
                            <Row label='Clan Cards' value={clanCardsCollected?.toLocaleString() ?? '--'} />
                            <Row label='War Day Wins' value={warDayWins?.toLocaleString() ?? '--'} />
                        </div>
                    </div>
                )}

                {badges && badges.length > 0 && (
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                        <h2 className='mb-4 flex items-center gap-2'><Star className='w-4 h-4' /> Badges</h2>
                        <div className='grid grid-cols-2 gap-3'>
                            {badges.slice(0, 8).map((badge, i) => {
                                const level = badge.level as number;
                                const maxLevel = badge.maxLevel as number;
                                const progress = badge.progress as number;
                                const target = badge.target as number;
                                const pct = target > 0 ? Math.min(progress / target * 100, 100) : 0;
                                return (
                                    <div key={i} className='p-2 rounded-lg bg-background/50 border border-border/50'>
                                        <div className='text-xs font-medium truncate'>{badge.name as string}</div>
                                        <div className='text-[10px] text-muted-foreground'>Lv {level}/{maxLevel}</div>
                                        <div className='w-full bg-background rounded-full h-1 mt-1'>
                                            <div className='bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-1 rounded-full' style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className='col-span-12 lg:col-span-8 space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                    <StatCard icon={Swords} label='Total Battles' value={totalGames?.toLocaleString() ?? '--'} />
                    <StatCard icon={Trophy} label='Total Wins' value={totalWins?.toLocaleString() ?? '--'} color='text-[#10b981]' />
                    <StatCard icon={TrendingUp} label='Losses' value={totalLosses?.toLocaleString() ?? '--'} color='text-[#ef4444]' />
                    <StatCard icon={Award} label='Win Rate' value={careerWinRate != null ? `${Math.round(careerWinRate)}%` : '--'} color='text-[#8b5cf6]' />
                    <StatCard icon={Target} label='3-Crown Wins' value={threeCrownWins?.toLocaleString() ?? '--'} color='text-[#06b6d4]' />
                    <StatCard icon={Flame} label='Current Streak' value={currentStreak?.toLocaleString() ?? '0'} color={currentStreak != null && currentStreak > 0 ? 'text-[#f59e0b]' : 'text-muted-foreground'} />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                        <h2 className='mb-4 flex items-center gap-2'><GitBranch className='w-4 h-4' /> Challenges</h2>
                        <div className='space-y-2'>
                            <Row label='Cards Won' value={challengeWins?.toLocaleString() ?? '--'} />
                            <Row label='Max Wins' value={challengeMax?.toLocaleString() ?? '--'} />
                        </div>
                    </div>
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                        <h2 className='mb-4 flex items-center gap-2'><Clover className='w-4 h-4' /> Tournaments</h2>
                        <div className='space-y-2'>
                            <Row label='Cards Won' value={tourneyCards?.toLocaleString() ?? '--'} />
                            <Row label='Battles' value={tourneyBattles?.toLocaleString() ?? '--'} />
                        </div>
                    </div>
                </div>

                {currentDeck && currentDeck.cards && currentDeck.cards.length > 0 && (
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                        <h2 className='mb-4 flex items-center gap-2'><Swords className='w-4 h-4' /> Active Deck</h2>
                        <div className='grid grid-cols-4 gap-3'>
                            {currentDeck.cards.slice(0, 8).map((card: CardShort) => (
                                <div key={card.id} className='flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/50'>
                                    {card.iconUrl ? (
                                        <img src={card.iconUrl} alt={card.name} className='w-14 h-14 object-contain' />
                                    ) : (
                                        <div className='w-14 h-14 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-xs'>?</div>
                                    )}
                                    <span className='text-xs text-muted-foreground mt-1 text-center truncate w-full'>{card.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4 flex items-center gap-2'><Users className='w-4 h-4' /> Clan Contribution</h2>
                    <div className='grid grid-cols-3 gap-4'>
                        <StatCard icon={Zap} label='Total Donations' value={totalDonations?.toLocaleString() ?? '--'} />
                        <StatCard icon={Shield} label='Clan Cards' value={clanCardsCollected?.toLocaleString() ?? '--'} />
                        <StatCard icon={Trophy} label='War Wins' value={warDayWins?.toLocaleString() ?? '--'} />
                    </div>
                </div>

                {!cache && !refreshing && (
                    <div className='bg-card border border-border rounded-xl p-8 shadow-xl text-center text-muted-foreground'>
                        Link your Clash Royale account to see profile data
                    </div>
                )}
            </div>
        </div>
    );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
            <span className='text-sm text-muted-foreground'>{label}</span>
            <span className={`text-sm font-medium ${color ?? ''}`}>{value}</span>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: ComponentType<{ className?: string }>; label: string; value: string; color?: string }) {
    return (
        <div className='bg-card border border-border rounded-xl p-4 shadow-xl'>
            <Icon className='w-5 h-5 text-[#8b5cf6] mb-3' />
            <div className={`text-2xl mb-1 ${color ?? ''}`}>{value}</div>
            <div className='text-sm text-muted-foreground'>{label}</div>
        </div>
    );
}
