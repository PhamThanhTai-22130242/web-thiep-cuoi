export type GuestSide = 'groom' | 'bride';

export type Wish = {
    name: string;
    message: string;
};

export type Rsvp = {
    name: string;
    side: GuestSide;
    attending: string;
};

export type InvitationTemplate = {
    id: string;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    templateUrl: string;
    publicUrl: string;
    api: {
        wishEndpoint: string;
        rsvpEndpoint: string;
    };
    design: {
        primaryColor: string;
        backgroundColor: string;
        accentColor: string;
        scriptFont: string;
        serifFont: string;
        nameSize: number;
        headingSize: number;
        animationSpeed: number;
    };
    couple: {
        groom: string;
        bride: string;
        groomRole: string;
        brideRole: string;
        headline: string;
        quote: string;
    };
    event: {
        date: string;
        dayName: string;
        day: string;
        month: string;
        monthName: string;
        year: string;
        lunar: string;
        time: string;
        venue: string;
        address: string;
        mapUrl: string;
    };
    calendar: {
        weekdays: string[];
        blanks: number;
        days: number[];
    };
    images: {
        cover: string;
        kiss: string;
        walk: string;
        smile: string;
        studio: string;
        thank: string;
        hero?: string;
        groom?: string;
        bride?: string;
        groomQr?: string;
        brideQr?: string;
        gallery?: string[];
    };
    timeline: Array<{
        time: string;
        title: string;
        icon: 'door' | 'ring' | 'glass';
    }>;
    bank: {
        bride: string;
        groom: string;
    };
};

export const defaultInvitationTemplate: InvitationTemplate = {
    id: 'emerald-premium',
    name: 'Emerald Premium',
    slug: 'van-bach-khanh-ly',
    status: 'published',
    templateUrl: 'https://www.nhacohy.vn/mau-emerald-premium',
    publicUrl: 'https://thiepcuoi.local/van-bach-khanh-ly',
    api: {
        wishEndpoint: '',
        rsvpEndpoint: '',
    },
    design: {
        primaryColor: '#2d4b45',
        backgroundColor: '#f8f8f1',
        accentColor: '#c2a113',
        scriptFont: 'Allura',
        serifFont: 'Playfair Display',
        nameSize: 82,
        headingSize: 76,
        animationSpeed: 1,
    },
    couple: {
        groom: 'Văn Bách',
        bride: 'Khánh Ly',
        groomRole: 'Chú rể',
        brideRole: 'Cô dâu',
        headline: 'Sự hiện diện của quý khách là niềm vinh hạnh đối với gia đình chúng tôi',
        quote: 'Lưu giữ những khoảnh khắc ngọt ngào nhất của tình yêu chúng mình',
    },
    event: {
        date: '2026-04-04T10:00:00+07:00',
        dayName: 'Thứ Bảy',
        day: '04',
        month: '04',
        monthName: 'April',
        year: '2026',
        lunar: 'Tức ngày 17 tháng 02 năm Bính Ngọ',
        time: '10 giờ 00',
        venue: 'Trống Đồng Palace Cảnh Hồ',
        address: '173B Đ. Trường Chinh, Khương Mai, Thanh Xuân, Hà Nội',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.420568519887!2d105.81214007504353!3d21.0158515806302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab637bdcd18f%3A0x4b49fd28f46d40e!2zOTEgUC4gTMOhbmcgSOG6oSwgxJDhu5FuZyDEkGEsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1783234416201!5m2!1svi!2s',
    },
    calendar: {
        weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        blanks: 2,
        days: Array.from({ length: 30 }, (_, index) => index + 1),
    },
    images: {
        cover: 'https://api.vesey.vn/templates/vs-template-6/img-content-1-3.webp',
        kiss: 'https://api.vesey.vn/templates/vs-template-6/img-content-3-1.webp',
        walk: 'https://api.vesey.vn/templates/vs-template-6/img-content-4-2.webp',
        smile: 'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=1000&q=85',
        studio: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
        thank: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
        gallery: [

            'https://api.vesey.vn/templates/vs-template-6/img-content-4-2.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-7-1.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-4-3.webp',
            'https://api.vesey.vn/templates/vs-template-6/header-bg.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-3-2.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-6-2.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-3-3.webp',
            'https://api.vesey.vn/templates/vs-template-6/img-content-4-3.webp',

        ],
    },
    timeline: [
        { time: '09:00', title: 'Đón khách', icon: 'door' },
        { time: '10:00', title: 'Lễ thành hôn', icon: 'ring' },
        { time: '11:00', title: 'Khai tiệc', icon: 'glass' },
    ],
    bank: {
        bride: 'Khánh Ly - Vietcombank 0123 456 789',
        groom: 'Văn Bách - Techcombank 9876 543 210',
    },
};

