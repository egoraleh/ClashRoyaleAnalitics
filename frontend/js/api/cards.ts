import { request } from './client';

export type CardShort = {
    id: number;
    apiCardId: number;
    name: string;
    iconUrl: string | null;
};

export type Card = {
    id: number;
    apiCardId: number;
    name: string;
    elixir: number | null;
    rarity: string | null;
    arena: number | null;
    iconUrl: string | null;
    description: string | null;
    dataJson: Record<string, unknown> | null;
    updatedAt: string;
};

export type CardsPageResponse = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: Card[];
};

export type CardsQuery = {
    rarity?: string;
    elixirMin?: number;
    elixirMax?: number;
    arena?: number;
    search?: string;
    page?: number;
    size?: number;
    refresh?: boolean;
};

export async function listCards(query: CardsQuery = {}): Promise<CardsPageResponse> {
    const params = new URLSearchParams();
    if (query.rarity) params.set('rarity', query.rarity);
    if (query.elixirMin !== undefined) params.set('elixirMin', String(query.elixirMin));
    if (query.elixirMax !== undefined) params.set('elixirMax', String(query.elixirMax));
    if (query.arena !== undefined) params.set('arena', String(query.arena));
    if (query.search) params.set('search', query.search);
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.size !== undefined) params.set('size', String(query.size));
    if (query.refresh) params.set('refresh', 'true');

    const qs = params.toString();
    return request<CardsPageResponse>(`/cards${qs ? `?${qs}` : ''}`);
}

export async function getCard(cardId: number): Promise<Card> {
    return request<Card>(`/cards/${cardId}`);
}
