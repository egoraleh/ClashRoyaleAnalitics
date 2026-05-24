import { useEffect, useState } from 'react';
import { Plus, Play, Trash2, Share2 } from 'lucide-react';
import { useAuth } from '@/api/auth-context';
import { listDecks, deleteDeck, publishDeck } from '@/api/decks';
import type { DeckShort, DeckDetails } from '@/api/decks';
import { CreateDeckModal } from '@/app/components/CreateDeckModal';

export function MyDecks() {
    const { user } = useAuth();
    const [decks, setDecks] = useState<DeckShort[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const load = () => {
        if (!user) return;
        setLoading(true);
        listDecks().then(res => setDecks(res.items)).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [user]);

    const handleCreated = (deck: DeckDetails) => {
        setDecks(prev => [{ id: deck.id, name: deck.name, deckType: deck.deckType, strategy: deck.strategy, qualityScore: deck.qualityScore, cards: deck.cards.map(c => ({ id: c.card.id, apiCardId: c.card.apiCardId, name: c.card.name, iconUrl: c.card.iconUrl })) }, ...prev]);
    };

    const handleDelete = async (deckId: number) => {
        try {
            await deleteDeck(deckId);
            setDecks(prev => prev.filter(d => d.id !== deckId));
        } catch { }
    };

    const handlePublish = async (deckId: number) => {
        try {
            const result = await publishDeck(deckId);
            alert(`Deck published! Token: ${result.publicToken}`);
        } catch { }
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='mb-2'>My Decks</h1>
                    <p className='text-muted-foreground'>Manage your saved deck collections</p>
                </div>
                <button onClick={() => setShowCreate(true)} disabled={!user} className='px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-50'>
                    <Plus className='w-4 h-4' />
                    New Deck
                </button>
            </div>

            {!user && (
                <div className='text-center text-muted-foreground py-16 bg-card border border-border rounded-xl'>
                    Sign in to view your decks
                </div>
            )}

            {loading && (
                <div className='text-center text-muted-foreground py-8'>Loading...</div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {decks.length === 0 && !loading && user && (
                    <div className='col-span-full text-center text-muted-foreground py-16 bg-card border border-border rounded-xl'>
                        No decks yet. Create your first deck!
                    </div>
                )}
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className='bg-card border border-border rounded-xl p-6 shadow-xl hover:border-primary/50 transition-all group'
                    >
                        <div className='flex items-start justify-between mb-4'>
                            <div>
                                <h2 className='mb-1'>{deck.name}</h2>
                                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                    <span>{deck.deckType}</span>
                                    {deck.strategy && <><span>•</span><span className='text-[#10b981]'>{deck.strategy}</span></>}
                                </div>
                            </div>
                            <div className='px-3 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'>
                                <span className='text-[#c4b5fd]'>{deck.qualityScore?.toFixed(1) ?? '--'}</span>
                            </div>
                        </div>

                        <div className='grid grid-cols-8 gap-2 mb-4'>
                            {deck.cards.map((card, index) => (
                                <div
                                    key={index}
                                    className='aspect-square rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-all shadow-lg'
                                    title={card.name}
                                >
                                    {card.iconUrl ? (
                                        <img src={card.iconUrl} alt={card.name} className='w-12 h-12 object-contain' />
                                    ) : (
                                        <span className='text-lg'>⚔️</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className='flex gap-2'>
                            <button className='flex-1 py-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors flex items-center justify-center gap-2 text-sm'>
                                <Play className='w-4 h-4' />
                                Use Deck
                            </button>
                            <button onClick={() => handlePublish(deck.id)} className='p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors'>
                                <Share2 className='w-4 h-4' />
                            </button>
                            <button onClick={() => handleDelete(deck.id)} className='p-2 rounded-lg border border-border bg-background/50 hover:bg-destructive hover:border-destructive transition-colors group/delete'>
                                <Trash2 className='w-4 h-4 group-hover/delete:text-destructive-foreground' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {showCreate && <CreateDeckModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
        </div>
    );
}
