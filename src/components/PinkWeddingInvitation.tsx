import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gift, MapPin, Send, Trash2, X } from 'lucide-react';
import { subscribeToStompTopic } from '../services/stomp.service';
import { httpRequest } from '../services/http.service';
import { loadPinkPreview, defaultPinkInvitationTemplate } from '../data/invitationTemplates';
import InvitationLoadingScreen from './InvitationLoadingScreen';
import './PinkWeddingInvitation.css';

export interface PinkWeddingInvitationData {
    slug?: string;
    groomName: string;
    brideName: string;
    groomIntroName?: string;
    brideIntroName?: string;
    groomFamilyLabel: string;
    brideFamilyLabel: string;
    groomFather: string;
    groomMother: string;
    brideFather: string;
    brideMother: string;
    inviteText: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    address: string;
    mapUrl: string;
    showGroomGift?: boolean;
    showBrideGift?: boolean;
    showGiftSection?: boolean;
    images: {
        cover: string;
        portraitOne: string;
        portraitTwo: string;
        embrace: string;
        letterCenter: string;
        kiss: string;
        groomQr: string;
        brideQr: string;
        gallery: string[];
    };
}

export type EditablePinkImageTarget =
    | 'images.cover'
    | 'images.portraitOne'
    | 'images.portraitTwo'
    | 'images.embrace'
    | 'images.letterCenter'
    | 'images.kiss'
    | `images.gallery.${number}`
    | 'images.groomQr'
    | 'images.brideQr';

type PinkWeddingInvitationProps = {
    data?: PinkWeddingInvitationData;
    editable?: boolean;
    onImageClick?: (target: EditablePinkImageTarget, mode?: 'replace' | 'insert') => void;
    onImageDelete?: (index: number) => void;
    initialWishes?: Array<{ name: string; message: string }>;
    wishEndpoint?: string;
    wishTopic?: string;
    rsvpEndpoint?: string;
};

function getTodayDateValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const defaultPinkWeddingInvitationData: PinkWeddingInvitationData = {
    slug: '',
    groomName: defaultPinkInvitationTemplate.couple.groom || 'Nhật Minh',
    brideName: defaultPinkInvitationTemplate.couple.bride || 'Khánh Vy',
    groomIntroName: defaultPinkInvitationTemplate.couple.groom || 'Nhật Minh',
    brideIntroName: defaultPinkInvitationTemplate.couple.bride || 'Khánh Vy',
    groomFamilyLabel: 'Nhà trai',
    brideFamilyLabel: 'Nhà gái',
    groomFather: 'Ông Trần Quốc Tuấn',
    groomMother: 'Bà Lê Thị Mỹ Duyên',
    brideFather: 'Ông Phạm Gia Long',
    brideMother: 'Bà Nguyễn Thị Ngọc Hạnh',
    inviteText: defaultPinkInvitationTemplate.couple.headline || 'Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.',
    eventDate: getTodayDateValue(),
    eventTime: defaultPinkInvitationTemplate.event.time || '11:00',
    venueName: defaultPinkInvitationTemplate.event.venue || 'Nhà hàng Wedding Palace',
    address: defaultPinkInvitationTemplate.event.address || 'Hồ Tây, Hà Nội',
    mapUrl: defaultPinkInvitationTemplate.event.mapUrl || 'https://maps.google.com',
    showGroomGift: true,
    showBrideGift: true,
    showGiftSection: true,
    images: {
        cover: defaultPinkInvitationTemplate.images.cover || '',
        portraitOne: defaultPinkInvitationTemplate.images.smile || '',
        portraitTwo: defaultPinkInvitationTemplate.images.studio || '',
        embrace: defaultPinkInvitationTemplate.images.walk || '',
        letterCenter: defaultPinkInvitationTemplate.images.thank || '',
        kiss: defaultPinkInvitationTemplate.images.kiss || '',
        groomQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%208838683860%20MINH%20HOANG%20MUNG%20CUOI',
        brideQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%200123456789%20MAI%20HUONG%20MUNG%20CUOI',
        gallery: defaultPinkInvitationTemplate.images.gallery || [],
    }
};

