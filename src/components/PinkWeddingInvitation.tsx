import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gift, MapPin, Send, X } from 'lucide-react';
import { subscribeToStompTopic } from '../services/stomp.service';
import { httpRequest } from '../services/http.service';
import { loadPinkPreview } from '../data/invitationTemplates';
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
    groomName: 'Minh Hoàng',
    brideName: 'Mai Hương',
    groomIntroName: 'Minh Hoàng',
    brideIntroName: 'Mai Hương',
    groomFamilyLabel: 'Nhà trai',
    brideFamilyLabel: 'Nhà gái',
    groomFather: 'Ông Trần Quốc Tuấn',
    groomMother: 'Bà Lê Thị Mỹ Duyên',
    brideFather: 'Ông Phạm Gia Long',
    brideMother: 'Bà Nguyễn Thị Ngọc Hạnh',
    inviteText: 'Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.',
    eventDate: getTodayDateValue(),
    eventTime: '18:00',
    venueName: 'Adora Center - Phú Nhuận',
    address: '431 Hoàng Văn Thụ, Phường 4, TP. Hồ Chí Minh',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4204.701851603388!2d106.6593982!3d10.7984131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529d96e56d9bd%3A0x205428f74d7f4ddb!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgLSBUaeG7h2MgY8aw4bubaSBUaGUgQURPUkE!5e1!3m2!1svi!2s!4v1764416160404!5m2!1svi!2s',
    showGroomGift: true,
    showBrideGift: true,
    showGiftSection: true,
    images: {
        cover: 'https://statics.pancake.vn/web-media/80/ef/b5/09/6c1db6a25f68b4dca4e44de83c669091bc58a717a12864f63da21990-w:966-h:644-l:136924-t:image/jpeg.jpg', // standing
        portraitOne: 'https://statics.pancake.vn/web-media/7f/6f/61/20/2b9e24ef51d59835b6c74e6218402757d78081a5f9bd66fa867b8964-w:966-h:1449-l:61481-t:image/jpeg.jpg', // groom
        portraitTwo: 'https://statics.pancake.vn/web-media/68/f6/c9/2a/d2232636059e3a84124def4c0061d5efa5a88c4de2a7d962d8ce5d11-w:966-h:1449-l:71766-t:image/jpeg.jpg', // bride
        embrace: 'https://statics.pancake.vn/web-media/dd/9c/8c/a8/87a897b01d024f8789f8083f9e089b531c2718a9a15d53e8df35459e-w:966-h:1449-l:250805-t:image/jpeg.jpg', // embrace
        letterCenter: 'https://statics.pancake.vn/web-media/19/2f/08/ba/9cbbd36cdcb549e04381d24960a29385e3cf93c9c871d2441e3e59e6-w:966-h:1449-l:170170-t:image/jpeg.jpg', // invitation center
        kiss: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop', // kiss
        groomQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%208838683860%20MINH%20HOANG%20MUNG%20CUOI',
        brideQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%200123456789%20MAI%20HUONG%20MUNG%20CUOI',
        gallery: [
            'https://statics.pancake.vn/web-media/dd/9c/8c/a8/87a897b01d024f8789f8083f9e089b531c2718a9a15d53e8df35459e-w:966-h:1449-l:250805-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/80/ef/b5/09/6c1db6a25f68b4dca4e44de83c669091bc58a717a12864f63da21990-w:966-h:644-l:136924-t:image/jpeg.jpg',
            'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
            'https://statics.pancake.vn/web-media/19/2f/08/ba/9cbbd36cdcb549e04381d24960a29385e3cf93c9c871d2441e3e59e6-w:966-h:1449-l:170170-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/bf/bd/74/d1/12e5fe573cba95d32bc536066e948593c1e7e8d983e02b6b0da34f89-w:966-h:1449-l:117292-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/1d/8e/aa/61/bbcf792d619ed12ba766e768fedad8ce41647e73b392783b22cde128-w:966-h:1449-l:192299-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/a0/f8/a6/4f/94cc6154da9818df09077753959de47054802f403ee687189cda6b00-w:966-h:1449-l:346091-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/7f/6f/61/20/2b9e24ef51d59835b6c74e6218402757d78081a5f9bd66fa867b8964-w:966-h:1449-l:61481-t:image/jpeg.jpg',
            'https://statics.pancake.vn/web-media/68/f6/c9/2a/d2232636059e3a84124def4c0061d5efa5a88c4de2a7d962d8ce5d11-w:966-h:1449-l:71766-t:image/jpeg.jpg',
        ]
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
    const date = new Date(`${dateValue || defaultPinkWeddingInvitationData.eventDate}T00:00:00+07:00`);
    if (Number.isNaN(date.getTime())) {
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

const DEFAULT_INITIAL_WISHES: Array<{ name: string; message: string }> = [];

function PinkWeddingInvitation({
    data,
    editable = false,
    onImageClick,
    initialWishes = DEFAULT_INITIAL_WISHES,
    wishEndpoint = '',
    wishTopic = '',
    rsvpEndpoint = '',
}: PinkWeddingInvitationProps) {
    const [searchParams] = useSearchParams();
    const isPreviewMode = searchParams.get('preview') === '1';
    const [previewData, setPreviewData] = useState<PinkWeddingInvitationData | null>(null);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const [wishes, setWishes] = useState(initialWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [submittedRsvp, setSubmittedRsvp] = useState(false);
    const lastSubmittedWishRef = useRef<{ name: string; message: string } | null>(null);
    const lastSubmittedWishDeliveredRef = useRef(false);
    const lastInitialWishesRef = useRef<{ name: string; message: string }[]>(initialWishes);

    const calendarDays = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);

    const invitationData = data ?? previewData ?? defaultPinkWeddingInvitationData;
    const eventParts = useMemo(() => getEventParts(invitationData.eventDate), [invitationData.eventDate]);
    const isDefaultDate = invitationData.eventDate === '2025-12-14';

    // Load preview data if in preview mode
    useEffect(() => {
        if (!isPreviewMode || data) {
            return;
        }

        loadPinkPreview()
            .then((stored) => {
                if (stored && typeof stored === 'object') {
                    setPreviewData(stored as PinkWeddingInvitationData);
                }
            })
            .catch(() => {});
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
    const normalizedGallery = [...rawGallery, ...Array(Math.max(0, 9 - rawGallery.length)).fill('')];
    const galleryWithFallbacks = normalizedGallery.map((image, index) => (
        image || defaultPinkWeddingInvitationData.images.gallery[
            index % defaultPinkWeddingInvitationData.images.gallery.length
        ] || ''
    )).filter(Boolean);
    const galleryToRender = editable 
        ? normalizedGallery 
        : (galleryWithFallbacks.length > 0 ? galleryWithFallbacks : defaultPinkWeddingInvitationData.images.gallery);

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
                            <strong>{invitationData.groomFather}</strong>
                            <strong>{invitationData.groomMother}</strong>
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
                            <strong>{invitationData.brideFather}</strong>
                            <strong>{invitationData.brideMother}</strong>
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
                    {calendarDays.map((day) => (
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
                        <figure key={`gallery-${index}`} className={index % 5 === 1 ? 'is-wide' : ''}>
                            <EditablePhoto
                                src={image}
                                alt={`Album hình cưới ${index + 1}`}
                                target={`images.gallery.${index}`}
                                editable={editable}
                                onImageClick={onImageClick}
                            />
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
