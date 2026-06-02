import { CSSProperties, FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
    defaultInvitationTemplate,
    InvitationTemplate,
    loadPreviewInvitationTemplate,
    loadStoredInvitationTemplate,
    Rsvp,
    Wish,
} from '../data/invitationTemplates';
import { subscribeToStompTopic } from '../services/stomp.service';
import { API_CONFIG } from '../config/api.config';
import './EmeraldInvitation.css';

type EmeraldInvitationProps = {
    template?: InvitationTemplate;
    preview?: boolean;
    onImageClick?: (target: string) => void;
    initialWishes?: Wish[];
    wishEndpoint?: string;
    wishTopic?: string;
};

type InvitationColorTheme = {
    key: string;
    name: string;
    primary: string;
    primaryDark: string;
    primarySoft: string;
    paper: string;
    accent: string;
    muted: string;
    inkSoft: string;
    shadow: string;
    grid: string;
    sectionTint: string;
};

const invitationColorThemes: InvitationColorTheme[] = [
    {
        key: 'emerald',
        name: 'Xanh ngọc',
        primary: '#2d4b45',
        primaryDark: '#203b36',
        primarySoft: '#e6eeea',
        paper: '#f8f8f1',
        accent: '#c2a113',
        muted: '#667873',
        inkSoft: '#415c56',
        shadow: '32, 59, 54',
        grid: '45, 75, 69',
        sectionTint: 'rgba(45, 75, 69, 0.035)',
    },
    {
        key: 'rose',
        name: 'Hồng rượu',
        primary: '#7d3347',
        primaryDark: '#572434',
        primarySoft: '#f4e7ec',
        paper: '#fff7f7',
        accent: '#c8915b',
        muted: '#866b70',
        inkSoft: '#71424f',
        shadow: '87, 36, 52',
        grid: '125, 51, 71',
        sectionTint: 'rgba(125, 51, 71, 0.045)',
    },
    {
        key: 'navy',
        name: 'Xanh navy',
        primary: '#263f63',
        primaryDark: '#172841',
        primarySoft: '#e5ebf4',
        paper: '#f7f8fb',
        accent: '#b9985b',
        muted: '#617087',
        inkSoft: '#394f70',
        shadow: '23, 40, 65',
        grid: '38, 63, 99',
        sectionTint: 'rgba(38, 63, 99, 0.045)',
    },
    {
        key: 'champagne',
        name: 'Champagne',
        primary: '#6a4f3c',
        primaryDark: '#463225',
        primarySoft: '#f1e8df',
        paper: '#fffaf2',
        accent: '#b88a3a',
        muted: '#806f61',
        inkSoft: '#654f3f',
        shadow: '70, 50, 37',
        grid: '106, 79, 60',
        sectionTint: 'rgba(106, 79, 60, 0.045)',
    },
];

function getCountdown(targetDate: string) {
    const distance = Math.max(new Date(targetDate).getTime() - Date.now(), 0);

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
    };
}

function getCountdownTargetDate(event: InvitationTemplate['event']) {
    const year = event.year || event.date.slice(0, 4);
    const month = (event.month || event.date.slice(5, 7)).padStart(2, '0');
    const day = (event.day || event.date.slice(8, 10)).padStart(2, '0');
    const timeParts = event.time.match(/(\d{1,2})(?:\D+(\d{1,2}))?/);
    const hour = (timeParts?.[1] || event.date.slice(11, 13) || '00').padStart(2, '0');
    const minute = (timeParts?.[2] || event.date.slice(14, 16) || '00').padStart(2, '0');
    const targetDate = `${year}-${month}-${day}T${hour}:${minute}:00+07:00`;

    return Number.isNaN(new Date(targetDate).getTime()) ? event.date : targetDate;
}

function getWeddingCalendar(event: InvitationTemplate['event']) {
    const year = Number(event.year || event.date.slice(0, 4));
    const month = Number(event.month || event.date.slice(5, 7));
    const weddingDay = Number(event.day || event.date.slice(8, 10));

    if (!year || !month || !weddingDay) {
        return [];
    }

    const firstDay = new Date(year, month - 1, 1);
    const leadingDays = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPreviousMonth = new Date(year, month - 1, 0).getDate();
    const cells = [
        ...Array.from({ length: leadingDays }, (_, index) => ({
            day: daysInPreviousMonth - leadingDays + index + 1,
            monthOffset: -1,
        })),
        ...Array.from({ length: daysInMonth }, (_, index) => ({
            day: index + 1,
            monthOffset: 0,
        })),
    ];
    const trailingDays = (7 - (cells.length % 7)) % 7;

    return [
        ...cells,
        ...Array.from({ length: trailingDays }, (_, index) => ({
            day: index + 1,
            monthOffset: 1,
        })),
    ].map((cell) => ({
        ...cell,
        isWeddingDay: cell.monthOffset === 0 && cell.day === weddingDay,
    }));
}

