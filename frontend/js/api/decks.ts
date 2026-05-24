import { request } from './client';
import type { CardShort } from './cards';

export type DeckCardInput = {
    cardId: number;
    slotNumber: number;
};

export type DeckShort = {
    id: number;
    name: string;
    deckType: string;
    strategy: string | null;
    qualityScore: number | null;
    cards: CardShort[];
};

export type DeckCardView = {
    slotNumber: number;
    card: CardShort;
};

export type DeckDetails = {
    id: number;
    ownerPlayerTag: string;
    name: string;
    deckType: string;
    strategy: string | null;
    description: string | null;
    qualityScore: number | null;
    createdAt: string;
    updatedAt: string;
    cards: DeckCardView[];
    metrics: Record<string, unknown> | null;
};

export type DeckListResponse = {
    items: DeckShort[];
};

export type CreateDeckRequest = {
    name: string;
    strategy?: string;
    cards: DeckCardInput[];
};

export type UpdateDeckRequest = {
    name?: string;
    strategy?: string;
    cards?: DeckCardInput[];
};

export type PublishDeckResponse = {
    deckId: number;
    publicToken: string;
    publicUrl: string;
    publishedAt: string;
};

export type PublicDeckResponse = {
    token: string;
    owner: Record<string, unknown>;
    deck: DeckDetails;
};

export async function listDecks(deckType?: string): Promise<DeckListResponse> {
    const params = deckType ? `?deckType=${encodeURIComponent(deckType)}` : '';
    return request<DeckListResponse>(`/decks${params}`, { auth: true });
}

export async function createDeck(data: CreateDeckRequest): Promise<DeckDetails> {
    return request<DeckDetails>('/decks', {
        method: 'POST',
        body: data,
        auth: true,
    });
}

export async function getDeck(deckId: number): Promise<DeckDetails> {
    return request<DeckDetails>(`/decks/${deckId}`, { auth: true });
}

export async function updateDeck(deckId: number, data: UpdateDeckRequest): Promise<DeckDetails> {
    return request<DeckDetails>(`/decks/${deckId}`, {
        method: 'PUT',
        body: data,
        auth: true,
    });
}

export async function deleteDeck(deckId: number): Promise<void> {
    return request<void>(`/decks/${deckId}`, {
        method: 'DELETE',
        auth: true,
    });
}

export async function publishDeck(deckId: number): Promise<PublishDeckResponse> {
    return request<PublishDeckResponse>(`/decks/${deckId}/publish`, {
        method: 'POST',
        auth: true,
    });
}

export async function getPublicDeck(publicToken: string): Promise<PublicDeckResponse> {
    return request<PublicDeckResponse>(`/public/decks/${publicToken}`);
}
