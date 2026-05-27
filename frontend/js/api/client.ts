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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
        const text = await response.text().catch(() => 'Unknown error');
        if (response.status === 401 && auth) {
            clearTokens();
        }
        throw new ApiError(text || `HTTP ${response.status}`, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export { request, getTokens, setTokens, clearTokens, getToken, ApiError };
export type { RequestOptions };
