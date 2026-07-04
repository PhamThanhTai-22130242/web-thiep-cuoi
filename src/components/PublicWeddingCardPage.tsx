import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    defaultInvitationTemplate,
    defaultRubyInvitationTemplate,
    defaultCineLoveInvitationTemplate,
    defaultElegantInvitationTemplate,
    defaultPinkInvitationTemplate,
    InvitationTemplate,
    Wish,
} from '../data/invitationTemplates';
import EmeraldInvitation from './EmeraldInvitationPage';
import RubyBasicInvitation from './RubyBasicInvitation';
import CineLoveTraditionalInvitation, {
    CineLoveInvitationData,
    defaultCineLoveInvitationData,
} from './CineLoveTraditionalInvitation';
import ElegantInvitation, {
    ElegantInvitationData,
    defaultElegantInvitationData,
} from './ElegantInvitation';
import PinkWeddingInvitation, {
    PinkWeddingInvitationData,
    defaultPinkWeddingInvitationData,
} from './PinkWeddingInvitation';
import { httpRequest } from '../services/http.service';
import { WeddingCardEvent, WeddingCardMedia, WeddingCardPerson } from '../models/wedding-card.model';
import NotFoundPage from './NotFoundPage';
import './PublicWeddingCardPage.css';

export type PublicWeddingCardResponse = {
    slug: string;
    themeColor?: string;
    template: {
        code: string;
        name: string;
    };
    people: WeddingCardPerson[];
    events: WeddingCardEvent[];
    media: WeddingCardMedia[];
    wishes: Array<{
        guestName: string;
        message: string;
        isApproved?: boolean;
    }>;
};

function getDayName(dateValue: string) {
    const date = new Date(`${dateValue}T00:00:00+07:00`);
    return Number.isNaN(date.getTime())
        ? defaultInvitationTemplate.event.dayName
        : new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
}

function toEventDate(dateValue: string, timeValue: string) {
    return `${dateValue || '2026-01-01'}T${timeValue || '00:00'}:00+07:00`;
}

export function mapPublicCardToTemplate(card: PublicWeddingCardResponse): InvitationTemplate {
    let baseTemplate = defaultInvitationTemplate;
    if (card.template.code === 'RubyBasicInvitation') {
        baseTemplate = defaultRubyInvitationTemplate;
    } else if (card.template.code === 'CineLoveTraditionalInvitation') {
        baseTemplate = defaultCineLoveInvitationTemplate;
    } else if (card.template.code === 'ElegantInvitation') {
        baseTemplate = defaultElegantInvitationTemplate;
    } else if (card.template.code === 'PinkWeddingInvitation') {
        baseTemplate = defaultPinkInvitationTemplate;
    }
    const template = JSON.parse(JSON.stringify(baseTemplate)) as InvitationTemplate;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const eventDate = event?.eventDate || template.event.date.slice(0, 10);
    const eventTime = (event?.eventTime || '00:00').slice(0, 5);
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));

    template.slug = card.slug;
    template.publicUrl = `/thiep/${card.slug}`;
    template.api.wishEndpoint = `/api/wedding-cards/${card.slug}/wishes`;
    template.api.rsvpEndpoint = `/api/wedding-cards/${card.slug}/rsvp`;
    template.design.primaryColor = card.themeColor || template.design.primaryColor;
    template.couple.groom = groom?.shortName || groom?.fullName || template.couple.groom;
    template.couple.bride = bride?.shortName || bride?.fullName || template.couple.bride;
    template.couple.groomRole = groom?.familyLable || template.couple.groomRole;
    template.couple.brideRole = bride?.familyLable || template.couple.brideRole;
    template.couple.headline = event?.inviteText || template.couple.headline;
    template.event.date = toEventDate(eventDate, eventTime);
    template.event.dayName = getDayName(eventDate);
    template.event.day = eventDate.slice(8, 10);
    template.event.month = eventDate.slice(5, 7);
    template.event.year = eventDate.slice(0, 4);
    template.event.time = eventTime.replace(':', ' giờ ');
    template.event.venue = event?.venueName || '';
    template.event.address = event?.address || '';
    template.event.mapUrl = event?.linkMap || '';
    template.images.cover = mediaBySlot.get('images.cover') || template.images.cover;
    template.images.kiss = mediaBySlot.get('images.kiss') || template.images.kiss;
    template.images.walk = mediaBySlot.get('images.walk') || template.images.walk;
    template.images.smile = mediaBySlot.get('images.smile') || template.images.smile;
    template.images.studio = mediaBySlot.get('images.studio') || template.images.studio;
    template.images.thank = mediaBySlot.get('images.thank') || template.images.thank;
    template.images.gallery = card.media
        .filter((item) => item.slotKey?.startsWith('images.gallery.'))
        .sort((left, right) => (left.number || 0) - (right.number || 0))
        .map((item) => item.imgUrl);

    return template;
}

