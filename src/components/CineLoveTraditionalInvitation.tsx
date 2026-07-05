import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import './CineLoveTraditionalInvitation.css';
import { decodeGuestName } from '../utils/guest';
import { defaultCineLoveInvitationTemplate, loadCineLovePreview } from '../data/invitationTemplates';
import { subscribeToStompTopic } from '../services/stomp.service';
import { httpRequest } from '../services/http.service';
import InvitationLoadingScreen from './InvitationLoadingScreen';

type WeddingWish = {
    name: string;
    message: string;
};

export type CineLoveInvitationImages = {
    hero: string;
    groom: string;
    bride: string;
    gallery: string[];
    groomQr: string;
    brideQr: string;
};

export type CineLoveInvitationData = {
    groomName: string;
    brideName: string;
    groomIntroName: string;
    brideIntroName: string;
    groomFamilyLabel: string;
    brideFamilyLabel: string;
    groomFather: string;
    groomMother: string;
    brideFather: string;
    brideMother: string;
    inviteText: string;
    guestName: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    address: string;
    mapUrl: string;
    showGiftSection?: boolean;
    showGroomGift: boolean;
    showBrideGift: boolean;
    groomGiftTitle: string;
    brideGiftTitle: string;
    musicTrack: {
        fileUrl: string;
        timeStart: number;
    } | null;
    images: CineLoveInvitationImages;
    slug?: string;
    guestList?: string;
};

type EditableImageTarget =
    | 'images.hero'
    | 'images.groom'
    | 'images.bride'
    | `images.gallery.${number}`
    | 'images.groomQr'
    | 'images.brideQr';

