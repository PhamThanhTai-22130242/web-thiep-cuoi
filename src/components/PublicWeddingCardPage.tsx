import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { defaultInvitationTemplate, InvitationTemplate, Wish } from '../data/invitationTemplates';
import EmeraldInvitation from './EmeraldInvitationPage';
import RubyBasicInvitation from './RubyBasicInvitation';
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
    const template = JSON.parse(JSON.stringify(defaultInvitationTemplate)) as InvitationTemplate;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const eventDate = event?.eventDate || template.event.date.slice(0, 10);
    const eventTime = (event?.eventTime || '00:00').slice(0, 5);
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));

    template.slug = card.slug;
    template.publicUrl = `/thiep/${card.slug}`;
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
