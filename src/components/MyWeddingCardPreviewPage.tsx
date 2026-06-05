import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { defaultInvitationTemplate, InvitationTemplate } from '../data/invitationTemplates';
import { MyWeddingCardResponse } from '../models/wedding-card.model';
import { weddingCardService } from '../services/wedding-card.service';
import EmeraldInvitation from './EmeraldInvitationPage';
import RubyBasicInvitation from './RubyBasicInvitation';
import './PublicWeddingCardPage.css';

function getDayName(dateValue: string) {
    const date = new Date(`${dateValue}T00:00:00+07:00`);
    return Number.isNaN(date.getTime())
        ? defaultInvitationTemplate.event.dayName
        : new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
}

function toEventDate(dateValue: string, timeValue: string) {
    return `${dateValue || '2026-01-01'}T${timeValue || '00:00'}:00+07:00`;
}

function mapMyCardToTemplate(card: MyWeddingCardResponse): InvitationTemplate {
    const template = JSON.parse(JSON.stringify(defaultInvitationTemplate)) as InvitationTemplate;
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const eventDate = event?.eventDate || template.event.date.slice(0, 10);
    const eventTime = (event?.eventTime || '00:00').slice(0, 5);
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));

    template.id = String(card.weddingId);
    template.slug = card.slug;
    template.status = card.status === 'active' ? 'published' : 'draft';
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

function MyWeddingCardPreviewPage() {
    const { weddingId } = useParams<{ weddingId: string }>();
    const [card, setCard] = useState<MyWeddingCardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const id = Number(weddingId);

        if (!Number.isFinite(id) || id <= 0) {
            setIsLoading(false);
            setMessage('Không tìm thấy thiệp cưới.');
            return;
        }

        setIsLoading(true);
        setMessage('');
        weddingCardService.getMyCard(id)
            .then((response) => {
                setCard(response);
                setMessage('');
            })
            .catch((error) => {
                setMessage(error instanceof Error ? error.message : 'Không thể tải bản xem trước.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [weddingId]);

    const template = useMemo(() => (card ? mapMyCardToTemplate(card) : null), [card]);

    if (isLoading) {
        return (
            <main className="public-card-loading" aria-busy="true" aria-label="Đang tải bản xem trước">
                <span />
            </main>
        );
    }

    if (message) {
        return <main style={{ padding: 32 }}>{message}</main>;
    }

    if (!card || !template) {
        return <main style={{ padding: 32 }}>Không tìm thấy thiệp cưới.</main>;
    }

    if (card.template.code === 'RubyBasicInvitation') {
        return <RubyBasicInvitation template={template} preview />;
    }

    if (card.template.code !== 'EmeraldInvitation') {
        return <main style={{ padding: 32 }}>Mẫu {card.template.code} chưa được hỗ trợ.</main>;
    }

    return <EmeraldInvitation template={template} preview />;
}

export default MyWeddingCardPreviewPage;
