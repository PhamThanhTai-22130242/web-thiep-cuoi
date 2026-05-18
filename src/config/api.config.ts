export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081',
    TIMEOUT_MS: 15000,
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        GOOGLE_LOGIN: '/api/auth/google',
        REFRESH_TOKEN: '/api/auth/refresh-token',
    },
    ADMIN: {
        USERS: '/api/admin/users',
    },
} as const;
