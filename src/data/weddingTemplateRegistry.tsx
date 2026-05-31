import { ComponentType } from 'react';
import CineLoveTraditionalInvitation from '../components/CineLoveTraditionalInvitation';
import EmeraldInvitation from '../components/EmeraldInvitationPage';
import RubyBasicInvitation from '../components/RubyBasicInvitation';
import TemplateDashboard from '../components/TemplateDashboard';
import TemplateDashboard99k from '../components/TemplateDashboard99k';

type WeddingTemplateConfig = {
    id: number;
    code: string;
    name: string;
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
        name: 'Emerald Classic',
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
        name: 'Song Long Đỏ',
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
        name: 'Hỷ Sự Truyền Thống',
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
