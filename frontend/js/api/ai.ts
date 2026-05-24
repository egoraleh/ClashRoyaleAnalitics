import { request } from './client';
import type { DeckDetails } from './decks';

export type GenerateDeckRequest = {
    strategy?: string;
    favoriteCardIds?: number[];
    excludedCardIds?: number[];
    minElixir?: number;
    maxElixir?: number;
    saveResult?: boolean;
};

export type GeneratedDeckResponse = {
    deck: DeckDetails;
    explanation: string;
    breakdown: Record<string, unknown>;
};

export type DeckSelection = {
    source: string;
    deckId?: number;
    cards?: { cardId: number; slotNumber: number }[];
};

export type CompareDecksRequest = {
    leftDeck: DeckSelection;
    rightDeck: DeckSelection;
};

export type OneVsOneResult = {
    id: number;
    leftDeck: {
        id: number;
        name: string;
        deckType: string;
        strategy: string | null;
        qualityScore: number | null;
        cards: { id: number; apiCardId: number; name: string; iconUrl: string | null }[];
    };
    rightDeck: {
        id: number;
        name: string;
        deckType: string;
        strategy: string | null;
        qualityScore: number | null;
        cards: { id: number; apiCardId: number; name: string; iconUrl: string | null }[];
    };
    leftScore: number;
    rightScore: number;
    leftBreakdown: Record<string, unknown>;
    rightBreakdown: Record<string, unknown>;
    winnerSide: string;
    resultDescription: string;
    createdAt: string;
};

export type OneVsOneHistoryResponse = {
    items: OneVsOneResult[];
};

export async function generateDeck(data: GenerateDeckRequest): Promise<GeneratedDeckResponse> {
    return request<GeneratedDeckResponse>('/ai/generate-deck', {
        method: 'POST',
        body: data,
        auth: true,
    });
}

export async function compareDecks(data: CompareDecksRequest): Promise<OneVsOneResult> {
    return request<OneVsOneResult>('/1v1/compare', {
        method: 'POST',
        body: data,
    });
}

export async function getComparisonHistory(): Promise<OneVsOneHistoryResponse> {
    return request<OneVsOneHistoryResponse>('/1v1/history', { auth: true });
}
