import { ComponentType } from 'react';
import CineLoveTraditionalInvitation from '../components/CineLoveTraditionalInvitation';
import EmeraldInvitation from '../components/EmeraldInvitationPage';
import RubyBasicInvitation from '../components/RubyBasicInvitation';
import TemplateDashboard from '../components/TemplateDashboard';
import TemplateDashboard99k from '../components/TemplateDashboard99k';

export type WeddingTemplateConfig = {
    id: number;
    code: string;
    name: string;
    description: string;
    previewPath: string;
    editorPath: string;
    legacyPreviewPaths: string[];
    legacyEditorPaths: string[];
    displayComponent: ComponentType;
    editorComponent?: ComponentType;
};

export const weddingTemplateRegistry = {
    EmeraldInvitation: {
        id: 1,
        code: 'EmeraldInvitation',
        name: 'Hỷ Sắc Vu Quy',
        description: 'Tông xanh sang, ảnh nổi bật, hợp với phong cách nhẹ nhàng và tinh tế.',
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
        previewPath: '/CineLoveTraditionalInvitation',
        editorPath: '/CineLoveTraditionalInvitation/edit',
        legacyPreviewPaths: [],
        legacyEditorPaths: [],
        displayComponent: CineLoveTraditionalInvitation,
        editorComponent: undefined,
    },
} satisfies Record<string, WeddingTemplateConfig>;

export type WeddingTemplateCode = keyof typeof weddingTemplateRegistry;

export const weddingTemplateConfigs = Object.values(weddingTemplateRegistry);

export function getWeddingTemplateConfig(code: string) {
    return weddingTemplateRegistry[code as WeddingTemplateCode];
}
