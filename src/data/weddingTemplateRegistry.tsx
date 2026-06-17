import { ComponentType } from 'react';
import CineLoveTraditionalInvitation from '../components/CineLoveTraditionalInvitation';
import CineLoveTraditionalInvitationEditor from '../components/CineLoveTraditionalInvitationEditor';
import EmeraldInvitation from '../components/EmeraldInvitationPage';
import RubyBasicInvitation from '../components/RubyBasicInvitation';
import TemplateDashboard from '../components/TemplateDashboard';
import TemplateDashboard99k from '../components/TemplateDashboard99k';
import ElegantInvitation from '../components/ElegantInvitation';
import ElegantInvitationEditor from '../components/ElegantInvitationEditor';
import PinkWeddingInvitation from '../components/PinkWeddingInvitation';

export type WeddingTemplateConfig = {
    id: number;
    code: string;
    name: string;
    description: string;
    thumbnailPath?: string;
    previewBgColor?: string;
    previewPath: string;
    editorPath: string;
    legacyPreviewPaths: string[];
    legacyEditorPaths: string[];
    displayComponent: ComponentType;
    editorComponent?: ComponentType;
};

export const weddingTemplateRegistry: Record<string, WeddingTemplateConfig> = {
    EmeraldInvitation: {
        id: 1,
        code: 'EmeraldInvitation',
        name: 'Hỷ Sắc Vu Quy',
        description: 'Tông xanh sang, ảnh nổi bật, hợp với phong cách nhẹ nhàng và tinh tế.',
        thumbnailPath: '/img/template/hy-sac-vu-qui.png',
        previewPath: '/EmeraldInvitation',
        editorPath: '/EmeraldInvitation/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: EmeraldInvitation,
        editorComponent: TemplateDashboard,
    },
    RubyBasicInvitation: {
        id: 2,
        code: 'RubyBasicInvitation',
        name: 'Bến Tình Trăm Năm',
        description: 'Sắc đỏ truyền thống, bố cục rực rỡ và đậm chất ngày cưới Việt.',
        thumbnailPath: '/img/template/ben-tinh-tram-nam.png',
        previewBgColor: '#801d2b',
        previewPath: '/RubyBasicInvitation',
        editorPath: '/RubyBasicInvitation/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: RubyBasicInvitation,
        editorComponent: TemplateDashboard99k,
    },
    CineLoveTraditionalInvitation: {
        id: 3,
        code: 'CineLoveTraditionalInvitation',
        name: 'Duyên Thắm Miệt Vườn',
        description: 'Sắc đỏ trang trọng, bố cục điện ảnh và chi tiết song hỷ dành cho lễ cưới truyền thống.',
        thumbnailPath: '/img/template/duyen-tham-miet-vuon.png',
        previewBgColor: '#e8ebe6',
        previewPath: '/CineLoveTraditionalInvitation',
        editorPath: '/CineLoveTraditionalInvitation/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: CineLoveTraditionalInvitation,
        editorComponent: CineLoveTraditionalInvitationEditor as ComponentType | undefined,
    },
    ElegantInvitation: {
        id: 4,
        code: 'ElegantInvitation',
        name: 'Trăm Năm Bến Đợi',
        description: 'Bố cục vintage quý phái, hoa văn cổ điển kết hợp âm nhạc lãng mạn.',
        thumbnailPath: '/img/template/tram-nam-ben-doi.png',
        previewBgColor: '#eae3db',
        previewPath: '/tram-nam-ben-doi',
        editorPath: '/tram-nam-ben-doi/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: ElegantInvitation,
        editorComponent: ElegantInvitationEditor,
    },
    PinkWeddingInvitation: {
        id: 5,
        code: 'PinkWeddingInvitation',
        name: 'Hoa Hảo Nguyệt Viên',
        description: 'Tông màu hồng mộng mơ, thiết kế tinh tế, hiện đại cho các cặp đôi ngọt ngào.',
        thumbnailPath: '/img/template/hoa-hao-nguyet-vien.png',
        previewBgColor: '#6b2040',
        previewPath: '/THIEPMAUHONG',
        editorPath: '/THIEPMAUHONG/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: PinkWeddingInvitation,
    },
};

export type WeddingTemplateCode = keyof typeof weddingTemplateRegistry;

export const weddingTemplateConfigs = Object.values(weddingTemplateRegistry);

export function getWeddingTemplateConfig(code: string) {
    return weddingTemplateRegistry[code as WeddingTemplateCode];
}
