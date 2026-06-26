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
import PinkWeddingInvitationEditor from '../components/PinkWeddingInvitationEditor';

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
    category: string;
    price: string; // Giá cả (regular price)
    promoPrice: string; // Giá khuyến mãi (discounted price)
    status: 'Đang hiển thị' | 'Bản nháp' | 'Đã ẩn';
    uses: string;
    isHidden: boolean;
};

export const weddingTemplateRegistry: Record<string, WeddingTemplateConfig> = {
    EmeraldInvitation: {
        id: 1,
        code: 'EmeraldInvitation',
        name: 'Hỷ Sắc Vu Quy',
        description: 'Biểu tượng của niềm vui, đánh dấu khởi đầu cho hành trình hôn nhân viên mãn.',
        thumbnailPath: '/img/template/hy-sac-vu-qui.png',
        previewPath: '/hy-sac-vu-qui',
        editorPath: '/hy-sac-vu-qui/edit',
        legacyPreviewPaths: ['/EmeraldInvitation'],
        legacyEditorPaths: ['/EmeraldInvitation/edit'],
        displayComponent: EmeraldInvitation,
        editorComponent: TemplateDashboard,
        category: 'Truyền thống',
        price: '199.000đ',
        promoPrice: '99.000đ',
        status: 'Đang hiển thị',
        uses: '1.284',
        isHidden: false,
    },
    RubyBasicInvitation: {
        id: 2,
        code: 'RubyBasicInvitation',
        name: 'Bến Tình Trăm Năm',
        description: 'Sắc đỏ truyền thống, bố cục rực rỡ và đậm chất ngày cưới Việt.',
        thumbnailPath: '/img/template/ben-tinh-tram-nam.png',
        previewBgColor: '#801d2b',
        previewPath: '/ben-tinh-tram-nam',
        editorPath: '/ben-tinh-tram-nam/edit',
        legacyPreviewPaths: ['/RubyBasicInvitation'],
        legacyEditorPaths: ['/RubyBasicInvitation/edit'],
        displayComponent: RubyBasicInvitation,
        editorComponent: TemplateDashboard99k,
        category: 'Truyền thống',
        price: '199.000đ',
        promoPrice: '99.000đ',
        status: 'Đang hiển thị',
        uses: '986',
        isHidden: false,
    },
    CineLoveTraditionalInvitation: {
        id: 3,
        code: 'CineLoveTraditionalInvitation',
        name: 'Duyên Thắm Miệt Vườn',
        description: 'Một thiết kế nhẹ nhàng, dân dã nhưng không kém phần tinh tế, dành cho những cặp đôi yêu nét đẹp chân thành và giản dị.',
        thumbnailPath: '/img/template/duyen-tham-miet-vuon.png',
        previewBgColor: '#e8ebe6',
        previewPath: '/duyen-tham-miet-vuon',
        editorPath: '/duyen-tham-miet-vuon/edit',
        legacyPreviewPaths: ['/CineLoveTraditionalInvitation'],
        legacyEditorPaths: ['/CineLoveTraditionalInvitation/edit'],
        displayComponent: CineLoveTraditionalInvitation,
        editorComponent: CineLoveTraditionalInvitationEditor as ComponentType | undefined,
        category: 'Hiện đại',
        price: '299.000đ',
        promoPrice: '199.000đ',
        status: 'Đang hiển thị',
        uses: '752',
        isHidden: false,
    },
    ElegantInvitation: {
        id: 4,
        code: 'ElegantInvitation',
        name: 'Trăm Năm Bến Đợi',
        description: 'Lấy cảm hứng từ sự chờ đợi đầy ý nghĩa, mẫu thiệp là dấu mốc cho ngày hai người cùng viết tiếp câu chuyện chung của mình.',
        thumbnailPath: '/img/template/tram-nam-ben-doi.png',
        previewBgColor: '#eae3db',
        previewPath: '/tram-nam-ben-doi',
        editorPath: '/tram-nam-ben-doi/edit',
        legacyPreviewPaths: ['/ElegantInvitation'],
        legacyEditorPaths: ['/ElegantInvitation/edit'],
        displayComponent: ElegantInvitation,
        editorComponent: ElegantInvitationEditor,
        category: 'Tối giản',
        price: '299.000đ',
        promoPrice: '199.000đ',
        status: 'Đang hiển thị',
        uses: '612',
        isHidden: false,
    },
    PinkWeddingInvitation: {
        id: 5,
        code: 'PinkWeddingInvitation',
        name: 'Hoa Hảo Nguyệt Viên',
        description: 'Một mẫu thiệp cưới thanh lịch, kết hợp nét đẹp truyền thống với không khí hỷ sự sang trọng và tinh tế',
        thumbnailPath: '/img/template/hoa-hao-nguyet-vien.png',
        previewBgColor: '#6b2040',
        previewPath: '/hoa-hao-nguyet-vien',
        editorPath: '/hoa-hao-nguyet-vien/edit',
        legacyPreviewPaths: ['/THIEPMAUHONG', '/PinkWeddingInvitation'],
        legacyEditorPaths: ['/THIEPMAUHONG/edit', '/PinkWeddingInvitation/edit'],
        displayComponent: PinkWeddingInvitation,
        editorComponent: PinkWeddingInvitationEditor,
        category: 'Sang trọng',
        price: '299.000đ',
        promoPrice: '199.000đ',
        status: 'Đang hiển thị',
        uses: '420',
        isHidden: false,
    },
};

export type WeddingTemplateCode = keyof typeof weddingTemplateRegistry;

export const weddingTemplateConfigs = Object.values(weddingTemplateRegistry);

export function getWeddingTemplateConfig(code: string) {
    return weddingTemplateRegistry[code as WeddingTemplateCode];
}
