import { Swords, Trophy, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type DeckCard = {
    name: string;
    elixir: number;
};

type DeckPanelProps = {
    title: string;
    subtitle: string;
    cards: DeckCard[];
    avgElixir: number;
    winRate: number;
    synergy: string;
    color: string;
};

type MetricCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    description: string;
};

type ComparisonRowProps = {
    label: string;
    valueA: string;
    valueB: string;
    favorA: boolean;
};

const deck1Cards = [
    { name: 'Hog Rider', elixir: 4 },
    { name: 'Valkyrie', elixir: 4 },
    { name: 'Musketeer', elixir: 4 },
    { name: 'Cannon', elixir: 3 },
    { name: 'Fireball', elixir: 4 },
    { name: 'Log', elixir: 2 },
    { name: 'Ice Spirit', elixir: 1 },
    { name: 'Skeletons', elixir: 1 },
];

const deck2Cards = [
    { name: 'Giant', elixir: 5 },
    { name: 'Witch', elixir: 5 },
    { name: 'Mega Minion', elixir: 3 },
    { name: 'Mini P.E.K.K.A', elixir: 4 },
    { name: 'Zap', elixir: 2 },
    { name: 'Arrows', elixir: 3 },
    { name: 'Tombstone', elixir: 3 },
    { name: 'Goblin Gang', elixir: 3 },
];

export function DeckComparison() {
    return (
        <div className='space-y-6'>
            <div className='text-center'>
                <h1 className='mb-2'>Deck Comparison</h1>
                <p className='text-muted-foreground'>
                    Compare two decks in a simulated 1v1 matchup
                </p>
            </div>

            <div className='grid grid-cols-12 gap-6'>
                <div className='col-span-12 lg:col-span-5'>
                    <DeckPanel
                        title='Deck A'
                        subtitle='Hog Cycle'
                        cards={deck1Cards}
                        avgElixir={2.9}
                        winRate={68}
                        synergy='A+'
                        color='from-[#6366f1] to-[#4f46e5]'
                    />
                </div>

                <div className='col-span-12 lg:col-span-2 flex items-center justify-center'>
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl w-full'>
                        <div className='flex flex-col items-center gap-4'>
                            <Swords className='w-8 h-8 text-[#8b5cf6]' />
                            <div className='text-center'>
                                <div className='text-2xl mb-1'>58%</div>
                                <div className='text-sm text-muted-foreground'>Win Rate</div>
                            </div>
                            <div className='w-full h-px bg-border' />
                            <div className='text-center'>
                                <div className='text-primary'>Deck A</div>
                                <div className='text-xs text-muted-foreground'>
                                    Predicted Winner
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='col-span-12 lg:col-span-5'>
                    <DeckPanel
                        title='Deck B'
                        subtitle='Giant Beatdown'
                        cards={deck2Cards}
                        avgElixir={3.5}
                        winRate={54}
                        synergy='B+'
                        color='from-[#8b5cf6] to-[#7c3aed]'
                    />
                </div>
            </div>

            <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                <h2 className='mb-4'>Matchup Analysis</h2>

                <div className='grid grid-cols-3 gap-4 mb-6'>
                    <MetricCard
                        icon={Zap}
                        label='Speed Advantage'
                        value='Deck A'
                        description='Faster cycle allows outcycling'
                    />
                    <MetricCard
                        icon={Trophy}
                        label='Win Condition'
                        value='Equal'
                        description='Both have viable win cons'
                    />
                    <MetricCard
                        icon={Swords}
                        label='Defense'
                        value='Deck B'
                        description='Stronger defensive units'
                    />
                </div>

                <div className='space-y-3'>
                    <ComparisonRow
                        label='Elixir Cost'
                        valueA='2.9'
                        valueB='3.5'
                        favorA={true}
                    />
                    <ComparisonRow
                        label='Cycle Speed'
                        valueA='Fast'
                        valueB='Medium'
                        favorA={true}
                    />
                    <ComparisonRow
                        label='Defense Strength'
                        valueA='7/10'
                        valueB='8/10'
                        favorA={false}
                    />
                    <ComparisonRow
                        label='Spell Damage'
                        valueA='High'
                        valueB='Medium'
                        favorA={true}
                    />
                    <ComparisonRow
                        label='Air Coverage'
                        valueA='6/10'
                        valueB='7/10'
                        favorA={false}
                    />
                </div>
            </div>
        </div>
    );
}

function DeckPanel({ title, subtitle, cards, avgElixir, winRate, synergy, color }: DeckPanelProps) {
    return (
        <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
            <div className='mb-4'>
                <h2 className='mb-1'>{title}</h2>
                <p className='text-muted-foreground'>{subtitle}</p>
            </div>

            <div className='grid grid-cols-4 gap-3 mb-4'>
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className='aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 p-3 flex flex-col items-center justify-center hover:border-primary transition-all shadow-lg'
                    >
                        <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} mb-2 flex items-center justify-center shadow-lg text-sm`}
                        >
                            ⚔️
                        </div>
                        <div className='text-xs text-center mb-2 leading-tight'>{card.name}</div>
                        <div className='px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-xs'>
                            <span className='text-[#c4b5fd]'>{card.elixir}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-3 gap-2'>
                <div className='p-3 rounded-lg bg-background/50 border border-border/50 text-center'>
                    <div className='text-xs text-muted-foreground mb-1'>Avg Elixir</div>
                    <div>{avgElixir}</div>
                </div>
                <div className='p-3 rounded-lg bg-background/50 border border-border/50 text-center'>
                    <div className='text-xs text-muted-foreground mb-1'>Win Rate</div>
                    <div className='text-[#10b981]'>{winRate}%</div>
                </div>
                <div className='p-3 rounded-lg bg-background/50 border border-border/50 text-center'>
                    <div className='text-xs text-muted-foreground mb-1'>Synergy</div>
                    <div className='text-[#06b6d4]'>{synergy}</div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, description }: MetricCardProps) {
    return (
        <div className='p-4 rounded-lg bg-background/50 border border-border/50'>
            <Icon className='w-5 h-5 text-[#8b5cf6] mb-2' />
            <div className='text-sm text-muted-foreground mb-1'>{label}</div>
            <div className='mb-1'>{value}</div>
            <div className='text-xs text-muted-foreground'>{description}</div>
        </div>
    );
}

function ComparisonRow({ label, valueA, valueB, favorA }: ComparisonRowProps) {
    return (
        <div className='flex items-center gap-4 p-3 rounded-lg bg-background/30'>
            <div
                className={`flex-1 text-right ${favorA ? 'text-primary' : 'text-muted-foreground'}`}
            >
                {valueA}
            </div>
            <div className='text-muted-foreground min-w-[150px] text-center'>{label}</div>
            <div className={`flex-1 ${!favorA ? 'text-primary' : 'text-muted-foreground'}`}>
                {valueB}
            </div>
        </div>
    );
}