export function mapPublicCardToCineLoveData(card: PublicWeddingCardResponse): CineLoveInvitationData {
    const data = JSON.parse(JSON.stringify(defaultCineLoveInvitationData)) as CineLoveInvitationData;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));
    const gallery = card.media
        .filter((item) => item.slotKey?.startsWith('images.gallery.'))
        .sort((left, right) => (left.number || 0) - (right.number || 0))
        .map((item) => item.imgUrl);

    const groomQr = mediaBySlot.get('images.groomQr') || '';
    const brideQr = mediaBySlot.get('images.brideQr') || '';

    data.slug = card.slug;
    data.groomName = groom?.shortName || groom?.fullName || data.groomName;
    data.brideName = bride?.shortName || bride?.fullName || data.brideName;
    data.groomIntroName = groom?.fullName || groom?.shortName || data.groomIntroName;
    data.brideIntroName = bride?.fullName || bride?.shortName || data.brideIntroName;
    data.groomFamilyLabel = groom?.familyLable || data.groomFamilyLabel;
    data.brideFamilyLabel = bride?.familyLable || data.brideFamilyLabel;
    data.groomFather = groom?.fatherName || data.groomFather;
    data.groomMother = groom?.motherName || data.groomMother;
    data.brideFather = bride?.fatherName || data.brideFather;
    data.brideMother = bride?.motherName || data.brideMother;
    data.inviteText = event?.inviteText || data.inviteText;
    data.eventDate = event?.eventDate || data.eventDate;
    data.eventTime = (event?.eventTime || data.eventTime).slice(0, 5);
    data.venueName = event?.venueName || data.venueName;
    data.address = event?.address || data.address;
    data.mapUrl = event?.linkMap || data.mapUrl;
    data.showGroomGift = Boolean(groomQr);
    data.showBrideGift = Boolean(brideQr);
    data.showGiftSection = Boolean(groomQr || brideQr);
    data.images.hero = mediaBySlot.get('images.hero') || data.images.hero;
    data.images.groom = mediaBySlot.get('images.groom') || data.images.groom;
    data.images.bride = mediaBySlot.get('images.bride') || data.images.bride;
    data.images.groomQr = groomQr || data.images.groomQr;
    data.images.brideQr = brideQr || data.images.brideQr;
    data.images.gallery = gallery.length ? gallery : data.images.gallery;

    return data;
}

