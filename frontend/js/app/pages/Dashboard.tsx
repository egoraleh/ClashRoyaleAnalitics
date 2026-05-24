import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const statsData = [
    { date: 'Apr 1', rating: 5200 },
    { date: 'Apr 5', rating: 5350 },
    { date: 'Apr 10', rating: 5180 },
    { date: 'Apr 15', rating: 5420 },
    { date: 'Apr 20', rating: 5580 },
];

const recentMatches = [
    { id: 1, opponent: 'KingSlayer', result: 'Win', trophies: '+32', deck: 'Hog Cycle' },
    { id: 2, opponent: 'DragonLord', result: 'Loss', trophies: '-28', deck: 'Golem Beatdown' },
    { id: 3, opponent: 'SpellMaster', result: 'Win', trophies: '+30', deck: 'Hog Cycle' },
    { id: 4, opponent: 'TowerDestroyer', result: 'Win', trophies: '+31', deck: 'Hog Cycle' },
    { id: 5, opponent: 'ArenaChamp', result: 'Loss', trophies: '-29', deck: 'Hog Cycle' },
];

const deckPerformance = [
    { name: 'Hog Cycle', winRate: 68, games: 150, avgElixir: 2.9, progressClass: 'w-[68%]' },
    { name: 'Golem Beatdown', winRate: 54, games: 89, avgElixir: 4.2, progressClass: 'w-[54%]' },
    { name: 'X-Bow Siege', winRate: 62, games: 67, avgElixir: 3.3, progressClass: 'w-[62%]' },
];

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    trend: string;
    color: string;
};

export function Dashboard() {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-8'>
                <div className='grid grid-cols-4 gap-4 mb-6'>
                    <StatCard
                        icon={Trophy}
                        label='Trophies'
                        value='5,580'
                        trend='+120'
                        color='from-[#6366f1] to-[#4f46e5]'
                    />
                    <StatCard
                        icon={TrendingUp}
                        label='Win Rate'
                        value='64%'
                        trend='+3.2%'
                        color='from-[#8b5cf6] to-[#7c3aed]'
                    />
                    <StatCard
                        icon={Target}
                        label='Current Rating'
                        value='5,580'
                        trend='+160'
                        color='from-[#06b6d4] to-[#0891b2]'
                    />
                    <StatCard
                        icon={Zap}
                        label='Games Today'
                        value='12'
                        trend='+5'
                        color='from-[#10b981] to-[#059669]'
                    />
                </div>

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-6'>Rating Over Time</h2>
                    <ResponsiveContainer
                        width='100%'
                        height={300}
                    >
                        <LineChart data={statsData}>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                stroke='#1e293b'
                            />
                            <XAxis
                                dataKey='date'
                                stroke='#94a3b8'
                            />
                            <YAxis
                                stroke='#94a3b8'
                                domain={[5000, 5800]}
                            />
                            <Tooltip wrapperClassName='chart-tooltip' />
                            <Line
                                type='monotone'
                                dataKey='rating'
                                stroke='#6366f1'
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl mt-6'>
                    <h2 className='mb-4'>Recent Matches</h2>
                    <div className='space-y-2'>
                        {recentMatches.map((match) => (
                            <div
                                key={match.id}
                                className='flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background transition-colors'
                            >
                                <div className='flex items-center gap-4'>
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            match.result === 'Win' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                                        }`}
                                    />
                                    <span className='w-32'>{match.opponent}</span>
                                    <span className='text-muted-foreground'>{match.deck}</span>
                                </div>
                                <div className='flex items-center gap-6'>
                                    <span
                                        className={
                                            match.result === 'Win'
                                                ? 'text-[#10b981]'
                                                : 'text-[#ef4444]'
                                        }
                                    >
                                        {match.result}
                                    </span>
                                    <span
                                        className={`w-16 text-right ${
                                            match.trophies.startsWith('+')
                                                ? 'text-[#10b981]'
                                                : 'text-[#ef4444]'
                                        }`}
                                    >
                                        {match.trophies}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='col-span-12 lg:col-span-4'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4'>Deck Performance</h2>
                    <div className='space-y-4'>
                        {deckPerformance.map((deck) => (
                            <div
                                key={deck.name}
                                className='p-4 rounded-lg bg-gradient-to-br from-background/50 to-background border border-border/50'
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <h3>{deck.name}</h3>
                                    <span className='text-[#10b981]'>{deck.winRate}%</span>
                                </div>
                                <div className='w-full bg-background rounded-full h-2 mb-3'>
                                    <div
                                        className={`bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-2 rounded-full transition-all ${deck.progressClass}`}
                                    />
                                </div>
                                <div className='flex justify-between text-sm text-muted-foreground'>
                                    <span>{deck.games} games</span>
                                    <span>{deck.avgElixir} avg elixir</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
    return (
        <div className='bg-card border border-border rounded-xl p-4 shadow-xl relative overflow-hidden'>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
            <div className='relative'>
                <div className='flex items-center justify-between mb-2'>
                    <Icon className='w-5 h-5 text-muted-foreground' />
                    <span className='text-sm text-[#10b981]'>{trend}</span>
                </div>
                <div className='text-2xl mb-1'>{value}</div>
                <div className='text-sm text-muted-foreground'>{label}</div>
            </div>
        </div>
    );
}