type CineLoveTraditionalInvitationProps = {
    data?: CineLoveInvitationData;
    editable?: boolean;
    onImageClick?: (target: EditableImageTarget, mode?: 'replace' | 'insert') => void;
    initialWishes?: WeddingWish[];
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

export const defaultCineLoveInvitationData: CineLoveInvitationData = {
    slug: defaultCineLoveInvitationTemplate.slug,
    guestList: '',
    groomName: defaultCineLoveInvitationTemplate.couple.groom,
    brideName: defaultCineLoveInvitationTemplate.couple.bride,
    groomIntroName: defaultCineLoveInvitationTemplate.couple.groom,
    brideIntroName: defaultCineLoveInvitationTemplate.couple.bride,
    groomFamilyLabel: defaultCineLoveInvitationTemplate.couple.groomRole,
    brideFamilyLabel: defaultCineLoveInvitationTemplate.couple.brideRole,
    groomFather: 'Ông Nguyễn Viết Minh',
    groomMother: 'Bà Trịnh Thị Lan',
    brideFather: 'Ông Trịnh Văn Huy',
    brideMother: 'Bà Ngô Mai Hoàn',
    inviteText: defaultCineLoveInvitationTemplate.couple.headline,
    guestName: 'Anh Dũng',
    eventDate: getTodayDateValue(),
    eventTime: defaultCineLoveInvitationTemplate.event.time.slice(0, 5),
    venueName: defaultCineLoveInvitationTemplate.event.venue,
    address: defaultCineLoveInvitationTemplate.event.address,
    mapUrl: defaultCineLoveInvitationTemplate.event.mapUrl,
    showGroomGift: true,
    showBrideGift: true,
    groomGiftTitle: 'QR Đến Chú Rể',
    brideGiftTitle: 'QR Đến Cô Dâu',
    musicTrack: null,
    images: {
        hero: defaultCineLoveInvitationTemplate.images.hero || '',
        groom: defaultCineLoveInvitationTemplate.images.groom || '',
        bride: defaultCineLoveInvitationTemplate.images.bride || '',
        gallery: defaultCineLoveInvitationTemplate.images.gallery || [],
        groomQr: defaultCineLoveInvitationTemplate.images.groomQr || '',
        brideQr: defaultCineLoveInvitationTemplate.images.brideQr || '',
    },
};

function getCurrentDateInput() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCurrentTimeInput() {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    return `${hour}:${minute}`;
}

function getMapSrc(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '';
    if (trimmedValue.toLowerCase().includes('<iframe')) {
        return trimmedValue.match(/src=["']([^"']+)["']/i)?.[1]?.trim() || '';
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

function createEmptyEditableData(): CineLoveInvitationData {
    return {
        ...defaultCineLoveInvitationData,
        eventDate: getCurrentDateInput(),
        eventTime: getCurrentTimeInput(),
        images: {
            hero: '',
            groom: '',
            bride: '',
            gallery: ['', '', '', ''],
            groomQr: '',
            brideQr: '',
        },
    };
}

export const emptyCineLoveInvitationData = createEmptyEditableData();

function formatMonthLabel(dateValue: string) {
    const [, month, year] = dateValue.match(/^(\d{4})-(\d{2})-\d{2}$/) || [];
    return month && year ? `${month}.${year}` : '11.2026';
}

function parseEventDate(dateValue: string, fallbackDateValue: string) {
    const normalizedDate = dateValue || fallbackDateValue;
    const match = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const date = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(`${normalizedDate}T00:00:00+07:00`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getEventParts(dateValue: string) {
    const date = parseEventDate(dateValue, defaultCineLoveInvitationData.eventDate);
    if (!date) {
        return { dayName: 'Thứ Hai', day: '16', month: 'Tháng 11', year: '2026', activeDay: 16 };
    }

    const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}`;

    return {
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        day,
        month,
        year: String(date.getFullYear()),
        activeDay: date.getDate(),
    };
}

function getMonthCalendar(dateValue: string) {
    const date = parseEventDate(dateValue, defaultCineLoveInvitationData.eventDate);
    if (!date) {
        return {
            leadingBlanks: 5,
            days: Array.from({ length: 30 }, (_, index) => index + 1),
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

function getCountdownTarget(dateValue: string, timeValue: string) {
    const date = dateValue || defaultCineLoveInvitationData.eventDate;
    const timeMatch = (timeValue || defaultCineLoveInvitationData.eventTime).match(/^(\d{1,2}):(\d{2})/);
    const hour = (timeMatch?.[1] || '00').padStart(2, '0');
    const minute = (timeMatch?.[2] || '00').padStart(2, '0');
    const target = new Date(`${date}T${hour}:${minute}:00+07:00`);

    if (Number.isNaN(target.getTime())) {
        return new Date(`${defaultCineLoveInvitationData.eventDate}T${defaultCineLoveInvitationData.eventTime}:00+07:00`);
    }

    return target;
}

function getCountdown(targetDate: Date) {
    const distance = Math.max(0, targetDate.getTime() - Date.now());

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
    };
}

function formatCountdownPart(value: number) {
    return String(value).padStart(2, '0');
}

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
    target: EditableImageTarget;
    editable?: boolean;
    className?: string;
    onImageClick?: (target: EditableImageTarget, mode?: 'replace' | 'insert') => void;
}) {
    if (!editable) {
        return <img className={className || undefined} src={src} alt={alt} />;
    }

    return (
        <button
            className={`clv-editable-image${className ? ` ${className}` : ''}${src ? '' : ' is-empty'}`}
            type="button"
            onClick={() => onImageClick?.(target)}
            aria-label={`Đổi ${alt}`}
        >
            {src ? <img src={src} alt={alt} /> : <span className="clv-image-placeholder">Thêm ảnh</span>}
            {src && (
                <span className="clv-change-image-badge">
                    <b>+</b>
                    Đổi ảnh
                </span>
            )}
        </button>
    );
}

function scriptNameStyle(name: string): CSSProperties {
    const length = Array.from(name).length;
    const maxSize = Math.max(1.58, 2.32 - Math.max(0, length - 14) * 0.045);
    const preferredSize = Math.max(4.1, 5.3 - Math.max(0, length - 14) * 0.12);

    return {
        '--clv-name-max': `${maxSize.toFixed(2)}rem`,
        '--clv-name-preferred': `${preferredSize.toFixed(2)}vw`,
    } as CSSProperties;
}

function SplitScriptName({ name }: { name: string }) {
    const parts = name.trim().split(/\s+/);
    const lastName = parts.pop() ?? name;
    const familyName = parts.join(' ');

    return (
        <h4 style={scriptNameStyle(name)}>
            {familyName && <span className="clv-name-family">{familyName}</span>}
            <span className="clv-name-given">{lastName}</span>
        </h4>
    );
}

const DEFAULT_INITIAL_WISHES: WeddingWish[] = [];

function CineLoveTraditionalInvitation({
    data,
    editable = false,
    onImageClick,
    initialWishes = DEFAULT_INITIAL_WISHES,
    wishEndpoint = '',
    wishTopic = '',
    rsvpEndpoint = '',
}: CineLoveTraditionalInvitationProps) {
    const [searchParams] = useSearchParams();
    const isPreviewMode = searchParams.get('preview') === '1';
    const [previewData, setPreviewData] = useState<CineLoveInvitationData | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(isPreviewMode && !data);
    const [submitted, setSubmitted] = useState(false);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const [galleryDirection, setGalleryDirection] = useState<'next' | 'prev'>('next');
    const [wishes, setWishes] = useState<WeddingWish[]>(initialWishes);
    const [wishStatus, setWishStatus] = useState('');
    const lastSubmittedWishRef = useRef<WeddingWish | null>(null);
    const lastSubmittedWishDeliveredRef = useRef(false);
    const lastInitialWishesRef = useRef<WeddingWish[]>(initialWishes);

    const invitationData = data ?? previewData ?? defaultCineLoveInvitationData;
    const mapSrc = getMapSrc(invitationData.mapUrl);
    const { guest } = useParams<{ guest?: string }>();
    const guestName = guest
        ? decodeGuestName(guest)
        : (searchParams.get('to') || searchParams.get('guest') || 'Anh Tài Phạm');

    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const musicTrack = invitationData.musicTrack;
    const musicStartTime = Math.max(0, Number(musicTrack?.timeStart || 0));

    const toggleMusic = async () => {
        const audio = audioRef.current;
        if (!audio || !musicTrack?.fileUrl) {
            return;
        }

        if (audio.paused) {
            if (audio.currentTime < musicStartTime) {
                audio.currentTime = musicStartTime;
            }
            try {
                await audio.play();
                setIsMusicPlaying(true);
            } catch {
                setIsMusicPlaying(false);
            }
            return;
        }

        audio.pause();
        setIsMusicPlaying(false);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (editable || !audio || !musicTrack?.fileUrl) {
            return;
        }

        audio.pause();
        audio.currentTime = musicStartTime;
        audio.volume = 0;
        setIsMusicPlaying(false);

        let fadeTimer: NodeJS.Timeout | null = null;

        const startFadeIn = () => {
            if (fadeTimer) clearInterval(fadeTimer);
            audio.volume = 0;
            const duration = 3000; // 3 seconds
            const interval = 50; // smooth updates
            const step = 1 / (duration / interval);
            
            fadeTimer = setInterval(() => {
                const nextVolume = audio.volume + step;
                if (nextVolume >= 1) {
                    audio.volume = 1;
                    if (fadeTimer) clearInterval(fadeTimer);
                } else {
                    audio.volume = nextVolume;
                }
            }, interval);
        };

        const startPlay = async () => {
            try {
                audio.volume = 0;
                await audio.play();
                setIsMusicPlaying(true);
                startFadeIn();
            } catch {
                setIsMusicPlaying(false);
            }
        };

        startPlay();

        const handleInteraction = async () => {
            if (audio.paused) {
                try {
                    audio.volume = 0;
                    await audio.play();
                    setIsMusicPlaying(true);
                    startFadeIn();
                } catch {
                    setIsMusicPlaying(false);
                }
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });

        return () => {
            if (fadeTimer) clearInterval(fadeTimer);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [musicTrack?.fileUrl, musicStartTime, editable]);

    const eventParts = useMemo(() => getEventParts(invitationData.eventDate), [invitationData.eventDate]);
    const monthCalendar = useMemo(() => getMonthCalendar(invitationData.eventDate), [invitationData.eventDate]);
    const countdownTarget = useMemo(
        () => getCountdownTarget(invitationData.eventDate, invitationData.eventTime),
        [invitationData.eventDate, invitationData.eventTime],
    );
    const [countdown, setCountdown] = useState(() => getCountdown(countdownTarget));

    useEffect(() => {
        if (!isPreviewMode || data) {
            return;
        }

        setIsLoadingPreview(true);
        loadCineLovePreview()
            .then((stored) => {
                if (stored && typeof stored === 'object') {
                    setPreviewData(stored as CineLoveInvitationData);
                }
            })
            .catch(() => {
                // Fallback to default if storage read fails
            })
            .finally(() => {
                setIsLoadingPreview(false);
            });
    }, [isPreviewMode, data]);

    useEffect(() => {
        setCountdown(getCountdown(countdownTarget));

        const timer = window.setInterval(() => {
            setCountdown(getCountdown(countdownTarget));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdownTarget]);

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

    useEffect(() => {
        if (!wishTopic || isPreviewMode) {
            return undefined;
        }

        const subscription = subscribeToStompTopic<WeddingWish & { guestName?: string }>(wishTopic, (incomingWish) => {
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
        const revealItems = document.querySelectorAll<HTMLElement>(
            '.clv-page > section:not(.clv-hero), .clv-family-grid article, .clv-memory-card, .clv-time-row, .clv-calendar, .clv-wish-list article, .clv-gift-cards article',
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
        );

        revealItems.forEach((item, index) => {
            item.classList.add('clv-scroll-reveal');
            item.style.setProperty('--clv-reveal-delay', `${Math.min(index % 5, 4) * 0.08}s`);

            if (item.matches('.clv-page > section')) {
                const direction = index % 5 === 1 ? 'left' : index % 5 === 3 ? 'right' : 'up';
                item.dataset.reveal = direction;
            } else if (item.matches('.clv-memory-card:nth-child(4n), .clv-wish-list article:nth-child(4n)')) {
                item.dataset.reveal = 'right';
            } else if (item.matches('.clv-memory-card:nth-child(4n + 2), .clv-wish-list article:nth-child(4n + 2), .clv-family-grid article:nth-child(2)')) {
                item.dataset.reveal = 'left';
            } else {
                item.dataset.reveal = 'up';
            }

            observer.observe(item);
        });

        return () => observer.disconnect();
    }, []);

    if (isLoadingPreview) {
        return <InvitationLoadingScreen className="clv-page" variant="emerald-skeleton" />;
    }

    const galleryImages = invitationData.images.gallery.filter(Boolean);
    const galleryPreview = editable ? invitationData.images.gallery.slice(0, 4) : galleryImages.slice(0, 4);
    const hiddenGalleryCount = Math.max(galleryImages.length - galleryPreview.filter(Boolean).length, 0);
    const giftRecipients = [
        ...(invitationData.showGroomGift ? [{ title: invitationData.groomGiftTitle, qr: invitationData.images.groomQr, target: 'images.groomQr' as const }] : []),
        ...(invitationData.showBrideGift ? [{ title: invitationData.brideGiftTitle, qr: invitationData.images.brideQr, target: 'images.brideQr' as const }] : []),
    ];


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get('guestName') || '').trim();
        const attending = String(form.get('attendance') || 'yes');

        if (!name) {
            alert('Vui lòng nhập tên của bạn trước khi gửi xác nhận.');
            return;
        }

        setSubmitted(true);
        setIsRsvpOpen(false);

        if (rsvpEndpoint) {
            try {
                await httpRequest(rsvpEndpoint, {
                    method: 'POST',
                    body: { name, attending },
                });
            } catch (error) {
                console.error('Failed to submit RSVP:', error);
            }
        }
    };

    const handleWishSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const nextWish = {
            name: String(form.get('wishName') || '').trim(),
            message: String(form.get('wishMessage') || '').trim(),
        };

        if (!nextWish.name || !nextWish.message) {
            setWishStatus('Bạn nhập tên và lời chúc trước khi gửi nha.');
            return;
        }

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

    const openGalleryAt = (index: number) => {
        setGalleryDirection(index >= activeGalleryIndex ? 'next' : 'prev');
        setActiveGalleryIndex(index);
        setIsGalleryOpen(true);
    };

    const showPreviousGalleryImage = () => {
        setGalleryDirection('prev');
        setActiveGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
    };

    const showNextGalleryImage = () => {
        setGalleryDirection('next');
        setActiveGalleryIndex((current) => (current + 1) % galleryImages.length);
    };

    return (
        <main className={`clv-page${editable ? ' is-editing' : ''}`}>
            {musicTrack?.fileUrl && !editable && (
                <>
                    <audio
                        ref={audioRef}
                        src={musicTrack.fileUrl}
                        preload="metadata"
                        onEnded={() => setIsMusicPlaying(false)}
                    />
                    <button
                        className={`clv-music-control-btn${isMusicPlaying ? ' is-playing' : ''}`}
                        type="button"
                        onClick={toggleMusic}
                        aria-label={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
                    >
                        <span className="clv-music-inner">
                            <span className="clv-music-bars">
                                <i style={{ '--bar-height': '22px', '--bar-delay': '-0.2s' } as CSSProperties} />
                                <i style={{ '--bar-height': '14px', '--bar-delay': '-0.4s' } as CSSProperties} />
                                <i style={{ '--bar-height': '8px', '--bar-delay': '-0.1s' } as CSSProperties} />
                                <i style={{ '--bar-height': '18px', '--bar-delay': '-0.3s' } as CSSProperties} />
                            </span>
                        </span>
                    </button>
                </>
            )}
            <section className="clv-hero">
                <div className="clv-hero__top">
                    <span className="clv-save">Save The Date</span>
                </div>
                <h1 className="clv-hero__names">
                    <span className="clv-hero__name is-groom">{invitationData.groomName}</span>
                    <span className="clv-hero__amp">-</span>
                    <span className="clv-hero__name is-bride">{invitationData.brideName}</span>
                </h1>
                <EditablePhoto
                    className="clv-hero__couple"
                    src={invitationData.images.hero}
                    alt={`${invitationData.groomName} và ${invitationData.brideName}`}
                    target="images.hero"
                    editable={editable}
                    onImageClick={onImageClick}
                />
            </section>

            <section className="clv-intro clv-cream-panel">
                <div className="clv-arch-title">
                    <h2>Wedding Invitation</h2>
                </div>

                <div className="clv-family-grid">
                    <article>
                        <h3>{invitationData.groomFamilyLabel}</h3>
                        <div className="clv-parents-wrap">
                            {invitationData.groomFather && <p>{invitationData.groomFather}</p>}
                            {invitationData.groomMother && <p>{invitationData.groomMother}</p>}
                        </div>
                        <div className="clv-portrait">
                            <EditablePhoto
                                src={invitationData.images.groom}
                                alt={`Chú rể ${invitationData.groomName}`}
                                target="images.groom"
                                editable={editable}
                                onImageClick={onImageClick}
                            />
                        </div>
                        <SplitScriptName name={invitationData.groomIntroName} />
                    </article>

                    <span className="clv-amp">&amp;</span>

                    <article>
                        <h3>{invitationData.brideFamilyLabel}</h3>
                        <div className="clv-parents-wrap">
                            {invitationData.brideFather && <p>{invitationData.brideFather}</p>}
                            {invitationData.brideMother && <p>{invitationData.brideMother}</p>}
                        </div>
                        <div className="clv-portrait">
                            <EditablePhoto
                                src={invitationData.images.bride}
                                alt={`Cô dâu ${invitationData.brideName}`}
                                target="images.bride"
                                editable={editable}
                                onImageClick={onImageClick}
                            />
                        </div>
                        <SplitScriptName name={invitationData.brideIntroName} />
                    </article>
                </div>

                <div className="clv-countdown" aria-label="Đếm ngược ngày cưới">
                    {[
                        ['days', 'NGÀY', countdown.days],
                        ['hours', 'GIỜ', countdown.hours],
                        ['minutes', 'PHÚT', countdown.minutes],
                        ['seconds', 'GIÂY', countdown.seconds],
                    ].map(([key, label, value]) => (
                        <div key={key}>
                            <strong key={value}>{formatCountdownPart(Number(value))}</strong>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="clv-invite clv-bordered-panel">
                <p className="clv-event-title">{invitationData.inviteText}</p>
                <p className="clv-guest-name">{guestName}</p>

                <div className="clv-time-row">
                    <span>{invitationData.eventTime}</span>
                    <strong>
                        <span className="clv-time-row__label">{eventParts.dayName}</span>
                        <em>{eventParts.day}</em>
                        <span className="clv-time-row__label">{eventParts.month}</span>
                    </strong>
                    <span>{eventParts.year}</span>
                </div>

                <div className="clv-calendar">
                    <div className="clv-calendar__head">{formatMonthLabel(invitationData.eventDate)}</div>
                    <div className="clv-calendar__body">
                        <span className="clv-year-watermark">{eventParts.year}</span>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                            <strong key={day}>{day}</strong>
                        ))}
                        {Array.from({ length: monthCalendar.leadingBlanks }, (_, index) => (
                            <span key={`empty-${index}`} />
                        ))}
                        {monthCalendar.days.map((day) => (
                            <span className={day === eventParts.activeDay ? 'clv-calendar__active' : ''} key={day}>
                                {day}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="clv-location clv-bordered-panel">
                <h2>Địa Điểm Tổ Chức</h2>
                <p>
                    {invitationData.venueName}
                    {invitationData.venueName && invitationData.address && (
                        <>
                            ,
                            <br />
                        </>
                    )}
                    {invitationData.address}
                </p>
                {mapSrc ? (
                    <iframe
                        title="Bản đồ địa điểm tổ chức tiệc cưới"
                        src={mapSrc}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : null}
            </section>

            <section className="clv-memories">
                <div className="clv-memories__title">
                    <h2>Our Memories</h2>
                    <p>Lưu giữ những khoảnh khắc ngọt ngào nhất của tình yêu chúng mình</p>
                </div>

                <div className="clv-memories__grid">
                    {galleryPreview.map((image, index) => {
                        const isOverlayCard = index === galleryPreview.length - 1 && hiddenGalleryCount > 0;

                        return (
                            <button
                                key={`${image || 'empty'}-${index}`}
                                className={`clv-memory-card${isOverlayCard ? ' is-overlay' : ''}${image ? '' : ' is-empty'}`}
                                type="button"
                                onClick={() => (editable ? onImageClick?.(`images.gallery.${index}`, 'replace') : openGalleryAt(index))}
                                aria-label={`Mở album ảnh cưới, ảnh số ${index + 1}`}
                            >
                                {image ? (
                                    <>
                                        <img src={image} alt={`Kỷ niệm cưới ${index + 1}`} />
                                        {editable && (
                                            <span className="clv-change-image-badge">
                                                <b>+</b>
                                                Đổi ảnh
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="clv-image-placeholder">Thêm ảnh</span>
                                        <span className="clv-change-image-badge">
                                            <b>+</b>
                                            Đổi ảnh
                                        </span>
                                    </>
                                )}
                                {isOverlayCard && <span className="clv-memory-card__count">+{hiddenGalleryCount}</span>}
                            </button>
                        );
                    })}
                </div>

                <button className="clv-memories__open" type="button" onClick={() => openGalleryAt(0)} disabled={!galleryImages.length}>
                    Xem toàn bộ <span>{galleryImages.length}</span> ảnh
                </button>
            </section>

            <section className="clv-wishes">
                <div className="clv-wishes__title">
                    <h2>Gửi Lời Chúc</h2>
                    <p>Mỗi lời chúc, mỗi sự hiện diện đều là điều đáng quý mà chúng tôi luôn trân trọng.</p>
                </div>

                <form className="clv-wish-form" onSubmit={handleWishSubmit}>
                    <input name="wishName" type="text" placeholder="Tên của bạn" maxLength={30} />
                    <textarea name="wishMessage" placeholder="Lời chúc" rows={5} maxLength={300} />
                    <button type="submit">Gửi</button>
                </form>

                {wishStatus && <p className="clv-wish-status">{wishStatus}</p>}

                <div className="clv-wish-list" aria-label="Danh sách lời chúc">
                    {wishes.length ? (
                        wishes.map((wish) => (
                            <article key={`${wish.name}-${wish.message}`}>
                                <strong>{wish.name}</strong>
                                <p>{wish.message}</p>
                            </article>
                        ))
                    ) : (
                        <p className="clv-wish-empty">Chưa có lời chúc nào</p>
                    )}
                </div>
            </section>

            {invitationData.showGiftSection !== false && (
                <section className="clv-gift">
                    <div className="clv-gift__copy">
                        <h2>Hộp Quà Cưới</h2>
                        <p>Nếu muốn gửi một món quà nhỏ thay lời chúc, tụi mình xin nhận bằng tất cả sự trân quý.</p>
                    </div>
                    <button className="clv-gift__button" type="button" onClick={() => setIsGiftOpen(true)}>
                        Hộp Quà Cưới
                    </button>
                </section>
            )}

            <section className="clv-rsvp clv-bordered-panel">
                <h2>Xác Nhận Tham Dự</h2>
                <p className="clv-rsvp-copy">Hồi âm của bạn là một niềm vui thật đẹp trong ngày chung đôi.</p>
                <button
                    className="clv-rsvp-open"
                    type="button"
                    onClick={() => {
                        if (!submitted) {
                            setIsRsvpOpen(true);
                        }
                    }}
                >
                    {submitted ? 'Đã ghi nhận lời mời' : 'Gửi lời xác nhận'}
                </button>
            </section>

            {isRsvpOpen && (
                <div className="clv-rsvp-modal" role="dialog" aria-modal="true" aria-labelledby="clv-rsvp-title">
                    <button
                        className="clv-rsvp-backdrop"
                        type="button"
                        aria-label="Đóng hộp xác nhận"
                        onClick={() => setIsRsvpOpen(false)}
                    />
                    <div className="clv-rsvp-dialog">
                        <button
                            className="clv-rsvp-close"
                            type="button"
                            aria-label="Đóng"
                            onClick={() => setIsRsvpOpen(false)}
                        >
                            ×
                        </button>
                        <p className="clv-rsvp-kicker">Trân trọng kính mời</p>
                        <h2 id="clv-rsvp-title">Xác nhận tham dự</h2>
                        <form className="clv-rsvp-form" onSubmit={handleSubmit}>
                            <label>
                                Họ và tên
                                <input name="guestName" type="text" placeholder="Nhập tên của bạn" />
                            </label>

                            <fieldset>
                                <legend>Bạn sẽ tham dự chứ?</legend>
                                <label>
                                    <input defaultChecked name="attendance" type="radio" value="yes" />
                                    Có, tôi sẽ tham dự
                                </label>
                                <label>
                                    <input name="attendance" type="radio" value="no" />
                                    Tôi bận, rất tiếc không thể tham dự
                                </label>
                            </fieldset>

                            <button type="submit">{submitted ? 'Đã ghi nhận' : 'Gửi xác nhận'}</button>
                        </form>
                    </div>
                </div>
            )}

            {isGiftOpen && (
                <div className="clv-gift-modal" role="dialog" aria-modal="true" aria-labelledby="clv-gift-title">
                    <button className="clv-gift-backdrop" type="button" aria-label="Đóng hộp quà cưới" onClick={() => setIsGiftOpen(false)} />
                    <div className="clv-gift-dialog">
                        <button className="clv-gift-close" type="button" aria-label="Đóng" onClick={() => setIsGiftOpen(false)}>
                            ×
                        </button>
                        <h2 id="clv-gift-title" className="clv-gift-modal-title">Hộp quà cưới</h2>
                        <div className="clv-gift-cards">
                            {giftRecipients.map((recipient) => (
                                <article key={recipient.title}>
                                    <h3>{recipient.title}</h3>
                                    <div className="clv-gift-qr">
                                        <EditablePhoto
                                            src={recipient.qr}
                                            alt={`QR chuyển khoản ${recipient.title}`}
                                            target={recipient.target}
                                            editable={editable}
                                            onImageClick={onImageClick}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isGalleryOpen && createPortal(
                <div className="clv-gallery-modal" role="dialog" aria-modal="true" aria-label="Album ảnh cưới">
                    <button className="clv-gallery-backdrop" type="button" aria-label="Đóng album ảnh" onClick={() => setIsGalleryOpen(false)} />
                    <div className="clv-gallery-panel">
                        <div className="clv-gallery-panel__head">
                            <div>
                                <p>Album ảnh cưới</p>
                                <strong>
                                    {activeGalleryIndex + 1}/{galleryImages.length}
                                </strong>
                            </div>
                            <button type="button" onClick={() => setIsGalleryOpen(false)}>
                                Đóng
                            </button>
                        </div>

                        <div className="clv-gallery-viewer">
                            <button className="clv-gallery-nav is-prev" type="button" onClick={showPreviousGalleryImage} aria-label="Ảnh trước" />
                            <figure className="clv-gallery-stage">
                                <img
                                    key={activeGalleryIndex}
                                    className={`is-${galleryDirection}`}
                                    src={galleryImages[activeGalleryIndex]}
                                    alt={`Album cưới ${activeGalleryIndex + 1}`}
                                />
                            </figure>
                            <button className="clv-gallery-nav is-next" type="button" onClick={showNextGalleryImage} aria-label="Ảnh sau" />
                        </div>

                        <div className="clv-gallery-strip" aria-label="Danh sách ảnh thu nhỏ">
                            {galleryImages.map((image, index) => (
                                <button
                                    key={`${image}-thumb-${index}`}
                                    className={`clv-gallery-thumb${index === activeGalleryIndex ? ' is-active' : ''}`}
                                    type="button"
                                    onClick={() => {
                                        setGalleryDirection(index >= activeGalleryIndex ? 'next' : 'prev');
                                        setActiveGalleryIndex(index);
                                    }}
                                    aria-label={`Xem ảnh ${index + 1}`}
                                >
                                    <img loading="lazy" src={image} alt={`Ảnh thu nhỏ ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <section className="clv-ending">
                <p>Thank You!</p>
            </section>
        </main>
    );
}

export default CineLoveTraditionalInvitation;
