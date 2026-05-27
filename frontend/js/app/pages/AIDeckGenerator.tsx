import { useState } from 'react';
import { Sparkles, RefreshCw, Copy } from 'lucide-react';
import { useAuth } from '@/api/auth-context';
import { generateDeck } from '@/api/ai';
import type { GeneratedDeckResponse } from '@/api/ai';

export function AIDeckGenerator() {
    const { user } = useAuth();
    const [playstyle, setPlaystyle] = useState('Cycle');
    const [avgElixir, setAvgElixir] = useState('2.5-3.5');
    const [result, setResult] = useState<GeneratedDeckResponse | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseElixirRange = (range: string): [number, number] => {
        if (range === '4.5+') return [4.5, 10];
        const parts = range.split('-');
        return [parseFloat(parts[0]), parseFloat(parts[1])];
    };

    const handleGenerate = async () => {
        if (!user) return;
        setBusy(true);
        setError(null);
        try {
            const [minElixir, maxElixir] = parseElixirRange(avgElixir);
            const res = await generateDeck({
                strategy: playstyle,
                minElixir,
                maxElixir,
                saveResult: true,
            });
            setResult(res);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Generation failed');
        }
        setBusy(false);
    };

    const deck = result?.deck;
    const cards = deck?.cards ?? [];

    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-4'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-6 flex items-center gap-2'>
                        <Sparkles className='w-5 h-5 text-[#8b5cf6]' />
                        AI Configuration
                    </h2>

                    <div className='space-y-6'>
                        <div>
                            <label className='block mb-3 text-muted-foreground'>Playstyle</label>
                            <div className='grid grid-cols-2 gap-2'>
                                {['Cycle', 'Beatdown', 'Control', 'Siege'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setPlaystyle(style)}
                                        className={`px-4 py-3 rounded-lg border transition-all ${
                                            playstyle === style
                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'border-border bg-background/50 hover:bg-background'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className='block mb-3 text-muted-foreground'>Average Elixir</label>
                            <div className='space-y-2'>
                                {['2.0-2.5', '2.5-3.5', '3.5-4.5', '4.5+'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setAvgElixir(range)}
                                        className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                                            avgElixir === range
                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'border-border bg-background/50 hover:bg-background'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={busy || !user}
                            className='w-full py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50'
                        >
                            <Sparkles className='w-4 h-4' />
                            {busy ? 'Generating...' : 'Generate Deck'}
                        </button>
                        {!user && <p className='text-sm text-muted-foreground text-center'>Sign in to generate decks</p>}
                    </div>
                </div>
            </div>

            <div className='col-span-12 lg:col-span-8'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2>{result ? deck?.name ?? 'Generated Deck' : 'Generated Deck'}</h2>
                        <div className='flex gap-2'>
                            <button className='p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors'>
                                <Copy className='w-4 h-4' />
                            </button>
                            <button onClick={handleGenerate} disabled={busy || !user} className='p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors'>
                                <RefreshCw className='w-4 h-4' />
                            </button>
                        </div>
                    </div>

                    {!result && !error && (
                        <div className='text-center text-muted-foreground py-16'>
                            Configure your preferences and generate a deck
                        </div>
                    )}
                    {error && (
                        <div className='text-center text-red-500 py-4 bg-red-500/10 rounded-lg border border-red-500/30'>
                            {error}
                        </div>
                    )}

                    {result && (
                        <>
                            <div className='grid grid-cols-4 gap-4 mb-6'>
                                {cards.length === 0 && Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className='aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 p-3 flex flex-col items-center justify-center shadow-lg'>
                                        <div className='flex-1 flex items-center justify-center w-full'>
                                            <div className='w-12 h-12 text-muted-foreground/30'>
                                                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='w-full h-full'><rect x='3' y='3' width='18' height='18' rx='2'/></svg>
                                            </div>
                                        </div>
                                        <div className='text-muted-foreground text-xs mt-2'>Empty</div>
                                    </div>
                                ))}
                                {cards.length > 0 && cards.map((card, index) => (
                                    <div
                                        key={index}
                                        className='aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 p-3 flex flex-col items-center justify-center hover:border-primary transition-all group cursor-pointer shadow-lg hover:shadow-primary/20'
                                    >
                                        <div className='flex-1 flex items-center justify-center w-full mb-2'>
                                            {card.card?.iconUrl ? (
                                                <img src={card.card.iconUrl} alt={card.card.name} className='w-full h-full object-contain p-2' />
                                            ) : (
                                                <span className='text-xl'>⚔️</span>
                                            )}
                                        </div>
                                        <div className='text-center mb-1 text-xs leading-tight'>{card.card?.name ?? `Slot ${card.slotNumber}`}</div>
                                        <div className='px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'>
                                            {card.card?.elixir != null && <span className='text-[#c4b5fd] text-xs'>{card.card.elixir}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='grid grid-cols-3 gap-4 mb-6'>
                                <div className='p-4 rounded-lg bg-background/50 border border-border/50'>
                                    <div className='text-sm text-muted-foreground mb-1'>Avg Elixir</div>
                                    <div className='text-xl'>{deck?.metrics?.avgElixir?.toFixed(1) ?? '--'}</div>
                                </div>
                                <div className='p-4 rounded-lg bg-background/50 border border-border/50'>
                                    <div className='text-sm text-muted-foreground mb-1'>Quality Score</div>
                                    <div className='text-xl text-[#10b981]'>{deck?.qualityScore?.toFixed(0) ?? '--'}</div>
                                </div>
                                <div className='p-4 rounded-lg bg-background/50 border border-border/50'>
                                    <div className='text-sm text-muted-foreground mb-1'>Synergy Score</div>
                                    <div className='text-xl text-[#06b6d4]'>{result.breakdown?.synergy ?? '--'}</div>
                                </div>
                            </div>

                            {result.explanation && (
                                <div className='p-4 rounded-lg bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-primary/20'>
                                    <h3 className='mb-2 flex items-center gap-2'>
                                        <Sparkles className='w-4 h-4 text-[#8b5cf6]' />
                                        AI Analysis
                                    </h3>
                                    <p className='text-muted-foreground leading-relaxed'>{result.explanation}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