export function mapPublicCardToElegantData(card: PublicWeddingCardResponse): ElegantInvitationData {
    const data = JSON.parse(JSON.stringify(defaultElegantInvitationData)) as ElegantInvitationData;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));
    const gallery = card.media
        .filter((item) => item.slotKey?.startsWith('images.gallery.'))
        .sort((left, right) => (left.number || 0) - (right.number || 0))
        .map((item) => item.imgUrl);

    const groomQr = mediaBySlot.get('images.groomQr') || '';
    const brideQr = mediaBySlot.get('images.brideQr') || '';

    data.slug = card.slug;
    data.groomName = groom?.shortName || groom?.fullName || data.groomName;
    data.brideName = bride?.shortName || bride?.fullName || data.brideName;
    data.groomIntroName = groom?.fullName || groom?.shortName || data.groomIntroName;
    data.brideIntroName = bride?.fullName || bride?.shortName || data.brideIntroName;
    data.groomFamilyLabel = groom?.familyLable || data.groomFamilyLabel;
    data.brideFamilyLabel = bride?.familyLable || data.brideFamilyLabel;
    data.groomFather = groom?.fatherName || data.groomFather;
    data.groomMother = groom?.motherName || data.groomMother;
    data.brideFather = bride?.fatherName || data.brideFather;
    data.brideMother = bride?.motherName || data.brideMother;
    data.inviteText = event?.inviteText || data.inviteText;
    data.eventDate = event?.eventDate || data.eventDate;
    data.eventTime = (event?.eventTime || data.eventTime).slice(0, 5);
    data.venueName = event?.venueName || data.venueName;
    data.address = event?.address || data.address;
    data.mapUrl = event?.linkMap || data.mapUrl;
    data.showGroomGift = Boolean(groomQr);
    data.showBrideGift = Boolean(brideQr);
    data.showGiftSection = Boolean(groomQr || brideQr);
    data.images.cover = mediaBySlot.get('images.cover') || data.images.cover;
    data.images.hero = mediaBySlot.get('images.hero') || data.images.hero;
    data.images.portraitOne = mediaBySlot.get('images.portraitOne') || data.images.portraitOne;
    data.images.portraitTwo = mediaBySlot.get('images.portraitTwo') || data.images.portraitTwo;
    data.images.groomQr = groomQr || data.images.groomQr;
    data.images.brideQr = brideQr || data.images.brideQr;
    data.images.gallery = gallery.length ? [...gallery, ...Array(Math.max(0, 8 - gallery.length)).fill('')] : data.images.gallery;

    return data;
}

export function mapPublicCardToPinkData(card: PublicWeddingCardResponse): PinkWeddingInvitationData {
    const data = JSON.parse(JSON.stringify(defaultPinkWeddingInvitationData)) as PinkWeddingInvitationData;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));
    const gallery = card.media
        .filter((item) => item.slotKey?.startsWith('images.gallery.'))
        .sort((left, right) => (left.number || 0) - (right.number || 0))
        .map((item) => item.imgUrl)
        .filter(Boolean);

    const groomQr = mediaBySlot.get('images.groomQr') || '';
    const brideQr = mediaBySlot.get('images.brideQr') || '';

    data.slug = card.slug;
    data.groomName = groom?.shortName || groom?.fullName || data.groomName;
    data.brideName = bride?.shortName || bride?.fullName || data.brideName;
    data.groomIntroName = groom?.fullName || groom?.shortName || data.groomIntroName;
    data.brideIntroName = bride?.fullName || bride?.shortName || data.brideIntroName;
    data.groomFamilyLabel = groom?.familyLable || data.groomFamilyLabel;
    data.brideFamilyLabel = bride?.familyLable || data.brideFamilyLabel;
    data.groomFather = groom?.fatherName || data.groomFather;
    data.groomMother = groom?.motherName || data.groomMother;
    data.brideFather = bride?.fatherName || data.brideFather;
    data.brideMother = bride?.motherName || data.brideMother;
    data.inviteText = event?.inviteText || data.inviteText;
    data.eventDate = event?.eventDate || data.eventDate;
    data.eventTime = (event?.eventTime || data.eventTime).slice(0, 5);
    data.venueName = event?.venueName || data.venueName;
    data.address = event?.address || data.address;
    data.mapUrl = event?.linkMap || data.mapUrl;
    data.showGroomGift = Boolean(groomQr);
    data.showBrideGift = Boolean(brideQr);
    data.showGiftSection = Boolean(groomQr || brideQr);
    data.images.cover = mediaBySlot.get('images.cover') || data.images.cover;
    data.images.portraitOne = mediaBySlot.get('images.portraitOne') || data.images.portraitOne;
    data.images.portraitTwo = mediaBySlot.get('images.portraitTwo') || data.images.portraitTwo;
    data.images.embrace = mediaBySlot.get('images.embrace') || data.images.embrace;
    data.images.letterCenter = mediaBySlot.get('images.letterCenter') || data.images.letterCenter;
    data.images.kiss = mediaBySlot.get('images.kiss') || data.images.kiss;
    data.images.groomQr = groomQr || data.images.groomQr;
    data.images.brideQr = brideQr || data.images.brideQr;
    data.images.gallery = gallery.length ? [...gallery, ...Array(Math.max(0, 9 - gallery.length)).fill('')] : data.images.gallery;

    return data;
}

