import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { CloudinaryUploadResponse } from '../models/cloudinary.model';
import {
    MyWeddingCardResponse,
    MyWeddingCardSaveRequest,
    WeddingCardWishManagementResponse,
} from '../models/wedding-card.model';
import { authTokenService } from './auth-token.service';
import { httpRequest } from './http.service';

export const weddingCardService = {
    async checkSlugAvailability(slug: string, weddingId?: number) {
        const searchParams = new URLSearchParams({ slug });
        if (weddingId) {
            searchParams.set('weddingId', String(weddingId));
        }

        await httpRequest<{ available: boolean }>(`${API_ENDPOINTS.MY_WEDDING_CARDS}/slug-availability?${searchParams.toString()}`, {
            auth: true,
        });
    },

    async getMyCards() {
        const response = await httpRequest<MyWeddingCardResponse[]>(API_ENDPOINTS.MY_WEDDING_CARDS, {
            auth: true,
        });

        return response.data || [];
    },

    async getMyCard(weddingId: number) {
        const response = await httpRequest<MyWeddingCardResponse>(`${API_ENDPOINTS.MY_WEDDING_CARDS}/${weddingId}`, {
            auth: true,
        });
        if (!response.data) {
            throw new Error('Không tìm thấy thiệp cưới.');
        }
        return response.data;
    },

    async saveMyCard(payload: MyWeddingCardSaveRequest, weddingId?: number) {
        const response = await httpRequest<MyWeddingCardResponse, MyWeddingCardSaveRequest>(
            weddingId ? `${API_ENDPOINTS.MY_WEDDING_CARDS}/${weddingId}` : API_ENDPOINTS.MY_WEDDING_CARDS,
            {
                method: weddingId ? 'PUT' : 'POST',
                body: payload,
                auth: true,
            },
        );
        if (!response.data) {
            throw new Error('Không thể lưu thiệp cưới.');
        }
        return response.data;
    },

    async getMyCardWishes(weddingId: number) {
        const response = await httpRequest<WeddingCardWishManagementResponse[]>(
            `${API_ENDPOINTS.MY_WEDDING_CARDS}/${weddingId}/wishes`,
            {
                auth: true,
            },
        );

        return response.data || [];
    },

    async setWishVisibility(weddingId: number, wishId: number, approved: boolean) {
        const response = await httpRequest<WeddingCardWishManagementResponse, { approved: boolean }>(
            `${API_ENDPOINTS.MY_WEDDING_CARDS}/${weddingId}/wishes/${wishId}/visibility`,
            {
                method: 'PATCH',
                body: { approved },
                auth: true,
            },
        );
        if (!response.data) {
            throw new Error('Không thể cập nhật lời chúc.');
        }
        return response.data;
    },

    async getPublicCardWishesForManagement(slug: string) {
        const response = await httpRequest<WeddingCardWishManagementResponse[]>(
            `/api/wedding-cards/${slug}/wishes/manage`,
        );

        return response.data || [];
    },

    async setPublicWishVisibility(slug: string, wishId: number, approved: boolean) {
        const response = await httpRequest<WeddingCardWishManagementResponse, { approved: boolean }>(
            `/api/wedding-cards/${slug}/wishes/${wishId}/visibility`,
            {
                method: 'PATCH',
                body: { approved },
            },
        );
        if (!response.data) {
            throw new Error('Không thể cập nhật lời chúc.');
        }
        return response.data;
    },

    async uploadImage(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const accessToken = authTokenService.getAccessToken();
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOADS.CLOUDINARY}`, {
            method: 'POST',
            credentials: 'include',
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            body: formData,
        });
        const payload = await response.json();

        if (!response.ok || Number(payload.code || response.status) < 200 || Number(payload.code || response.status) >= 300) {
            throw new Error(payload.message || 'Không thể upload ảnh.');
        }

        const data = payload.data as CloudinaryUploadResponse;
        return data.secureUrl || data.url;
    },
};