export const defaultRubyInvitationTemplate: InvitationTemplate = {
    ...defaultInvitationTemplate,
    id: 'ruby-basic-99k',
    name: 'Ruby Basic 99k',
    slug: 'ruby-basic',
    templateUrl: '/ben-tinh-tram-nam',
    publicUrl: '/ben-tinh-tram-nam',
    design: {
        ...defaultInvitationTemplate.design,
        primaryColor: '#952535',
        backgroundColor: '#f6e8dc',
        accentColor: '#d8b16a',
        scriptFont: 'Great Vibes',
        serifFont: 'Cormorant Garamond',
    },
    couple: {
        groom: 'Thế Vinh',
        bride: 'Tuyết Mai',
        groomRole: 'Chú rể',
        brideRole: 'Cô dâu',
        headline: 'Sự hiện diện của quý khách là niềm vinh hạnh đối với gia đình chúng tôi',
        quote: 'Tình yêu không chỉ là một danh từ - nó là một động từ; nó là sự chăm sóc, chia sẻ và cùng nhau vượt qua khó khăn',
    },
    event: {
        date: '2026-05-16T11:00:00+07:00',
        dayName: 'Thứ Bảy',
        day: '16',
        month: '05',
        monthName: 'May',
        year: '2026',
        lunar: 'Tức ngày 30 tháng 03 năm Bính Ngọ',
        time: '11 giờ 00',
        venue: 'Diamond Palace',
        address: '91 Láng Hạ, Láng Hạ, Đống Đa, Hà Nội',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2633.5718430505244!2d105.81355598574797!3d21.01535306242635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0632b61b6d%3A0x4301f5b11e6ce760!2zS2hydWEgQmFhbiBUaGFpIOKAkyAzNTggVGjDoWkgSMOg!5e0!3m2!1svi!2s!4v1783233185619!5m2!1svi!2s',
    },
    calendar: {
        weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        blanks: 4,
        days: Array.from({ length: 31 }, (_, index) => index + 1),
    },
    images: {
        cover: 'https://api.vesey.vn/templates/vs-template-lora/img-content-2-1.webp',
        kiss: 'https://api.vesey.vn/templates/vs-template-lora/img-content-5-1.webp',
        walk: 'https://api.vesey.vn/templates/vs-template-lora/img-content-3-2.webp',
        smile: 'https://api.vesey.vn/templates/vs-template-lora/img-content-3-2.webp',
        studio: 'https://api.vesey.vn/templates/vs-template-lora/img-content-7-3.webp',
        thank: 'https://images.unsplash.com/photo-1460364117572-c27386c75174?auto=format&fit=crop&w=1200&q=85',
        gallery: [
            'https://api.vesey.vn/templates/vs-template-lora/img-content-9-1.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-content-5-1.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-header-1.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-content-7-4.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-content-2-3.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-content-2-4.webp',
            'https://api.vesey.vn/templates/vs-template-lora/img-content-3-2.webp',

        ],
    },
    timeline: [
        { time: '10:00', title: 'Đón khách', icon: 'door' },
        { time: '11:00', title: 'Lễ thành hôn', icon: 'ring' },
        { time: '12:00', title: 'Khai tiệc', icon: 'glass' },
    ],
    bank: {
        bride: 'Tuyết Mai - Vietcombank 0987 654 321',
        groom: 'Thế Vinh - Techcombank 0123 456 789',
    },
};

