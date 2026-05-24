import { request, setTokens } from './client';

export type User = {
    playerTag: string;
    username: string;
    email: string;
    registeredAt: string;
};

export type AuthSuccessResponse = {
    accessToken: string;
    refreshToken: string;
    user: User;
};

export type TokenPairResponse = {
    accessToken: string;
    refreshToken: string;
};

export async function register(username: string, email: string, password: string, playerTag: string): Promise<AuthSuccessResponse> {
    const result = await request<AuthSuccessResponse>('/auth/register', {
        method: 'POST',
        body: { username, email, password, playerTag },
    });
    setTokens(result.accessToken, result.refreshToken);
    return result;
}

export async function login(username: string, password: string): Promise<AuthSuccessResponse> {
    const result = await request<AuthSuccessResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
    });
    setTokens(result.accessToken, result.refreshToken);
    return result;
}

export async function refreshToken(refreshToken: string): Promise<TokenPairResponse> {
    const result = await request<TokenPairResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
    });
    setTokens(result.accessToken, result.refreshToken);
    return result;
}