export const emptyPinkWeddingInvitationData: PinkWeddingInvitationData = {
    ...defaultPinkWeddingInvitationData,
    images: {
        cover: '',
        portraitOne: '',
        portraitTwo: '',
        embrace: '',
        letterCenter: '',
        kiss: '',
        groomQr: '',
        brideQr: '',
        gallery: Array(9).fill(''),
    }
};

function EditablePhoto({
    src,
    alt,
    target,
    editable,
    className = '',
    onImageClick,
}: {
    src: string;
    alt: string;
    target: EditablePinkImageTarget;
    editable?: boolean;
    className?: string;
    onImageClick?: (target: EditablePinkImageTarget, mode?: 'replace' | 'insert') => void;
}) {
    if (!editable) {
        return src ? <img className={className || undefined} src={src} alt={alt} /> : null;
    }

    return (
        <button
            className={`pwi-editable-image${className ? ` ${className}` : ''}${src ? '' : ' is-empty'}`}
            type="button"
            onClick={() => onImageClick?.(target)}
            aria-label={`Đổi ${alt}`}
        >
            {src ? <img src={src} alt={alt} /> : <span className="pwi-image-placeholder">Thêm ảnh</span>}
            {src && (
                <span className="pwi-change-image-badge">
                    Đổi ảnh
                </span>
            )}
        </button>
    );
}

function PinkSectionTitle({ title }: { title: string }) {
    return (
        <div className="pwi-section-title">
            <span>Wedding Invitation</span>
            <h2>{title}</h2>
        </div>
    );
}

function extractIframeSrc(value: string) {
    const match = value.match(/src=["']([^"']+)["']/i);
    return match?.[1]?.trim() || '';
}

function getGoogleMapEmbedUrl(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return '';
    }

    if (trimmedValue.toLowerCase().includes('<iframe')) {
        return extractIframeSrc(trimmedValue);
    }

    return trimmedValue;
}

function getEventParts(dateValue: string) {
    const date = parseEventDate(dateValue, defaultPinkWeddingInvitationData.eventDate);
    if (!date) {
        return { dayName: 'Chủ Nhật', day: '14', month: '12', year: '2025' };
    }

    const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1);

    return {
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        day,
        month,
        year: String(date.getFullYear()),
    };
}

