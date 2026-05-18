import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { RefreshTokenResponse } from '../models/auth.model';
import { authTokenService } from './auth-token.service';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpRequestOptions<TBody> {
    method?: RequestMethod;
    body?: TBody;
    headers?: HeadersInit;
    auth?: boolean;
    skipRefresh?: boolean;
}

export class ApiError extends Error {
    status: number;
    code?: number;
    data?: unknown;

    constructor(message: string, status: number, code?: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

function buildUrl(path: string) {
    return `${API_CONFIG.BASE_URL}${path}`;
}

function isSuccessCode(code: number) {
    return code >= 200 && code < 300;
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text();

    if (!text) {
        return {
            code: response.status,
            data: null,
            message: response.ok ? 'Success' : response.statusText,
            timestamp: new Date().toISOString(),
        };
    }

    return JSON.parse(text) as ApiResponse<T>;
}

async function refreshAccessToken() {
    const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const payload = await parseJsonResponse<RefreshTokenResponse>(response);
    const statusCode = Number(payload.code || response.status);

    if (!isSuccessCode(statusCode) || !payload.data?.accessToken) {
        authTokenService.clearSession();
        throw new ApiError(payload.message || 'Phiên đăng nhập đã hết hạn.', response.status, statusCode, payload.data);
    }

    authTokenService.setSession(payload.data);
    return payload.data.accessToken;
}

export async function httpRequest<TResponse, TBody = unknown>(
    path: string,
    options: HttpRequestOptions<TBody> = {},
): Promise<ApiResponse<TResponse>> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    try {
        const accessToken = options.auth ? authTokenService.getAccessToken() : null;
        const response = await fetch(buildUrl(path), {
            method: options.method ?? 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
        });

        const payload = await parseJsonResponse<TResponse>(response);
        const statusCode = Number(payload.code || response.status);

        if (statusCode === 401 && options.auth && !options.skipRefresh) {
            const refreshedToken = await refreshAccessToken();

            return httpRequest<TResponse, TBody>(path, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${refreshedToken}`,
                },
                skipRefresh: true,
            });
        }

        if (!isSuccessCode(statusCode)) {
            throw new ApiError(payload.message || 'Request failed', response.status, statusCode, payload.data);
        }

        return payload;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiError('Request timeout. Vui lòng thử lại.', 408);
        }

        throw new ApiError(error instanceof Error ? error.message : 'Không thể kết nối tới máy chủ.', 0);
    } finally {
        window.clearTimeout(timeoutId);
    }
}