function PublicWeddingCardPage() {
    const { slug } = useParams<{ slug: string }>();
    const [card, setCard] = useState<PublicWeddingCardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!slug) {
            setIsLoading(false);
            setMessage('Không tìm thấy đường dẫn thiệp.');
            return;
        }

        setIsLoading(true);
        setMessage('');
        httpRequest<PublicWeddingCardResponse>(`/api/wedding-cards/${slug}`)
            .then((response) => {
                setCard(response.data);
                setMessage('');
            })
            .catch((error) => {
                setMessage(error instanceof Error ? error.message : 'Không thể tải thiệp.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug]);

    const template = useMemo(() => (card ? mapPublicCardToTemplate(card) : null), [card]);
    const wishes = useMemo<Wish[]>(
        () => (card?.wishes || [])
            .filter((wish) => wish.isApproved !== false)
            .map((wish) => ({
                name: wish.guestName,
                message: wish.message,
            })),
        [card],
    );

    if (isLoading) {
        return (
            <main className="public-card-loading" aria-busy="true" aria-label="Đang tải thiệp">
                <span />
            </main>
        );
    }

    if (message) {
        return (
            <NotFoundPage
                title="Không tìm thấy thiệp cưới"
            />
        );
    }

    if (!card || !template) {
        return (
            <NotFoundPage
                title="Không tìm thấy thiệp cưới"
            />
        );
    }

    if (card.template.code === 'RubyBasicInvitation') {
        return <RubyBasicInvitation template={template} />;
    }

    if (card.template.code === 'CineLoveTraditionalInvitation') {
        return (
            <CineLoveTraditionalInvitation
                data={mapPublicCardToCineLoveData(card)}
                initialWishes={wishes}
                wishEndpoint={`/api/wedding-cards/${card.slug}/wishes`}
                wishTopic={`/topic/wedding-cards/${card.slug}/wishes`}
                rsvpEndpoint={`/api/wedding-cards/${card.slug}/rsvp`}
            />
        );
    }

    if (card.template.code === 'ElegantInvitation') {
        return (
            <ElegantInvitation
                data={mapPublicCardToElegantData(card)}
                initialWishes={wishes}
                wishEndpoint={`/api/wedding-cards/${card.slug}/wishes`}
                wishTopic={`/topic/wedding-cards/${card.slug}/wishes`}
                rsvpEndpoint={`/api/wedding-cards/${card.slug}/rsvp`}
            />
        );
    }

    if (card.template.code === 'PinkWeddingInvitation') {
        return (
            <PinkWeddingInvitation
                data={mapPublicCardToPinkData(card)}
                initialWishes={wishes}
                wishEndpoint={`/api/wedding-cards/${card.slug}/wishes`}
                wishTopic={`/topic/wedding-cards/${card.slug}/wishes`}
                rsvpEndpoint={`/api/wedding-cards/${card.slug}/rsvp`}
            />
        );
    }

    if (card.template.code !== 'EmeraldInvitation') {
        return (
            <NotFoundPage
                title="Mẫu thiệp chưa hỗ trợ"
            />
        );
    }

    return (
        <EmeraldInvitation
            template={template}
            initialWishes={wishes}
            wishEndpoint={`/api/wedding-cards/${card.slug}/wishes`}
            wishTopic={`/topic/wedding-cards/${card.slug}/wishes`}
        />
    );
}

export default PublicWeddingCardPage;
