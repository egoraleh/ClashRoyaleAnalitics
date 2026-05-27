const BASE_URL = '/api';

type RequestOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean;
};

function getToken(): string | null {
    const token = localStorage.getItem('access_token');
    return token;
}

function getTokens(): { access: string | null; refresh: string | null } {
    return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token'),
    };
}

function setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

function clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

function getErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === 'string') {
        return body || fallback;
    }
    if (body && typeof body === 'object') {
        const data = body as Record<string, unknown>;
        if (typeof data.message === 'string' && data.message) {
            return data.message;
        }
        if (typeof data.error === 'string' && data.error) {
            return data.error;
        }
    }
    return fallback;
}

async function readBody(response: Response): Promise<unknown> {
    const text = await response.text().catch(() => '');
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function refreshAccessToken(): Promise<string | null> {
    const { refresh } = getTokens();
    if (!refresh) {
        return null;
    }

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!response.ok) {
        clearTokens();
        return null;
    }

    const result = await response.json() as { accessToken: string; refreshToken: string };
    setTokens(result.accessToken, result.refreshToken);
    return result.accessToken;
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
    const { method = 'GET', body, headers = {}, auth = false } = options;

    const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (auth) {
        const token = getToken();
        if (token) {
            reqHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
    };

    if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, fetchOptions);

    if (!response.ok) {
        if (response.status === 401 && auth) {
            const token = retry ? await refreshAccessToken() : null;
            if (token) {
                return request<T>(path, options, false);
            }
            clearTokens();
        }
        const data = await readBody(response);
        throw new ApiError(getErrorMessage(data, `HTTP ${response.status}`), response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export { request, getTokens, setTokens, clearTokens, getToken, ApiError };
export type { RequestOptions };
