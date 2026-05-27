import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { listCards } from '@/api/cards';
import type { Card } from '@/api/cards';

type PickedCard = {
    cardId: number;
    name: string;
    iconUrl: string | null;
    elixir: number | null;
};

type Props = {
    side: 'left' | 'right';
    onClose: () => void;
    onPick: (cards: PickedCard[]) => void;
};

export function AiCardsPicker({ side, onClose, onPick }: Props) {
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Card[]>([]);

    useEffect(() => {
        listCards({ size: 200 }).then(res => setAllCards(res.items)).catch(() => {});
    }, []);

    const filtered = allCards.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCard = (card: Card) => {
        if (selected.find(s => s.id === card.id)) {
            setSelected(prev => prev.filter(s => s.id !== card.id));
        } else if (selected.length < 8) {
            setSelected(prev => [...prev, card]);
        }
    };

    const handleConfirm = () => {
        onPick(selected.map(c => ({ cardId: c.id, name: c.name, iconUrl: c.iconUrl, elixir: c.elixir })));
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={onClose}>
            <div className='bg-card border border-border rounded-xl p-8 shadow-2xl w-full max-w-3xl mx-4' onClick={e => e.stopPropagation()}>
                <div className='flex items-center justify-between mb-6'>
                    <h2>Pick 8 Cards — Deck {side === 'left' ? 'A' : 'B'}</h2>
                    <button onClick={onClose} className='p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <span className='text-sm text-muted-foreground'>{selected.length}/8 selected</span>
                    <div className='relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                        <input
                            type='text'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className='pl-9 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors text-sm w-48'
                            placeholder='Search cards...'
                        />
                    </div>
                </div>

                {selected.length > 0 && (
                    <div className='flex gap-2 mb-4 p-3 rounded-lg bg-background/50 border border-border/50'>
                        {Array.from({ length: 8 }).map((_, i) => {
                            const card = selected[i];
                            return (
                                <div key={i} className='flex-1 aspect-square rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 flex items-center justify-center'>
                                    {card ? (
                                        <img src={card.iconUrl} alt={card.name} title={card.name} className='w-12 h-12 object-contain' />
                                    ) : (
                                        <span className='text-muted-foreground text-xs'>{i + 1}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className='grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 rounded-lg bg-background/30 border border-border/50 mb-6'>
                    {filtered.map(card => {
                        const isSelected = selected.some(s => s.id === card.id);
                        return (
                            <button
                                type='button'
                                key={card.id}
                                onClick={() => toggleCard(card)}
                                className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all ${
                                    isSelected
                                        ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                        : 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-border/50 hover:border-primary/50'
                                }`}
                                title={card.name}
                            >
                                {card.iconUrl ? (
                                    <img src={card.iconUrl} alt={card.name} className='w-12 h-12 object-contain mb-1' />
                                ) : (
                                    <div className='w-12 h-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1 text-sm'>?</div>
                                )}
                                <span className='text-xs leading-tight truncate max-w-full text-center'>{card.name}</span>
                                <span className='text-xs text-muted-foreground'>{card.elixir ?? '?'}</span>
                            </button>
                        );
                    })}
                </div>

                <div className='flex gap-3'>
                    <button onClick={onClose} className='flex-1 py-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors'>Cancel</button>
                    <button onClick={handleConfirm} disabled={selected.length !== 8} className='flex-1 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50'>
                        Confirm ({selected.length}/8)
                    </button>
                </div>
            </div>
        </div>
    );
}