function toGoogleMapEmbedUrl(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return '';
    }

    try {
        const url = new URL(trimmedValue);

        if (url.hostname.includes('google.') || url.hostname.includes('goo.gl')) {
            url.searchParams.set('output', 'embed');
            return url.toString();
        }

        return trimmedValue;
    } catch {
        return `https://www.google.com/maps?q=${encodeURIComponent(trimmedValue)}&output=embed`;
    }
}

async function postWhenConfigured<T>(endpoint: string, payload: T) {
    if (!endpoint) {
        return;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        let message = 'Request failed';
        try {
            const errorPayload = await response.json();
            message = errorPayload.message || message;
        } catch {
            // Keep the generic message when the server does not return JSON.
        }
        throw new Error(message);
    }
}

function SectionTitle({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
    return (
        <div className="ei-section-title">
            {label && <p>{label}</p>}
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
        </div>
    );
}

function Polaroid({ src, alt, className, onClick }: { src: string; alt: string; className: string; onClick?: () => void }) {
    const hasImage = Boolean(src);

    return (
        <figure
            className={`ei-polaroid ${className}${onClick ? ' is-editable' : ''}${!hasImage ? ' is-empty' : ''}`}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(event) => {
                if (onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            {hasImage && <img src={src} alt={alt} />}
            {onClick && <span className="ei-edit-image-hint">Đổi ảnh</span>}
        </figure>
    );
}

function isDefaultSampleImage(image: string) {
    const samples = [
        defaultInvitationTemplate.images.cover,
        defaultInvitationTemplate.images.kiss,
        defaultInvitationTemplate.images.walk,
        defaultInvitationTemplate.images.smile,
        defaultInvitationTemplate.images.studio,
        defaultInvitationTemplate.images.thank,
        ...(defaultInvitationTemplate.images.gallery || []),
    ];

    return samples.includes(image);
}

function EmeraldInvitation({ template, preview = false, onImageClick, initialWishes = [], wishEndpoint = '', wishTopic = '' }: EmeraldInvitationProps) {
    const shouldLoadSavedPreview = !template && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1';
    const isPreviewMode = preview || shouldLoadSavedPreview;
    const shouldUseTemplateColors = isPreviewMode || Boolean(template);
    const [savedPreviewTemplate, setSavedPreviewTemplate] = useState<InvitationTemplate | null>(null);
    const invitationData = template || savedPreviewTemplate || (shouldLoadSavedPreview ? defaultInvitationTemplate : loadStoredInvitationTemplate()) || defaultInvitationTemplate;
    const isLoadingSavedPreview = shouldLoadSavedPreview && !savedPreviewTemplate;
    const isEditablePreview = Boolean(onImageClick);
    const gallerySource = isEditablePreview
        ? (invitationData.images.gallery || []).map((image) => (isDefaultSampleImage(image) ? '' : image))
        : invitationData.images.gallery || [];
    const galleryFallback = [
        invitationData.images.smile,
        invitationData.images.kiss,
        invitationData.images.studio,
        invitationData.images.cover,
        invitationData.images.walk,
        invitationData.images.thank,
    ];
    const galleryImages = (
        isEditablePreview
            ? [...gallerySource, ...Array.from({ length: Math.max(4 - gallerySource.length, 0) }, () => '')]
            : (gallerySource.filter(Boolean).length ? gallerySource.filter(Boolean) : galleryFallback)
    ).slice(0, 20);
    const galleryPreview = galleryImages.slice(0, 4);
    const hiddenGalleryCount = Math.max(galleryImages.length - galleryPreview.length, 0);
    const galleryOverlayCount = hiddenGalleryCount;
    const countdownTargetDate = getCountdownTargetDate(invitationData.event);
    const weddingCalendar = getWeddingCalendar(invitationData.event);
    const shouldShowVenue = Boolean(invitationData.event.venue?.trim());
    const mapUrl = toGoogleMapEmbedUrl(invitationData.event.mapUrl || invitationData.event.address || '');
    const shouldShowMap = shouldShowVenue && Boolean(mapUrl);
    const [countdown, setCountdown] = useState(() => getCountdown(countdownTargetDate));
    const [wishes, setWishes] = useState<Wish[]>(initialWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const [activeThemeKey, setActiveThemeKey] = useState(invitationColorThemes[0].key);
    const lastSubmittedWishRef = useRef<Wish | null>(null);
    const lastSubmittedWishDeliveredRef = useRef(false);
    const activeTheme = invitationColorThemes.find((theme) => theme.key === activeThemeKey) || invitationColorThemes[0];

    useEffect(() => {
        if (!shouldLoadSavedPreview) {
            return;
        }

        let isActive = true;
        loadPreviewInvitationTemplate().then((previewTemplate) => {
            if (isActive && previewTemplate) {
                setSavedPreviewTemplate(previewTemplate);
            }
        });

        return () => {
            isActive = false;
        };
    }, [shouldLoadSavedPreview]);

    const themeColors = shouldUseTemplateColors
        ? {
            primary: invitationData.design.primaryColor,
            primaryDark: invitationData.design.primaryColor,
            primarySoft: invitationData.design.backgroundColor,
            paper: invitationData.design.backgroundColor,
            accent: invitationData.design.accentColor,
            muted: activeTheme.muted,
            inkSoft: activeTheme.inkSoft,
            shadow: activeTheme.shadow,
            grid: activeTheme.grid,
            sectionTint: activeTheme.sectionTint,
        }
        : activeTheme;
    const pageStyle = {
        '--ei-green': themeColors.primary,
        '--ei-green-dark': themeColors.primaryDark,
        '--ei-green-soft': themeColors.primarySoft,
        '--ei-paper': themeColors.paper,
        '--ei-gold': themeColors.accent,
        '--ei-muted': themeColors.muted,
        '--ei-ink-soft': themeColors.inkSoft,
        '--ei-shadow-rgb': themeColors.shadow,
        '--ei-green-rgb': themeColors.grid,
        '--ei-section-tint': themeColors.sectionTint,
        '--ei-script': `'Allura', 'Great Vibes', cursive`,
        '--ei-couple-script': `'${invitationData.design.scriptFont}', 'Great Vibes', cursive`,
        '--ei-serif': `'${invitationData.design.serifFont}', Georgia, serif`,
        '--ei-name-size': `${invitationData.design.nameSize}px`,
        '--ei-heading-size': `${invitationData.design.headingSize}px`,
        '--ei-speed': invitationData.design.animationSpeed,
    } as CSSProperties;

    useEffect(() => {
        setCountdown(getCountdown(countdownTargetDate));
        const timer = window.setInterval(() => {
            setCountdown(getCountdown(countdownTargetDate));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdownTargetDate]);

    useEffect(() => {
        setWishes(initialWishes);
    }, [initialWishes]);

    useEffect(() => {
        if (!wishTopic || isPreviewMode) {
            return undefined;
        }

        const subscription = subscribeToStompTopic<Wish & { guestName?: string }>(wishTopic, (incomingWish) => {
            const wish = {
                name: incomingWish.name || incomingWish.guestName || '',
                message: incomingWish.message,
            };
            const submittedWish = lastSubmittedWishRef.current;
            if (submittedWish && submittedWish.name === wish.name && submittedWish.message === wish.message) {
                lastSubmittedWishDeliveredRef.current = true;
                setWishStatus('Dâu rể đã nhận được lời chúc của bạn.');
            }
            setWishes((current) => {
                const exists = current.some((item) => item.name === wish.name && item.message === wish.message);
                return exists ? current : [wish, ...current];
            });
        });

        return () => subscription.unsubscribe();
    }, [isPreviewMode, wishTopic]);

    useEffect(() => {
        if (isLoadingSavedPreview) {
            return undefined;
        }

        const elements = document.querySelectorAll<HTMLElement>('[data-ei-reveal], [data-ei-image-reveal]');
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

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [invitationData.id, isLoadingSavedPreview]);

    useEffect(() => {
        if (!isGalleryOpen) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsGalleryOpen(false);
            }

            if (event.key === 'ArrowLeft') {
                setActiveGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
            }

            if (event.key === 'ArrowRight') {
                setActiveGalleryIndex((current) => (current + 1) % galleryImages.length);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [galleryImages.length, isGalleryOpen]);

    const handleWish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const nextWish = {
            name: String(form.get('name') || '').trim(),
            message: String(form.get('message') || '').trim(),
        };

        if (!nextWish.name || !nextWish.message) {
            setWishStatus('Nhập tên và lời chúc giúp dâu rể nha.');
            return;
        }

        try {
            lastSubmittedWishRef.current = nextWish;
            lastSubmittedWishDeliveredRef.current = false;
            await postWhenConfigured(wishEndpoint || invitationData.api.wishEndpoint, nextWish);
            if (!wishEndpoint && !invitationData.api.wishEndpoint) {
                setWishes((current) => [nextWish, ...current]);
            }
            setWishStatus('Dâu rể đã nhận được lời chúc của bạn.');
            formElement.reset();
        } catch {
            if (lastSubmittedWishDeliveredRef.current) {
                setWishStatus('Dâu rể đã nhận được lời chúc của bạn.');
                formElement.reset();
                return;
            }

            setWishStatus('Không thể gửi lời chúc. Vui lòng thử lại.');
        } finally {
            lastSubmittedWishRef.current = null;
        }
    };

    const handleRsvp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const nextRsvp: Rsvp = {
            name: String(form.get('guestName') || '').trim(),
            side: String(form.get('side') || 'groom') as Rsvp['side'],
            attending: String(form.get('attending') || 'yes'),
        };

        if (!nextRsvp.name) {
            setRsvpStatus('Cho dâu rể biết tên bạn trước khi gửi nha.');
            return;
        }

        setRsvpStatus('Cảm ơn bạn, thông tin tham dự đã được ghi nhận.');
        event.currentTarget.reset();
        await postWhenConfigured(invitationData.api.rsvpEndpoint, nextRsvp);
    };

    const openGalleryAt = (index: number) => {
        setActiveGalleryIndex(index);
        setIsGalleryOpen(true);
    };

    if (isLoadingSavedPreview) {
        return (
            <main className="ei-page ei-page-loading" style={pageStyle} aria-busy="true">
                <div className="ei-preview-loading-bar" aria-label="Dang tai ban xem truoc" />
            </main>
        );
    }

    return (
        <>
            {!shouldUseTemplateColors && (
                <aside className="ei-color-dock" aria-label="Lá»±a chá»n mÃ u thiá»‡p">
                    {invitationColorThemes.map((theme) => (
                        <button
                            key={theme.key}
                            className={theme.key === activeThemeKey ? 'is-active' : ''}
                            type="button"
                            onClick={() => setActiveThemeKey(theme.key)}
                            style={{ '--ei-swatch': theme.primary, '--ei-swatch-accent': theme.accent } as CSSProperties}
                            aria-label={`Chá»n mÃ u ${theme.name}`}
                            aria-pressed={theme.key === activeThemeKey}
                            title={theme.name}
                        >
                            <span />
                        </button>
                    ))}
                </aside>
            )}
            <main className={`ei-page${isPreviewMode ? ' ei-page-preview' : ''}`} id="top" style={pageStyle}>
                <section className="ei-hero">
                    <div className="ei-envelope" aria-hidden="true">
                        <div className="ei-envelope-flap" />
                        <Polaroid src={invitationData.images.cover} alt="Ảnh cưới của cô dâu chú rể" className="ei-polaroid-left" onClick={onImageClick ? () => onImageClick('images.cover') : undefined} />
                        <Polaroid src={invitationData.images.kiss} alt="Khoảnh khắc của cô dâu chú rể" className="ei-polaroid-right" onClick={onImageClick ? () => onImageClick('images.kiss') : undefined} />
                        <div className="ei-wax-seal" />
                    </div>
                    <div className="ei-couple-row">
                        <article data-ei-reveal>
                            <div className="ei-line-flower" />
                            <span>{invitationData.couple.groomRole}</span>
                            <h2>{invitationData.couple.groom}</h2>
                        </article>
                        <div data-ei-image-reveal="right">
                            <Polaroid src={invitationData.images.walk} alt="Chú rể và cô dâu" className="ei-polaroid-tilt" onClick={onImageClick ? () => onImageClick('images.walk') : undefined} />
                        </div>
                        <article data-ei-reveal>
                            <span>{invitationData.couple.brideRole}</span>
                            <h2>{invitationData.couple.bride}</h2>
                            <div className="ei-line-flower ei-line-flower-right" />
                        </article>
                    </div>
                    <section className="ei-invite-card" data-ei-reveal>
                        <div className="ei-band">
                            <p>Trân trọng kính mời</p>
                            <h2>Quý khách</h2>
                            <span>Tham dự buổi tiệc thân mật cùng gia đình chúng tôi</span>
                        </div>
                        <p>Vào lúc {invitationData.event.time}</p>
                        <p>{invitationData.event.dayName}</p>
                        <div className="ei-date-line">
                            <span>Tháng {invitationData.event.month}</span>
                            <strong>{invitationData.event.day}</strong>
                            <span>Năm {invitationData.event.year}</span>
                        </div>
                        <em>({invitationData.event.lunar})</em>
                    </section>
                    <div className="ei-countdown">
                        {[
                            ['Ngày', countdown.days],
                            ['Giờ', countdown.hours],
                            ['Phút', countdown.minutes],
                            ['Giây', countdown.seconds],
                        ].map(([label, value]) => (
                            <article key={label}>
                                <strong key={`${label}-${value}`}>{String(value).padStart(2, '0')}</strong>
                                <span>{label}</span>
                            </article>
                        ))}
                    </div>
                    <section className="ei-calendar-section ei-layout-calendar" data-ei-reveal>
                        <div className="ei-calendar-card">
                            <div className="ei-calendar">
                                <div className="ei-weekdays">
                                    {invitationData.calendar.weekdays.map((weekday) => (
                                        <span key={weekday}>{weekday}</span>
                                    ))}
                                </div>
                                <div className="ei-days">
                                    {weddingCalendar.map((cell, index) => (
                                        <span
                                            key={`${cell.monthOffset}-${cell.day}-${index}`}
                                            className={`${cell.isWeddingDay ? 'is-wedding-day' : ''}${cell.monthOffset !== 0 ? ' is-outside-month' : ''}`}
                                        >
                                            {cell.day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                    {shouldShowVenue && <div className="ei-location-card">
                        <h3>Tiệc cưới sẽ diễn ra tại</h3>
                        <strong>{invitationData.event.venue}</strong>
                        <address>{invitationData.event.address}</address>
                        {shouldShowMap && <a href="#map">Xem chỉ đường</a>}
                    </div>}

                </section>

                {shouldShowMap && <section className="ei-map-section ei-layout-map" id="map" data-ei-image-reveal="left">
                    <iframe title="Bản đồ địa điểm cưới" src={mapUrl} loading="lazy" />
                </section>}

                <section className="ei-gallery" data-ei-reveal>
                    <SectionTitle title="Our Memories" subtitle={invitationData.couple.quote} />
                    <div className="ei-gallery-grid">
                        {galleryPreview.map((image, index) => {
                            const isOverlayCard = index === galleryPreview.length - 1 && hiddenGalleryCount > 0;

                            return (
                                <button
                                    key={`${image}-${index}`}
                                    className={`ei-gallery-tile${isOverlayCard ? ' is-overlay' : ''}`}
                                    type="button"
                                    onClick={() => (onImageClick ? onImageClick(`images.gallery.${index}`) : openGalleryAt(index))}
                                    aria-label={`Mở album ảnh cưới, ảnh số ${index + 1}`}
                                >
                                    {image ? (
                                        <img src={image} alt={`Kỷ niệm cưới ${index + 1}`} />
                                    ) : (
                                        <span className="ei-gallery-empty">Chưa có ảnh</span>
                                    )}
                                    {onImageClick && <span className="ei-edit-image-hint">Đổi ảnh</span>}
                                    {isOverlayCard && <span className="ei-gallery-count">+{galleryOverlayCount}</span>}
                                </button>
                            );
                        })}
                    </div>
                    <button className="ei-gallery-open" type="button" onClick={() => openGalleryAt(0)}>
                        Xem toàn bộ <span>{galleryImages.length}</span> ảnh
                    </button>
                </section>

                {isGalleryOpen && (
                    <div className="ei-gallery-modal" role="dialog" aria-modal="true" aria-label="Album ảnh cưới">
                        <button className="ei-gallery-backdrop" type="button" aria-label="Đóng album ảnh" onClick={() => setIsGalleryOpen(false)} />
                        <div className="ei-gallery-panel">
                            <div className="ei-gallery-panel-head">
                                <div>
                                    <p>Album ảnh cưới</p>
                                    <strong>
                                        {activeGalleryIndex + 1}/{galleryImages.length}
                                    </strong>
                                </div>
                                <button className="ei-gallery-close-icon" type="button" aria-label="Quay lại thiệp cưới" onClick={() => setIsGalleryOpen(false)}>
                                    <ArrowLeft size={22} strokeWidth={2.5} />
                                    <span>Quay lại</span>
                                </button>
                            </div>
                            <div className="ei-gallery-viewer">
                                <button
                                    className="ei-gallery-nav is-prev"
                                    type="button"
                                    onClick={() => setActiveGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)}
                                    aria-label="Ảnh trước"
                                >
                                    ‹
                                </button>
                                <figure className="ei-gallery-stage">
                                    <img src={galleryImages[activeGalleryIndex]} alt={`Album cưới ${activeGalleryIndex + 1}`} />
                                </figure>
                                <button
                                    className="ei-gallery-nav is-next"
                                    type="button"
                                    onClick={() => setActiveGalleryIndex((current) => (current + 1) % galleryImages.length)}
                                    aria-label="Ảnh sau"
                                >
                                    ›
                                </button>
                            </div>
                            <div className="ei-gallery-strip" aria-label="Danh sách ảnh thu nhỏ">
                                {galleryImages.map((image, index) => (
                                    <button
                                        key={`${image}-thumb-${index}`}
                                        className={`ei-gallery-thumb${index === activeGalleryIndex ? ' is-active' : ''}`}
                                        type="button"
                                        onClick={() => setActiveGalleryIndex(index)}
                                        aria-label={`Xem ảnh ${index + 1}`}
                                    >
                                        <img loading="lazy" src={image} alt={`Ảnh thu nhỏ ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <section className="ei-wishes" data-ei-reveal>
                    <SectionTitle
                        title="Gửi Lời Chúc"
                        subtitle="Mỗi lời chúc, mỗi sự hiện diện đều là điều đáng quý mà chúng tôi luôn trân trọng."
                    />
                    <form onSubmit={handleWish}>
                        <input name="name" placeholder="Tên của bạn" maxLength={30} />
                        <textarea name="message" placeholder="Lời chúc" rows={4} maxLength={300} />
                        <button type="submit">Gửi</button>
                    </form>
                    {wishStatus && <p className="ei-status">{wishStatus}</p>}
                    {wishes.length > 0 && (
                        <div className="ei-wish-list">
                            {wishes.map((wish) => (
                                <article key={`${wish.name}-${wish.message}`}>
                                    <strong>{wish.name}</strong>
                                    <p>{wish.message}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="ei-rsvp" data-ei-reveal>
                    <SectionTitle
                        title="Xác Nhận Tham Dự"
                        subtitle="Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi."
                    />
                    <form onSubmit={handleRsvp}>
                        <input name="guestName" placeholder="Họ và tên" />
                        <select name="side" defaultValue="groom">
                            <option value="groom">Khách nhà chú rể</option>
                            <option value="bride">Khách nhà cô dâu</option>
                        </select>
                        <select name="attending" defaultValue="yes">
                            <option value="yes">Tôi sẽ tham dự</option>
                            <option value="no">Tôi chưa sắp xếp được</option>
                        </select>
                        <button type="submit">Gửi ngay</button>
                    </form>
                    {rsvpStatus && <p className="ei-status">{rsvpStatus}</p>}
                </section>


                <footer className="ei-thanks" data-ei-reveal>
                    <img
                        src={invitationData.images.thank}
                        alt="Cô dâu chú rể gửi lời cảm ơn"
                        role={onImageClick ? 'button' : undefined}
                        tabIndex={onImageClick ? 0 : undefined}
                        onClick={onImageClick ? () => onImageClick('images.thank') : undefined}
                        onKeyDown={(event) => {
                            if (onImageClick && (event.key === 'Enter' || event.key === ' ')) {
                                event.preventDefault();
                                onImageClick('images.thank');
                            }
                        }}
                    />
                    {onImageClick && <span className="ei-edit-image-hint ei-thanks-hint">Đổi ảnh</span>}
                    <div>
                        <h2>Thank You!</h2>
                        <p>Rất hân hạnh được đón tiếp</p>
                    </div>
                </footer>
            </main>
        </>
    );
}

export default EmeraldInvitation;
