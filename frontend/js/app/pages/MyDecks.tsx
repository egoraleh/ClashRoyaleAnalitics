import { Plus, Play, Trash2, Share2 } from 'lucide-react';

const decks = [
    {
        id: 1,
        name: 'Hog Cycle',
        winRate: 68,
        games: 150,
        avgElixir: 2.9,
        cards: [
            'Hog Rider',
            'Valkyrie',
            'Musketeer',
            'Cannon',
            'Fireball',
            'Log',
            'Ice Spirit',
            'Skeletons',
        ],
    },
    {
        id: 2,
        name: 'Golem Beatdown',
        winRate: 54,
        games: 89,
        avgElixir: 4.2,
        cards: [
            'Golem',
            'Night Witch',
            'Baby Dragon',
            'Mega Minion',
            'Lightning',
            'Zap',
            'Tornado',
            'Lumberjack',
        ],
    },
    {
        id: 3,
        name: 'X-Bow Siege',
        winRate: 62,
        games: 67,
        avgElixir: 3.3,
        cards: ['X-Bow', 'Tesla', 'Archers', 'Knight', 'Ice Golem', 'Log', 'Fireball', 'Skeletons'],
    },
    {
        id: 4,
        name: 'Miner Control',
        winRate: 59,
        games: 92,
        avgElixir: 3.1,
        cards: [
            'Miner',
            'Poison',
            'Valkyrie',
            'Bats',
            'Spear Goblins',
            'Ice Spirit',
            'Skeletons',
            'Inferno Tower',
        ],
    },
    {
        id: 5,
        name: 'Lava Hound',
        winRate: 56,
        games: 74,
        avgElixir: 3.8,
        cards: [
            'Lava Hound',
            'Balloon',
            'Mega Minion',
            'Tombstone',
            'Arrows',
            'Zap',
            'Skeleton Army',
            'Minions',
        ],
    },
    {
        id: 6,
        name: 'P.E.K.K.A Bridge',
        winRate: 61,
        games: 103,
        avgElixir: 3.9,
        cards: [
            'P.E.K.K.A',
            'Battle Ram',
            'Bandit',
            'Electro Wizard',
            'Zap',
            'Poison',
            'Ghost',
            'Dark Prince',
        ],
    },
];

export function MyDecks() {
    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='mb-2'>My Decks</h1>
                    <p className='text-muted-foreground'>Manage your saved deck collections</p>
                </div>
                <button className='px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-2'>
                    <Plus className='w-4 h-4' />
                    New Deck
                </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className='bg-card border border-border rounded-xl p-6 shadow-xl hover:border-primary/50 transition-all group'
                    >
                        <div className='flex items-start justify-between mb-4'>
                            <div>
                                <h2 className='mb-1'>{deck.name}</h2>
                                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                    <span>{deck.games} games</span>
                                    <span>•</span>
                                    <span className='text-[#10b981]'>{deck.winRate}% win rate</span>
                                </div>
                            </div>
                            <div className='px-3 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'>
                                <span className='text-[#c4b5fd]'>{deck.avgElixir}</span>
                            </div>
                        </div>

                        <div className='grid grid-cols-8 gap-2 mb-4'>
                            {deck.cards.map((card, index) => (
                                <div
                                    key={index}
                                    className='aspect-square rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-all shadow-lg'
                                    title={card}
                                >
                                    <span className='text-lg'>⚔️</span>
                                </div>
                            ))}
                        </div>

                        <div className='flex gap-2'>
                            <button className='flex-1 py-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors flex items-center justify-center gap-2 text-sm'>
                                <Play className='w-4 h-4' />
                                Use Deck
                            </button>
                            <button className='p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors'>
                                <Share2 className='w-4 h-4' />
                            </button>
                            <button className='p-2 rounded-lg border border-border bg-background/50 hover:bg-destructive hover:border-destructive transition-colors group/delete'>
                                <Trash2 className='w-4 h-4 group-hover/delete:text-destructive-foreground' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
