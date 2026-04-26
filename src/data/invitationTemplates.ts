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
        mapUrl: 'https://www.google.com/maps?q=Tr%E1%BB%91ng%20%C4%90%E1%BB%93ng%20Palace%20C%E1%BA%A3nh%20H%E1%BB%93&output=embed',
    },
    calendar: {
        weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        blanks: 2,
        days: Array.from({ length: 30 }, (_, index) => index + 1),
    },
    images: {
        cover: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85',
        kiss: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
        walk: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=85',
        smile: 'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=1000&q=85',
        studio: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
        thank: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
        gallery: [
            'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
            'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=85',
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

export const defaultWishes: Wish[] = [
    { name: 'Nguyễn Minh Tân', message: 'Tuyệt vời, chúc hai bạn một đời an yên.' },
    { name: 'Sơn Tùng', message: 'Chúc vợ chồng trăm năm hạnh phúc.' },
    { name: 'Người em đáng ghét', message: 'Ngày cưới thật đẹp, cười thật nhiều nha.' },
];

export const templateStorageKey = 'harmony.invitationTemplates';

export function loadStoredInvitationTemplate() {
    if (typeof window === 'undefined') {
        return defaultInvitationTemplate;
    }

    try {
        const stored = window.localStorage.getItem(templateStorageKey);
        if (!stored) {
            return defaultInvitationTemplate;
        }

        const templates = JSON.parse(stored) as InvitationTemplate[];
        return templates.find((template) => template.status === 'published') || templates[0] || defaultInvitationTemplate;
    } catch {
        return defaultInvitationTemplate;
    }
}
