import { request } from './client';
import type { User } from './auth';
import type { CardShort } from './cards';

export type UserPreferences = {
    playerTag: string;
    preferredStrategy: string | null;
    minElixir: number | null;
    maxElixir: number | null;
    preferredCards: CardShort[];
    excludedCards: CardShort[];
    updatedAt: string;
};

export type ProfileCache = {
    playerName: string | null;
    trophies: number | null;
    bestTrophies: number | null;
    expLevel: number | null;
    currentDeck: CardShort | null;
    rewards: Record<string, unknown> | null;
    profileData: Record<string, unknown> | null;
    battleStats: Record<string, unknown> | null;
    updatedAt: string;
};

export type ProfileResponse = {
    user: User;
    cache: ProfileCache | null;
    preferences: UserPreferences;
};

export type DashboardResponse = {
    playerTag: string;
    summary: Record<string, unknown>;
    charts: Record<string, unknown>;
};

export type RatingPoint = {
    rating: number;
    changedAt: string;
};

export type RatingHistoryResponse = {
    playerTag: string;
    points: RatingPoint[];
};

export type PublicProfileResponse = {
    source: string;
    playerTag: string;
    username: string | null;
    registeredAt: string | null;
    cache: ProfileCache | null;
    ratingHistory: RatingPoint[];
};

export type UpdateProfileRequest = {
    username?: string;
    email?: string;
};

export async function getProfile(): Promise<ProfileResponse> {
    return request<ProfileResponse>('/profiles/me', { auth: true });
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
    return request<User>('/profiles/me', {
        method: 'PUT',
        body: data,
        auth: true,
    });
}

export async function linkClashAccount(playerTag: string): Promise<ProfileResponse> {
    return request<ProfileResponse>('/profiles/link-cr-account', {
        method: 'POST',
        body: { playerTag },
        auth: true,
    });
}

export async function getDashboard(from?: string, to?: string): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return request<DashboardResponse>(`/profiles/me/dashboard${qs ? `?${qs}` : ''}`, { auth: true });
}

export async function refreshProfile(): Promise<void> {
    await request('/profiles/me/refresh', { method: 'POST', auth: true });
}

export async function getPublicProfile(playerTag: string): Promise<PublicProfileResponse> {
    return request<PublicProfileResponse>(`/profiles/${encodeURIComponent(playerTag)}`);
}

export async function getRatingHistory(playerTag: string): Promise<RatingHistoryResponse> {
    return request<RatingHistoryResponse>(`/profiles/${encodeURIComponent(playerTag)}/rating-history`);
}
