import { useEffect, useState } from 'react';
import { Swords } from 'lucide-react';
import { useAuth } from '@/api/auth-context';
import { compareDecks } from '@/api/ai';
import { listDecks } from '@/api/decks';
import { AiCardsPicker } from '@/app/components/AiCardsPicker';
import type { OneVsOneResult } from '@/api/ai';
import type { DeckShort, CardShort } from '@/api/decks';

type SideDeck = {
    source: string;
    deckId?: number;
    cards?: { cardId: number; slotNumber: number }[];
};

type PickedCard = {
    cardId: number;
    name: string;
    iconUrl: string | null;
    elixir: number | null;
};

export function DeckComparison() {
    const { user } = useAuth();
    const [savedDecks, setSavedDecks] = useState<DeckShort[]>([]);
    const [leftSelection, setLeftSelection] = useState<'saved' | 'custom' | null>(null);
    const [rightSelection, setRightSelection] = useState<'saved' | 'custom' | null>(null);
    const [leftSavedId, setLeftSavedId] = useState<number | null>(null);
    const [rightSavedId, setRightSavedId] = useState<number | null>(null);
    const [leftCards, setLeftCards] = useState<PickedCard[]>([]);
    const [rightCards, setRightCards] = useState<PickedCard[]>([]);
    const [picking, setPicking] = useState<'left' | 'right' | null>(null);
    const [result, setResult] = useState<OneVsOneResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        listDecks().then(res => setSavedDecks(res.items)).catch(() => {});
    }, [user]);

    const buildSide = (side: 'left' | 'right'): SideDeck | null => {
        const sel = side === 'left' ? leftSelection : rightSelection;
        if (sel === 'saved') {
            const id = side === 'left' ? leftSavedId : rightSavedId;
            if (!id) return null;
            return { source: 'SAVED', deckId: id };
        }
        if (sel === 'custom') {
            const cards = side === 'left' ? leftCards : rightCards;
            if (cards.length !== 8) return null;
            return { source: 'MANUAL', cards: cards.map((c, i) => ({ cardId: c.cardId, slotNumber: i + 1 })) };
        }
        return null;
    };

    const handleCompare = async () => {
        setError('');
        const left = buildSide('left');
        const right = buildSide('right');
        if (!left || !right) { setError('Select 8 cards for both decks'); return; }
        setBusy(true);
        try {
            const res = await compareDecks({ leftDeck: left, rightDeck: right });
            setResult(res);
        } catch { setError('Comparison failed'); }
        setBusy(false);
    };

    const selectedDeck = (side: 'left' | 'right') => {
        return side === 'left'
            ? savedDecks.find(d => d.id === leftSavedId)
            : savedDecks.find(d => d.id === rightSavedId);
    };

    const pickedCards = (side: 'left' | 'right') => side === 'left' ? leftCards : rightCards;
    const setPickedCards = (side: 'left' | 'right') => (cards: PickedCard[]) => {
        if (side === 'left') setLeftCards(cards); else setRightCards(cards);
    };

    const leftData = leftSelection === 'saved' ? selectedDeck('left') : null;
    const rightData = rightSelection === 'saved' ? selectedDeck('right') : null;
    const leftCardList = leftSelection === 'saved' ? (leftData?.cards ?? []) : leftCards;
    const rightCardList = rightSelection === 'saved' ? (rightData?.cards ?? []) : rightCards;

    const DeckPanel = ({ title, cards, score }: { title: string; cards: (CardShort | PickedCard)[]; score: number }) => (
        <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
            <h2 className='mb-4'>{title}</h2>
            <div className='grid grid-cols-4 gap-3 mb-4'>
                {cards.map((card, i) => (
                    <div key={i} className='aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 p-4 flex flex-col items-center justify-center shadow-lg'>
                        {'iconUrl' in card && card.iconUrl ? (
                            <img src={card.iconUrl} alt={card.name} className='w-16 h-16 object-contain mb-3' />
                        ) : (
                            <div className='w-16 h-16 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-3 text-2xl'>⚔️</div>
                        )}
                        <div className='text-sm text-center mb-2 leading-tight font-medium'>{card.name}</div>
                        {'elixir' in card && card.elixir != null && (
                            <div className='px-3 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-xs'>
                                <span className='text-[#c4b5fd]'>{card.elixir}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className='text-center text-lg font-bold'>{score > 0 ? `${Math.round(score)}%` : '--'}</div>
        </div>
    );

    return (
        <div className='space-y-6'>
            <div className='text-center'>
                <h1 className='mb-2'>Deck Comparison</h1>
                <p className='text-muted-foreground'>Compare two decks in a simulated 1v1 matchup</p>
            </div>

            <div className='grid grid-cols-12 gap-6'>
                <div className='col-span-12 lg:col-span-5'>
                    <h3 className='mb-3'>Deck A</h3>
                    <div className='space-y-3'>
                        <div className='flex gap-2'>
                            <button onClick={() => { setLeftSelection('saved'); setLeftCards([]); }} className={`flex-1 py-2 rounded-lg border transition-all ${leftSelection === 'saved' ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background/50 hover:bg-background'}`}>From Saved</button>
                            <button onClick={() => { setLeftSelection('custom'); setLeftSavedId(null); }} className={`flex-1 py-2 rounded-lg border transition-all ${leftSelection === 'custom' ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background/50 hover:bg-background'}`}>Custom</button>
                        </div>
                        {leftSelection === 'saved' && (
                            <select value={leftSavedId ?? ''} onChange={e => setLeftSavedId(Number(e.target.value) || null)} className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'>
                                <option value=''>-- Select deck --</option>
                                {savedDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        )}
                        {leftSelection === 'custom' && (
                            <button onClick={() => setPicking('left')} className='w-full py-3 rounded-lg border border-dashed border-border bg-background/30 hover:bg-background/50 transition-colors text-sm text-muted-foreground'>
                                {leftCards.length > 0 ? `${leftCards.length}/8 cards selected` : 'Pick 8 cards...'}
                            </button>
                        )}
                    </div>
                    {leftData && <DeckPanel title='Deck A' cards={leftData.cards} score={result?.leftScore ?? 0} />}
                    {leftSelection === 'custom' && leftCards.length === 8 && <DeckPanel title='Deck A' cards={leftCards} score={result?.leftScore ?? 0} />}
                </div>

                <div className='col-span-12 lg:col-span-2 flex items-center justify-center'>
                    <div className='bg-card border border-border rounded-xl p-6 shadow-xl w-full'>
                        <div className='flex flex-col items-center gap-4'>
                            <Swords className='w-8 h-8 text-[#8b5cf6]' />
                            <button onClick={handleCompare} disabled={busy} className='px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50'>
                                {busy ? '...' : 'Compare'}
                            </button>
                            {error && <div className='text-xs text-[#ef4444]'>{error}</div>}
                            {result && (
                                <>
                                    <div className='text-2xl'>{Math.round(Math.max(result.leftScore, result.rightScore))}%</div>
                                    <div className='text-sm text-muted-foreground'>Top Score</div>
                                    <div className='w-full h-px bg-border' />
                                    <div className='text-primary'>
                                        {result.winnerSide === 'LEFT' ? 'Deck A' : result.winnerSide === 'RIGHT' ? 'Deck B' : result.winnerSide === 'DRAW' ? 'Draw' : '--'}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>Predicted Winner</div>
                                    {result.resultDescription && <div className='text-xs text-center text-muted-foreground'>{result.resultDescription}</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className='col-span-12 lg:col-span-5'>
                    <h3 className='mb-3'>Deck B</h3>
                    <div className='space-y-3'>
                        <div className='flex gap-2'>
                            <button onClick={() => { setRightSelection('saved'); setRightCards([]); }} className={`flex-1 py-2 rounded-lg border transition-all ${rightSelection === 'saved' ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background/50 hover:bg-background'}`}>From Saved</button>
                            <button onClick={() => { setRightSelection('custom'); setRightSavedId(null); }} className={`flex-1 py-2 rounded-lg border transition-all ${rightSelection === 'custom' ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background/50 hover:bg-background'}`}>Custom</button>
                        </div>
                        {rightSelection === 'saved' && (
                            <select value={rightSavedId ?? ''} onChange={e => setRightSavedId(Number(e.target.value) || null)} className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'>
                                <option value=''>-- Select deck --</option>
                                {savedDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        )}
                        {rightSelection === 'custom' && (
                            <button onClick={() => setPicking('right')} className='w-full py-3 rounded-lg border border-dashed border-border bg-background/30 hover:bg-background/50 transition-colors text-sm text-muted-foreground'>
                                {rightCards.length > 0 ? `${rightCards.length}/8 cards selected` : 'Pick 8 cards...'}
                            </button>
                        )}
                    </div>
                    {rightData && <DeckPanel title='Deck B' cards={rightData.cards} score={result?.rightScore ?? 0} />}
                    {rightSelection === 'custom' && rightCards.length === 8 && <DeckPanel title='Deck B' cards={rightCards} score={result?.rightScore ?? 0} />}
                </div>
            </div>

            {result && (
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4'>Matchup Analysis</h2>
                    <div className='space-y-3'>
                        {result.leftBreakdown && result.rightBreakdown && Object.keys(result.leftBreakdown as Record<string, string>).map((key) => {
                            const lb = result.leftBreakdown as Record<string, string>;
                            const rb = result.rightBreakdown as Record<string, string>;
                            return (
                                <div key={key} className='flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50'>
                                    <span className='w-32 text-sm text-muted-foreground'>{key}</span>
                                    <span className='flex-1 text-right text-sm'>{lb[key] ?? '--'}</span>
                                    <span className='flex-1 text-sm'>{rb[key] ?? '--'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {picking && <AiCardsPicker side={picking} onClose={() => setPicking(null)} onPick={(cards) => { setPickedCards(picking)(cards); setPicking(null); }} />}
        </div>
    );
}