export const defaultCineLoveInvitationTemplate: InvitationTemplate = {
    ...defaultInvitationTemplate,
    id: 'cine-love-traditional',
    name: 'Duyên Thắm Miệt Vườn',
    slug: 'duyen-tham-miet-vuon',
    templateUrl: '/duyen-tham-miet-vuon',
    publicUrl: '/duyen-tham-miet-vuon',
    design: {
        ...defaultInvitationTemplate.design,
        primaryColor: '#8a1d22',
        backgroundColor: '#fbf9f4',
        accentColor: '#cda851',
        scriptFont: 'Allura',
        serifFont: 'Playfair Display',
    },
    couple: {
        groom: 'Thanh Huy',
        bride: 'Phương Thúy',
        groomRole: 'Chú rể',
        brideRole: 'Cô dâu',
        headline: 'Trân Trọng Kính Mời',
        quote: 'Yêu nhau trăm năm tình chẳng nhạt, thương nhau bạc đầu nghĩa vẫn sâu',
    },
    event: {
        date: '2026-11-16T12:00:00+07:00',
        dayName: 'Thứ Hai',
        day: '16',
        month: '11',
        monthName: 'November',
        year: '2026',
        lunar: 'Tức ngày 07 tháng 10 năm Bính Ngọ',
        time: '12 giờ 00',
        venue: 'Nhà hàng Diamond Palace',
        address: 'Hai Bà Trưng, Hà Nội',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1358896720753!2d106.67251457481832!3d10.800902689349323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529281040a431%3A0x7ff3572ff87b852a!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgLSBUaeG7h2MgY8aw4bubaSBEaWFtb25kIFBsYWNl!5e0!3m2!1svi!2s!4v1783237472531!5m2!1svi!2s',
    },
    images: {
        cover: 'https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
        kiss: '	https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
        walk: '	https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
        smile: '	https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
        studio: 'https://i.pinimg.com/736x/e4/c4/f0/e4c4f0b2f8a846c433390c52ebec90c7.jpg',
        thank: 'https://i.pinimg.com/736x/d6/3c/6f/d63c6f60032e18d6ea8e947716f9479b.jpg',
        hero: 'https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
        groom: 'https://cdn.chungdoi.com/uploads/c23522cb-416d-4057-a7f2-efb404a603b4.jpg',
        bride: '	https://cdn.chungdoi.com/uploads/aad57b50-3fb4-41d6-9e89-e4ac116708a3.jpg',
        groomQr: 'https://img.vietqr.io/image/VCB-9383216200-compact2.png?amount=0&addInfo=Mung%20cuoi%20chu%20re&accountName=Pham%20Ha%20Do',
        brideQr: 'https://img.vietqr.io/image/MB-1001652007-compact2.png?amount=0&addInfo=Mung%20cuoi%20co%20dau&accountName=Nguyen%20Thi%20Giang%20Thanh',
        gallery: [
            'https://cdn.chungdoi.com/uploads/82661139-d397-4e3e-8633-92bfc815f36b.jpg',
            '	https://cdn.chungdoi.com/uploads/dcc457f3-aa92-48a6-a932-38c919888abf.jpg',
            'https://cdn.chungdoi.com/uploads/7303a48d-0dd9-4358-8ad1-d9969b8ae75e.jpg',
            'https://cdn.chungdoi.com/uploads/e3e35fc4-fd63-4fb3-b055-7d0e542d3226.jpg',
            'https://cdn.chungdoi.com/uploads/bbc734ce-d1c2-4c5b-8f84-196272e8b371.jpg',
            'https://cdn.chungdoi.com/uploads/78c07254-2dbb-4d84-b76b-3bf73e7ca672.jpg',
            'https://cdn.chungdoi.com/uploads/357c48fa-92bd-48ea-a7f3-36cec6fdfd3b.jpg'
        ]
    }
};

export const defaultElegantInvitationTemplate: InvitationTemplate = {
    ...defaultInvitationTemplate,
    id: 'elegant-premium',
    name: 'Trăm Năm Bến Đợi',
    slug: 'tram-nam-ben-doi',
    templateUrl: '/tram-nam-ben-doi',
    publicUrl: '/tram-nam-ben-doi',
    design: {
        ...defaultInvitationTemplate.design,
        primaryColor: '#0c322c',
        backgroundColor: '#f6f4f0',
        accentColor: '#d1a84f',
        scriptFont: 'Allura',
        serifFont: 'Playfair Display',
    },
    couple: {
        groom: 'Thanh Sơn',
        bride: 'Diệu Nhi',
        groomRole: 'Chú rể',
        brideRole: 'Cô dâu',
        headline: 'Trân trọng kính mời',
        quote: 'Yêu thương đong đầy, trăm năm hạnh phúc',
    },
    event: {
        date: '2026-12-31T08:00:00+07:00',
        dayName: 'Thứ Năm',
        day: '31',
        month: '12',
        monthName: 'December',
        year: '2026',
        lunar: 'Tức ngày 22 tháng 11 năm Bính Ngọ',
        time: '08 giờ 00',
        venue: 'Tư gia nhà trai',
        address: '43A ngõ 26 Phạm Ngọc Thạch, Đống Đa, TP. Hà Nội',
        mapUrl: 'https://maps.google.com',
    },
    images: {
        cover: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774083011748-1773752594568-1768964174030-615120422_925471073144357_5596178545909683221_n-cropped.webp',
        kiss: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773827069067-1768964171283-615345224_925470689811062_7585168431261975884_n.webp',
        walk: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773840525498-1768964164483-615561845_925470776477720_6829025550080629353_n.webp',
        smile: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078485365-1768964172658-615230427_925470969811034_7650799844769027040_n.webp',
        studio: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078746116-1768964168632-615384719_925470186477779_6557986561779589458_n.webp',
        thank: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774079955594-1768964158904-615722702_925470336477764_5506631755238654106_n.webp',
        gallery: [
            'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078485365-1768964172658-615230427_925470969811034_7650799844769027040_n.webp',
            'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078746116-1768964168632-615384719_925470186477779_6557986561779589458_n.webp',
            'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774079955594-1768964158904-615722702_925470336477764_5506631755238654106_n.webp',
            'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774080179841-1768964157102-615400830_925471493144315_1411328482513847053_n.webp'
        ]
    }
};

