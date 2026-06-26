import { API_ENDPOINTS } from '../config/api.config';
import { httpRequest } from './http.service';

export interface DbTemplate {
    id: number;
    code: string;
    name: string;
    description: string;
    price: string;
    promoPrice: string;
    category: number; // 1, 2, 3
    isHidden: boolean;
    previewImg?: string;
}

export const categoryLabels: Record<number, string> = {
    1: 'Cơ bản',
    2: 'Chuyên nghiệp',
    3: 'Thời thượng',
};

export const packageKeys: Record<number, 'co-ban' | 'chuyen-nghiep' | 'thoi-thuong'> = {
    1: 'co-ban',
    2: 'chuyen-nghiep',
    3: 'thoi-thuong',
};

export const weddingTemplateService = {
    async getPublicTemplates() {
        const response = await httpRequest<DbTemplate[]>(API_ENDPOINTS.TEMPLATES);
        return response.data || [];
    },

    async getAdminTemplates() {
        const response = await httpRequest<DbTemplate[]>(API_ENDPOINTS.ADMIN.TEMPLATES, {
            auth: true,
        });
        return response.data || [];
    },

    async updateTemplate(code: string, payload: { price?: string; promoPrice?: string; category?: number }) {
        const response = await httpRequest<DbTemplate, { price?: string; promoPrice?: string; category?: number }>(
            `${API_ENDPOINTS.ADMIN.TEMPLATES}/${code}`,
            {
                method: 'PUT',
                body: payload,
                auth: true,
            }
        );
        if (!response.data) {
            throw new Error("Không thể cập nhật mẫu thiệp");
        }
        return response.data;
    },

    async toggleTemplateVisibility(code: string, isHidden: boolean) {
        const response = await httpRequest<DbTemplate, { isHidden: boolean }>(
            `${API_ENDPOINTS.ADMIN.TEMPLATES}/${code}/visibility`,
            {
                method: 'PATCH',
                body: { isHidden },
                auth: true,
            }
        );
        if (!response.data) {
            throw new Error("Không thể cập nhật trạng thái hiển thị");
        }
        return response.data;
    },
};