function parseEventDate(dateValue: string, fallbackDateValue: string) {
    const normalizedDate = dateValue || fallbackDateValue;
    const match = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const date = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(`${normalizedDate}T00:00:00+07:00`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthCalendar(dateValue: string) {
    const date = parseEventDate(dateValue, defaultPinkWeddingInvitationData.eventDate);
    if (!date) {
        return {
            leadingBlanks: 6,
            days: Array.from({ length: 31 }, (_, index) => index + 1),
        };
    }

    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const mondayFirstIndex = (firstDay.getDay() + 6) % 7;
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();

    return {
        leadingBlanks: mondayFirstIndex,
        days: Array.from({ length: dayCount }, (_, index) => index + 1),
    };
}

const DEFAULT_INITIAL_WISHES: Array<{ name: string; message: string }> = [];

function PinkWeddingInvitation({
    data,
    editable = false,
    onImageClick,
    onImageDelete,
    initialWishes = DEFAULT_INITIAL_WISHES,
    wishEndpoint = '',
    wishTopic = '',
    rsvpEndpoint = '',
}: PinkWeddingInvitationProps) {
    const [searchParams] = useSearchParams();
    const isPreviewMode = searchParams.get('preview') === '1';
    const [previewData, setPreviewData] = useState<PinkWeddingInvitationData | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(isPreviewMode && !data);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const [wishes, setWishes] = useState(initialWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [submittedRsvp, setSubmittedRsvp] = useState(false);
    const lastSubmittedWishRef = useRef<{ name: string; message: string } | null>(null);
    const lastSubmittedWishDeliveredRef = useRef(false);
    const lastInitialWishesRef = useRef<{ name: string; message: string }[]>(initialWishes);

    const invitationData = data ?? previewData ?? defaultPinkWeddingInvitationData;
    const eventParts = useMemo(() => getEventParts(invitationData.eventDate), [invitationData.eventDate]);
    const monthCalendar = useMemo(() => getMonthCalendar(invitationData.eventDate), [invitationData.eventDate]);
    const isDefaultDate = invitationData.eventDate === '2025-12-14';

    // Load preview data if in preview mode
    useEffect(() => {
        if (!isPreviewMode || data) {
            return;
        }

        setIsLoadingPreview(true);
        loadPinkPreview()
            .then((stored) => {
                if (stored && typeof stored === 'object') {
                    setPreviewData(stored as PinkWeddingInvitationData);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoadingPreview(false));
    }, [isPreviewMode, data]);

    useEffect(() => {
        const isSame = initialWishes.length === lastInitialWishesRef.current.length &&
            initialWishes.every((w, i) => 
                w.name === lastInitialWishesRef.current[i]?.name && 
                w.message === lastInitialWishesRef.current[i]?.message
            );
        if (!isSame) {
            lastInitialWishesRef.current = initialWishes;
            setWishes(initialWishes);
        }
    }, [initialWishes]);

    // WebSocket subscription for wishes
    useEffect(() => {
        if (!wishTopic || isPreviewMode) {
            return undefined;
        }

        const subscription = subscribeToStompTopic<{ name?: string; guestName?: string; message: string }>(wishTopic, (incomingWish) => {
            const wish = {
                name: incomingWish.name || incomingWish.guestName || '',
                message: incomingWish.message,
            };
            const submittedWish = lastSubmittedWishRef.current;
            if (submittedWish && submittedWish.name === wish.name && submittedWish.message === wish.message) {
                lastSubmittedWishDeliveredRef.current = true;
                setWishStatus('Cảm ơn bạn, lời chúc đã được gửi đến cô dâu chú rể.');
            }
            setWishes((current) => {
                const exists = current.some((item) => item.name === wish.name && item.message === wish.message);
                return exists ? current : [wish, ...current];
            });
        });

        return () => subscription.unsubscribe();
    }, [isPreviewMode, wishTopic]);

    useEffect(() => {
        if (editable) {
            return undefined;
        }

        const revealItems = document.querySelectorAll<HTMLElement>('[data-pwi-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            { threshold: 0.12 },
        );

        revealItems.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, [editable]);

    const handleWishSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const name = String(form.get('name') || '').trim();
        const message = String(form.get('message') || '').trim();

        if (!name || !message) {
            setWishStatus('Bạn nhập tên và lời chúc giúp mình nhé.');
            return;
        }

        const nextWish = { name, message };

        try {
            lastSubmittedWishRef.current = nextWish;
            lastSubmittedWishDeliveredRef.current = false;

            if (wishEndpoint) {
                await httpRequest(wishEndpoint, {
                    method: 'POST',
                    body: nextWish,
                });
            }

            setWishes((current) => {
                const exists = current.some((item) => item.name === nextWish.name && item.message === nextWish.message);
                return exists ? current : [nextWish, ...current];
            });

            setWishStatus('Cảm ơn bạn, lời chúc đã được gửi đến cô dâu chú rể.');
            formElement.reset();
        } catch {
            if (lastSubmittedWishDeliveredRef.current) {
                setWishStatus('Cảm ơn bạn, lời chúc đã được gửi đến cô dâu chú rể.');
                formElement.reset();
                return;
            }
            setWishStatus('Không thể gửi lời chúc. Vui lòng thử lại.');
        } finally {
            lastSubmittedWishRef.current = null;
        }
    };

    const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get('name') || '').trim();
        const attendingValue = String(form.get('attend') || 'yes');

        if (!name) {
            alert('Vui lòng nhập tên của bạn trước khi xác nhận.');
            return;
        }

        setSubmittedRsvp(true);

        if (rsvpEndpoint) {
            try {
                await httpRequest(rsvpEndpoint, {
                    method: 'POST',
                    body: { name, attending: attendingValue },
                });
            } catch (error) {
                console.error('Failed to submit RSVP:', error);
            }
        }
    };

    const rawGallery = invitationData.images.gallery || [];
    const normalizedGallery = [...rawGallery, ...Array(Math.max(0, 20 - rawGallery.length)).fill('')];
    const filledGallery = normalizedGallery.filter(Boolean);
    const lastFilledIndex = normalizedGallery.reduce((acc, curr, idx) => curr ? idx : acc, -1);
    const visibleCount = Math.min(20, Math.max(5, lastFilledIndex + 2));
    const galleryToRender = editable 
        ? normalizedGallery.slice(0, visibleCount) 
        : (filledGallery.length > 0 ? filledGallery : defaultPinkWeddingInvitationData.images.gallery.filter(Boolean));

    if (isLoadingPreview) {
        return <InvitationLoadingScreen className="pwi-page" variant="emerald-skeleton" />;
    }

    return (
        <main className="pwi-page">
            <section className={`pwi-save-photo${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <div className="pwi-save-heading">
                    <span>Save The Date</span>
                    <h2>
                        <span>{invitationData.groomName}</span>
                        <b>&amp;</b>
                        <span>{invitationData.brideName}</span>
                    </h2>
                </div>
                <figure>
                    <EditablePhoto
                        src={invitationData.images.cover}
                        alt="Ảnh bìa sổ lưu niệm"
                        target="images.cover"
                        editable={editable}
                        onImageClick={onImageClick}
                    />
                </figure>
                <div className="pwi-save-time">
                    <strong>{invitationData.eventTime}</strong>
                    <span>{eventParts.dayName}</span>
                    <b>{eventParts.day}.{eventParts.month}</b>
                    <em>{eventParts.year}</em>
                </div>
                {isDefaultDate && <p>(Tức Ngày 25 Tháng 10 Năm Ất Tỵ)</p>}
            </section>

            <section className={`pwi-family${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <article className="pwi-person-row">
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.portraitOne}
                            alt="Ảnh chú rể"
                            target="images.portraitOne"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                    <div className="pwi-person-info">
                        <div className="pwi-parents-block">
                            <span>{invitationData.groomFamilyLabel || 'Nhà trai'}</span>
                            {invitationData.groomFather && <strong>{invitationData.groomFather}</strong>}
                            {invitationData.groomMother && <strong>{invitationData.groomMother}</strong>}
                        </div>
                        <em>Chú Rể</em>
                        <h2>{invitationData.groomIntroName || invitationData.groomName}</h2>
                    </div>
                </article>

                <article className="pwi-person-row is-reversed">
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.portraitTwo}
                            alt="Ảnh cô dâu"
                            target="images.portraitTwo"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                    <div className="pwi-person-info">
                        <div className="pwi-parents-block">
                            <span>{invitationData.brideFamilyLabel || 'Nhà gái'}</span>
                            {invitationData.brideFather && <strong>{invitationData.brideFather}</strong>}
                            {invitationData.brideMother && <strong>{invitationData.brideMother}</strong>}
                        </div>
                        <em>Cô Dâu</em>
                        <h2>{invitationData.brideIntroName || invitationData.brideName}</h2>
                    </div>
                </article>
            </section>

            <section className={`pwi-letter${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <PinkSectionTitle title="Thư Mời" />
                <p>Tham dự lễ cưới</p>
                <div className="pwi-letter-gallery">
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.embrace}
                            alt="Thư mời ảnh 1"
                            target="images.embrace"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.letterCenter}
                            alt="Thư mời ảnh 2"
                            target="images.letterCenter"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.kiss}
                            alt="Thư mời ảnh 3"
                            target="images.kiss"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                </div>
                <p style={{ marginTop: '24px', fontStyle: 'italic', color: '#666', textTransform: 'none' }}>
                    {invitationData.inviteText}
                </p>
            </section>

            <section className={`pwi-ceremony${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <article className="pwi-party-card">
                    <h3>Tiệc Mừng Lễ Thành Hôn</h3>
                    <p>{invitationData.eventTime} - {eventParts.dayName}</p>
                    <strong>{eventParts.day}.{eventParts.month}.{eventParts.year}</strong>
                    {isDefaultDate && <em>(Tức Ngày 25 Tháng 10 Năm Ất Tỵ)</em>}
                    <span>Tại {invitationData.venueName}</span>
                </article>
            </section>

            <section className={`pwi-calendar${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <h2>
                    Save The Date
                    <span>Tháng {eventParts.month} - {eventParts.year}</span>
                </h2>
                <div className="pwi-calendar-card">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((weekday) => (
                        <strong key={weekday}>{weekday}</strong>
                    ))}
                    {Array.from({ length: monthCalendar.leadingBlanks }, (_, index) => (
                        <span key={`empty-${index}`} />
                    ))}
                    {monthCalendar.days.map((day) => (
                        <span
                            key={day}
                            className={
                                day === Number(eventParts.day)
                                    ? 'is-wedding-day'
                                    : day % 7 === 0
                                    ? 'is-weekend'
                                    : ''
                            }
                        >
                            {day}
                        </span>
                    ))}
                </div>
            </section>

            <section className={`pwi-location${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <PinkSectionTitle title="Địa Điểm Tổ Chức" />
                <div className="pwi-location-info">
                    <MapPin size={54} strokeWidth={1.8} />
                    <div>
                        <h3>{invitationData.venueName}</h3>
                        <address>{invitationData.address}</address>
                    </div>
                </div>
                {invitationData.mapUrl && (() => {
                    const mapLink = getGoogleMapEmbedUrl(invitationData.mapUrl);
                    const shouldEmbedMap = mapLink.includes('google.com/maps/embed');

                    return (
                        <>
                            {mapLink && (
                                <a
                                    className="pwi-map-button"
                                    href={mapLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Xem Chỉ Đường
                                </a>
                            )}
                            {shouldEmbedMap && (
                                <iframe
                                    title="Bản đồ địa điểm"
                                    src={mapLink}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            )}
                        </>
                    );
                })()}
            </section>

            <section className={`pwi-gallery${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <PinkSectionTitle title="Album Hình Cưới" />
                <div className="pwi-gallery-grid">
                    {galleryToRender.map((image, index) => (
                        <figure key={`gallery-${index}`} className={index % 3 === 2 ? 'is-wide' : ''} style={{ position: 'relative' }}>
                            <EditablePhoto
                                src={image}
                                alt={`Album hình cưới ${index + 1}`}
                                target={`images.gallery.${index}`}
                                editable={editable}
                                onImageClick={onImageClick}
                            />
                            {editable && index >= 5 && image && (
                                <button
                                    type="button"
                                    className="pwi-delete-image"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageDelete?.(index);
                                    }}
                                    aria-label="Xóa ảnh"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </figure>
                    ))}
                </div>
            </section>

            <section className={`pwi-actions${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                {invitationData.showGiftSection !== false && (
                    <button type="button" onClick={() => setIsGiftOpen(true)}>
                        <Gift size={18} />
                        Gửi mừng cưới
                    </button>
                )}
                <button type="button" onClick={() => setIsRsvpOpen(true)}>
                    Xác nhận tham dự lễ cưới
                </button>
            </section>

            <section className={`pwi-rsvp${editable ? ' is-visible' : ''}`} data-pwi-reveal>
                <PinkSectionTitle title="Gửi Lời Chúc" />
                <form onSubmit={handleWishSubmit}>
                    <input name="name" placeholder="Tên của bạn là?" maxLength={40} required />
                    <textarea name="message" placeholder="Gửi lời chúc đến Dâu Rể nhé!" rows={4} maxLength={260} required />
                    <button type="submit">
                        <Send size={18} />
                        Gửi ngay
                    </button>
                </form>
                {wishStatus && <p className="pwi-status">{wishStatus}</p>}
                <div className="pwi-wish-list">
                    {wishes.map((wish, index) => (
                        <article key={`wish-list-${index}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            {isGiftOpen && invitationData.showGiftSection !== false && (
                <div className="pwi-gift-modal" role="dialog" aria-modal="true" aria-label="Gửi mừng cưới">
                    <button className="pwi-gift-backdrop" type="button" aria-label="Đóng gửi mừng cưới" onClick={() => setIsGiftOpen(false)} />
                    <section className="pwi-gift-panel">
                        <button className="pwi-gift-close" type="button" aria-label="Đóng" onClick={() => setIsGiftOpen(false)}>
                            <X size={20} />
                        </button>
                        <div className="pwi-gift-title">
                            <h2>Gửi Mừng Cưới</h2>
                        </div>
                        <div className="pwi-gift-grid">
                            {invitationData.showGroomGift !== false && (
                                <article className="pwi-gift-card">
                                    <div>
                                        <span>Mừng cưới Chú rể</span>
                                        <EditablePhoto
                                            src={invitationData.images.groomQr}
                                            alt="Mã QR chú rể"
                                            target="images.groomQr"
                                            editable={editable}
                                            onImageClick={onImageClick}
                                        />
                                    </div>
                                </article>
                            )}
                            {invitationData.showBrideGift !== false && (
                                <article className="pwi-gift-card">
                                    <div>
                                        <span>Mừng cưới Cô dâu</span>
                                        <EditablePhoto
                                            src={invitationData.images.brideQr}
                                            alt="Mã QR cô dâu"
                                            target="images.brideQr"
                                            editable={editable}
                                            onImageClick={onImageClick}
                                        />
                                    </div>
                                </article>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {isRsvpOpen && (
                <div className="pwi-gift-modal" role="dialog" aria-modal="true" aria-label="Xác nhận tham dự">
                    <button className="pwi-gift-backdrop" type="button" aria-label="Đóng" onClick={() => setIsRsvpOpen(false)} />
                    <section className="pwi-gift-panel">
                        <button className="pwi-gift-close" type="button" aria-label="Đóng" onClick={() => setIsRsvpOpen(false)}>
                            <X size={20} />
                        </button>
                        <div className="pwi-gift-title">
                            <h2>Xác Nhận Tham Dự</h2>
                            <p style={{ marginTop: '8px', color: '#666', fontSize: '0.9rem' }}>
                                Việc xác nhận giúp chúng mình chuẩn bị chu đáo hơn. Cảm ơn bạn!
                            </p>
                        </div>
                        {submittedRsvp ? (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--pwi-pink-strong)', fontWeight: 'bold' }}>
                                Cảm ơn bạn! Thông tin xác nhận đã được gửi đi.
                            </div>
                        ) : (
                            <form onSubmit={handleRsvpSubmit} style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                                <input
                                    name="name"
                                    placeholder="Họ và tên của bạn"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0', width: '100%' }}>
                                    <label className="pwi-rsvp-option">
                                        <input type="radio" name="attend" value="yes" defaultChecked className="pwi-rsvp-radio" />
                                        Có, tôi sẽ tham dự
                                    </label>
                                    <label className="pwi-rsvp-option">
                                        <input type="radio" name="attend" value="no" className="pwi-rsvp-radio" />
                                        Xin lỗi, tôi bận mất rồi!
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'var(--pwi-pink-strong)',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Xác nhận
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}

export default PinkWeddingInvitation;
