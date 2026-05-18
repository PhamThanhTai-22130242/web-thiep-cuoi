import { AuthUser, LoginResponse } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'accessTokenExpiresAt';
const AUTH_USER_KEY = 'user';

function getStorage() {
    return window.localStorage;
}

function getTokenExpiresAt() {
    const rawExpiresAt = getStorage().getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    const expiresAt = Number(rawExpiresAt);

    return Number.isFinite(expiresAt) ? expiresAt : 0;
}

function isAccessTokenExpired() {
    const accessToken = getStorage().getItem(ACCESS_TOKEN_KEY);
    const expiresAt = getTokenExpiresAt();

    return !accessToken || !expiresAt || Date.now() >= expiresAt;
}

export const authTokenService = {
    setSession(session: LoginResponse) {
        const expiresAt = Date.now() + session.expiresIn * 1000;

        getStorage().setItem(ACCESS_TOKEN_KEY, session.accessToken);
        getStorage().setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt));
        getStorage().setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    },

    setAccessToken(accessToken: string, expiresIn: number) {
        const expiresAt = Date.now() + expiresIn * 1000;

        getStorage().setItem(ACCESS_TOKEN_KEY, accessToken);
        getStorage().setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt));
    },

    getAccessToken() {
        if (isAccessTokenExpired()) {
            this.clearSession();
            return null;
        }

        return getStorage().getItem(ACCESS_TOKEN_KEY);
    },

    getUser(): AuthUser | null {
        if (isAccessTokenExpired()) {
            this.clearSession();
            return null;
        }

        const rawUser = getStorage().getItem(AUTH_USER_KEY);

        if (!rawUser) {
            return null;
        }

        try {
            return JSON.parse(rawUser) as AuthUser;
        } catch {
            return null;
        }
    },

    clearSession() {
        getStorage().removeItem(ACCESS_TOKEN_KEY);
        getStorage().removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
        getStorage().removeItem(AUTH_USER_KEY);
    },

    isAuthenticated() {
        return !isAccessTokenExpired();
    },
};
