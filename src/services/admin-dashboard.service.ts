import { API_ENDPOINTS } from '../config/api.config';
import { httpRequest } from './http.service';

export interface RevenueMonth {
    month: string;
    value: string;
}

export interface DonutStats {
    active: number;
    draft: number;
    locked: number;
}

export interface NewUserDto {
    name: string;
    email: string;
    time: string;
}

export interface AdminWeddingCardResponse {
    weddingId: number;
    groomName: string;
    brideName: string;
    slug: string;
    creatorId: number;
    creatorName: string;
    creatorEmail: string;
    status: string;
    createdAt: string;
    viewCount: number;
    previewImg: string;
    promoPrice: string;
    templateName: string;
    category: number;
}

export interface AdminDashboardResponse {
    totalUsers: number;
    activeCards: number;
    totalCards: number;
    totalRevenue: string;
    revenueChart: RevenueMonth[];
    cardStatus: DonutStats;
    newUsers: NewUserDto[];
    recentCards: AdminWeddingCardResponse[];
}

export const adminDashboardService = {
    async getDashboardStats(): Promise<AdminDashboardResponse> {
        const response = await httpRequest<AdminDashboardResponse>(API_ENDPOINTS.ADMIN.DASHBOARD, {
            auth: true,
        });
        if (!response.data) {
            throw new Error("Không thể tải dữ liệu dashboard");
        }
        return response.data;
    },
};
