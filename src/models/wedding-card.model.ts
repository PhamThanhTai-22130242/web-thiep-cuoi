export type WeddingCardPerson = {
    role: string;
    fullName?: string;
    shortName?: string;
    avatar?: string;
    familyLable?: string;
};

export type WeddingCardEvent = {
    inviteText?: string;
    eventDate?: string;
    eventTime?: string;
    venueName?: string;
    address?: string;
    linkMap?: string;
};

export type WeddingCardMedia = {
    slotKey: string;
    imgUrl: string;
    number?: number;
};

export type MyWeddingCardResponse = {
    weddingId: number;
    slug: string;
    status: 'draft' | 'active';
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    themeColor?: string;
    dropEffect?: string;
    template: {
        id: number;
        name: string;
        code: string;
        previewImg?: string;
    };
    people: WeddingCardPerson[];
    events: WeddingCardEvent[];
    media: WeddingCardMedia[];
};

export type MyWeddingCardSaveRequest = {
    templateCode: 'EmeraldInvitation' | 'RubyBasicInvitation';
    slug: string;
    status: 'draft' | 'active';
    design: {
        primaryColor?: string;
        dropEffect?: string;
    };
    couple: {
        groom: string;
        bride: string;
        groomRole: string;
        brideRole: string;
    };
    event: {
        inviteText?: string;
        eventDate: string;
        eventTime: string;
        venueName: string;
        address: string;
        linkMap: string;
    };
    media: WeddingCardMedia[];
};

export type WeddingCardWishManagementResponse = {
    wishId: number;
    guestName: string;
    message: string;
    isApproved?: boolean;
};