export const defaultPinkInvitationTemplate: InvitationTemplate = {
    ...defaultInvitationTemplate,
    id: 'pink-wedding',
    name: 'Hoa Hảo Nguyệt Viên',
    slug: 'hoa-hao-nguyet-vien',
    templateUrl: '/hoa-hao-nguyet-vien',
    publicUrl: '/hoa-hao-nguyet-vien',
    design: {
        ...defaultInvitationTemplate.design,
        primaryColor: '#ea8185',
        backgroundColor: '#fff2f3',
        accentColor: '#d39396',
        scriptFont: 'Allura',
        serifFont: 'Playfair Display',
    },
    couple: {
        groom: 'Nhật Minh',
        bride: 'Khánh Vy',
        groomRole: 'Chú rể',
        brideRole: 'Cô dâu',
        headline: 'Trân trọng kính mời',
        quote: 'Tình yêu đơm hoa kết trái, trăm năm hòa hợp',
    },
    event: {
        date: '2026-10-10T11:00:00+07:00',
        dayName: 'Thứ Bảy',
        day: '10',
        month: '10',
        monthName: 'October',
        year: '2026',
        lunar: 'Tức ngày 29 tháng 08 năm Bính Ngọ',
        time: '11:00',
        venue: 'Nhà hàng Wedding Palace',
        address: 'Hồ Tây, Hà Nội',
        mapUrl: 'https://maps.google.com',
    },
    images: {
        cover: 'https://cdn.chungdoi.com/uploads/4c1bb136-36f4-40bd-acd7-514250c33150.jpg',
        kiss: 'https://cdn.chungdoi.com/uploads/4c1bb136-36f4-40bd-acd7-514250c33150.jpg',
        walk: '	https://cdn.chungdoi.com/uploads/3ef698dd-f3ae-41d7-b6c3-96c963807f9f.jpg',
        smile: '	https://cdn.chungdoi.com/uploads/dae67a34-f972-432c-b825-b990d6434a44.jpg',
        studio: 'https://cdn.chungdoi.com/uploads/570c5399-a7be-4adf-8d22-374b628321c0.jpg',
        thank: 'https://cdn.chungdoi.com/uploads/abf11049-4a12-4353-8562-4646dd6514a1.jpg',
        gallery: [
            '	https://cdn.chungdoi.com/uploads/b348b969-a01d-4354-a70c-086d79ecdf71.jpg',
            'https://cdn.chungdoi.com/uploads/d2ff077c-5a82-4eb4-bd56-0e263dca9b50.jpg',
            '	https://cdn.chungdoi.com/uploads/0846b5ff-8d55-47d2-8a6f-758dbf5eedf5.jpg',
            '	https://cdn.chungdoi.com/uploads/0b731ac9-0aee-4779-b751-722d1fef90d5.jpg',
            'https://cdn.chungdoi.com/uploads/052c6d0b-0eba-42b9-ad38-9e03dcecb34b.jpg',
            'https://cdn.chungdoi.com/uploads/4c1bb136-36f4-40bd-acd7-514250c33150.jpg',

        ]
    }
};

export const defaultWishes: Wish[] = [
    { name: 'Nguyễn Minh Tân', message: 'Tuyệt vời, chúc hai bạn một đời an yên.' },
    { name: 'Sơn Tùng', message: 'Chúc vợ chồng trăm năm hạnh phúc.' },
    { name: 'Người em đáng ghét', message: 'Ngày cưới thật đẹp, cười thật nhiều nha.' },
];

export const templateStorageKey = 'harmony.invitationTemplates';
export const templatePreviewStorageKey = 'harmony.invitationPreviewTemplate';
export const rubyTemplateStorageKey = 'harmony.invitationTemplates.99k';
export const rubyTemplatePreviewStorageKey = 'harmony.invitationPreviewTemplate.99k';
export const cineLovePreviewStorageKey = 'harmony.invitationPreviewTemplate.cineLove';
export const elegantPreviewStorageKey = 'harmony.invitationPreviewTemplate.elegant';
export const pinkPreviewStorageKey = 'harmony.invitationPreviewTemplate.pink';
const templatePreviewDatabaseName = 'harmonyInvitationPreview';
const templatePreviewStoreName = 'templates';

function openTemplatePreviewDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(templatePreviewDatabaseName, 1);

        request.onupgradeneeded = () => {
            request.result.createObjectStore(templatePreviewStoreName);
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function writePreviewToDatabase(template: InvitationTemplate, storageKey = templatePreviewStorageKey) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const database = await openTemplatePreviewDatabase();
            const transaction = database.transaction(templatePreviewStoreName, 'readwrite');
            const store = transaction.objectStore(templatePreviewStoreName);
            store.put(template, storageKey);
            transaction.oncomplete = () => {
                database.close();
                resolve();
            };
            transaction.onerror = () => {
                database.close();
                reject(transaction.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

function readPreviewFromDatabase(storageKey = templatePreviewStorageKey) {
    return new Promise<InvitationTemplate | null>(async (resolve, reject) => {
        try {
            const database = await openTemplatePreviewDatabase();
            const transaction = database.transaction(templatePreviewStoreName, 'readonly');
            const request = transaction.objectStore(templatePreviewStoreName).get(storageKey);
            request.onsuccess = () => resolve((request.result as InvitationTemplate | undefined) || null);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => database.close();
        } catch (error) {
            reject(error);
        }
    });
}

export async function savePreviewInvitationTemplate(template: InvitationTemplate, storageKey = templatePreviewStorageKey) {
    if (typeof window === 'undefined') {
        return;
    }

    await writePreviewToDatabase(template, storageKey);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(template));
    } catch {
        // IndexedDB is the source of truth. The localStorage copy is only a small-data fallback.
    }
}

export async function saveCineLovePreview(data: unknown, storageKey = cineLovePreviewStorageKey) {
    if (typeof window === 'undefined') {
        return;
    }

    await writePreviewToDatabase(data as InvitationTemplate, storageKey);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
        // IndexedDB is the source of truth. localStorage is only a fallback.
    }
}

export async function loadCineLovePreview(storageKey = cineLovePreviewStorageKey): Promise<unknown | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = await readPreviewFromDatabase(storageKey);
        if (stored) {
            return stored;
        }
    } catch {
        // Fall back to localStorage below.
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        window.localStorage.removeItem(storageKey);
        return null;
    }
}

export async function saveElegantPreview(data: unknown, storageKey = elegantPreviewStorageKey) {
    if (typeof window === 'undefined') {
        return;
    }

    await writePreviewToDatabase(data as InvitationTemplate, storageKey);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
        // IndexedDB is the source of truth. localStorage is only a fallback.
    }
}

export async function loadElegantPreview(storageKey = elegantPreviewStorageKey): Promise<unknown | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = await readPreviewFromDatabase(storageKey);
        if (stored) {
            return stored;
        }
    } catch {
        // Fall back to localStorage below.
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        window.localStorage.removeItem(storageKey);
        return null;
    }
}

export async function savePinkPreview(data: unknown, storageKey = pinkPreviewStorageKey) {
    if (typeof window === 'undefined') {
        return;
    }

    await writePreviewToDatabase(data as InvitationTemplate, storageKey);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
        // IndexedDB is the source of truth. localStorage is only a fallback.
    }
}

export async function loadPinkPreview(storageKey = pinkPreviewStorageKey): Promise<unknown | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = await readPreviewFromDatabase(storageKey);
        if (stored) {
            return stored;
        }
    } catch {
        // Fall back to localStorage below.
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        window.localStorage.removeItem(storageKey);
        return null;
    }
}


export async function loadPreviewInvitationTemplate(storageKey = templatePreviewStorageKey) {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const storedPreview = await readPreviewFromDatabase(storageKey);
        if (storedPreview) {
            return storedPreview;
        }
    } catch {
        // Fall back to the localStorage mirror below.
    }

    try {
        const stored = window.localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) as InvitationTemplate : null;
    } catch {
        window.localStorage.removeItem(storageKey);
        return null;
    }
}

export function loadStoredInvitationTemplate(storageKey = templateStorageKey, fallbackTemplate = defaultInvitationTemplate) {
    if (typeof window === 'undefined') {
        return fallbackTemplate;
    }

    try {
        const stored = window.localStorage.getItem(storageKey);
        if (!stored) {
            return fallbackTemplate;
        }

        const templates = JSON.parse(stored) as InvitationTemplate[];
        return templates.find((template) => template.status === 'published') || templates[0] || fallbackTemplate;
    } catch {
        return fallbackTemplate;
    }
}
