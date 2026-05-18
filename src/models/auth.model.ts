export interface RegisterRequest {
    fullname: string;
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    email: string;
    fullName?: string;
    fullname?: string;
    role: 'USER' | 'ADMIN' | string;
    status: 'ACTIVE' | 'INACTIVE' | string;
    createdAt: string;
}

export type RegisterResponse = AuthUser;

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleLoginRequest {
    idToken: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresIn: number;
    user: AuthUser;
}

export type RefreshTokenResponse = LoginResponse;
