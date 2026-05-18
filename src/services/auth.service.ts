import { API_ENDPOINTS } from '../config/api.config';
import { GoogleLoginRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth.model';
import { authTokenService } from './auth-token.service';
import { httpRequest } from './http.service';

export const authService = {
    register(payload: RegisterRequest) {
        return httpRequest<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: payload,
        });
    },

    async login(payload: LoginRequest) {
        const response = await httpRequest<LoginResponse, LoginRequest>(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: payload,
        });

        if (response.data?.accessToken) {
            authTokenService.setSession(response.data);
        }

        return response;
    },

    async loginWithGoogle(payload: GoogleLoginRequest) {
        const response = await httpRequest<LoginResponse, GoogleLoginRequest>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
            method: 'POST',
            body: payload,
        });

        if (response.data?.accessToken) {
            authTokenService.setSession(response.data);
        }

        return response;
    },
};
