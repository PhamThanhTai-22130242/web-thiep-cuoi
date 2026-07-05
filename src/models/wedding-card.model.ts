export type WeddingCardPerson = {
    role: string;
    fullName?: string;
    shortName?: string;
    avatar?: string;
    familyLable?: string;
    fatherName?: string;
    motherName?: string;
};

export type WeddingCardEvent = {
    inviteText?: string;
    eventDate?: string;
    eventTime?: string;
    venueName?: string;
    address?: string;
    linkMap?: string;
    guestList?: string;
};

export type WeddingCardMedia = {
    slotKey: string;
    imgUrl: string;
    number?: number;
};

export type WeddingCardMusicTrack = {
    fileUrl: string;
    timeStart?: number;
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
    musicTrack?: WeddingCardMusicTrack | null;
    people: WeddingCardPerson[];
    events: WeddingCardEvent[];
    media: WeddingCardMedia[];
};

export type MyWeddingCardSaveRequest = {
    templateCode:
        | 'EmeraldInvitation'
        | 'RubyBasicInvitation'
        | 'CineLoveTraditionalInvitation'
        | 'ElegantInvitation'
        | 'PinkWeddingInvitation';
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
        groomFather?: string;
        groomMother?: string;
        brideFather?: string;
        brideMother?: string;
    };
    event: {
        inviteText?: string;
        eventDate: string;
        eventTime: string;
        venueName: string;
        address: string;
        linkMap: string;
        guestList?: string;
    };
    musicTrack?: WeddingCardMusicTrack | null;
    media: WeddingCardMedia[];
};

export type WeddingCardWishManagementResponse = {
    wishId: number;
    guestName: string;
    message: string;
    isApproved?: boolean;
};
