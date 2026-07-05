import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Gift, MapPin, Send, X } from 'lucide-react';
import InvitationLoadingScreen, { useInvitationImagePreload } from './InvitationLoadingScreen';
import './ElegantInvitation.css';
import { decodeGuestName } from '../utils/guest';
import { subscribeToStompTopic } from '../services/stomp.service';
import { httpRequest } from '../services/http.service';
import { loadElegantPreview, defaultElegantInvitationTemplate } from '../data/invitationTemplates';

export interface ElegantInvitationData {
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
    musicTrack: {
        fileUrl: string;
        timeStart: number;
    } | null;
    images: {
        cover: string;
        hero: string;
        portraitOne: string;
        portraitTwo: string;
        groomQr: string;
        brideQr: string;
        gallery: string[];
    };
    guestList?: string;
}

export type EditableElegantImageTarget =
    | 'images.cover'
    | 'images.hero'
    | 'images.portraitOne'
    | 'images.portraitTwo'
    | `images.gallery.${number}`
    | 'images.groomQr'
    | 'images.brideQr';

type ElegantInvitationProps = {
    data?: ElegantInvitationData;
    editable?: boolean;
    onImageClick?: (target: EditableElegantImageTarget, mode?: 'replace' | 'insert') => void;
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

export const defaultElegantInvitationData: ElegantInvitationData = {
    slug: '',
    guestList: '',
    groomName: defaultElegantInvitationTemplate.couple.groom || 'Thanh Sơn',
    brideName: defaultElegantInvitationTemplate.couple.bride || 'Diệu Nhi',
    groomIntroName: defaultElegantInvitationTemplate.couple.groom || 'Thanh Sơn',
    brideIntroName: defaultElegantInvitationTemplate.couple.bride || 'Diệu Nhi',
    groomFamilyLabel: 'Nhà trai',
    brideFamilyLabel: 'Nhà gái',
    groomFather: 'Ông: Nguyễn Gia Bảo',
    groomMother: 'Bà: Hoàng Thị Cúc',
    brideFather: 'Ông: Đào Duy Linh',
    brideMother: 'Bà: Tô Thị Như',
    inviteText: defaultElegantInvitationTemplate.couple.headline || 'Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.',
    eventDate: getTodayDateValue(),
    eventTime: defaultElegantInvitationTemplate.event.time ? defaultElegantInvitationTemplate.event.time.replace(' giờ ', ':') : '08:00',
    venueName: defaultElegantInvitationTemplate.event.venue || 'Tư gia nhà trai',
    address: defaultElegantInvitationTemplate.event.address || '43A ngõ 26 Phạm Ngọc Thạch, Đống Đa, TP. Hà Nội',
    mapUrl: defaultElegantInvitationTemplate.event.mapUrl || 'https://maps.google.com',
    showGroomGift: true,
    showBrideGift: true,
    showGiftSection: true,
    musicTrack: null,
    images: {
        cover: defaultElegantInvitationTemplate.images.cover || '',
        hero: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773752594568-1768964174030-615120422_925471073144357_5596178545909683221_n.webp',
        portraitOne: defaultElegantInvitationTemplate.images.kiss || '',
        portraitTwo: defaultElegantInvitationTemplate.images.walk || '',
        groomQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%20xxxx%20xxxx%20xxxx%20THANH%20SON%20MUNG%20CUOI',
        brideQr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%20xxxx%20xxxx%20xxxx%20DIEU%20NHI%20MUNG%20CUOI',
        gallery: defaultElegantInvitationTemplate.images.gallery || [],
    }
};

export const emptyElegantInvitationData: ElegantInvitationData = {
    ...defaultElegantInvitationData,
    images: {
        cover: '',
        hero: '',
        portraitOne: '',
        portraitTwo: '',
        groomQr: '',
        brideQr: '',
        gallery: Array(8).fill(''),
    }
};

const sealImage = 'https://miuwedding.com/assets/images/side-card-icon.png';

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
    target: EditableElegantImageTarget;
    editable?: boolean;
    className?: string;
    onImageClick?: (target: EditableElegantImageTarget, mode?: 'replace' | 'insert') => void;
}) {
    if (!editable) {
        return <img className={className || undefined} src={src} alt={alt} />;
    }

    return (
        <button
            className={`qp-editable-image${className ? ` ${className}` : ''}${src ? '' : ' is-empty'}`}
            type="button"
            onClick={() => onImageClick?.(target)}
            aria-label={`Đổi ${alt}`}
        >
            {src ? <img src={src} alt={alt} /> : <span className="qp-image-placeholder">Thêm ảnh</span>}
            {src && (
                <span className="qp-change-image-badge">
                    <b>+</b>
                    Đổi ảnh
                </span>
            )}
        </button>
    );
}

function getEventParts(dateValue: string) {
    const date = new Date(`${dateValue || defaultElegantInvitationData.eventDate}T00:00:00+07:00`);
    if (Number.isNaN(date.getTime())) {
        return { dayName: 'Thứ Năm', day: '31', month: '12', year: '2026' };
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

function ElegantInvitation({
    data,
    editable = false,
    onImageClick,
    initialWishes = DEFAULT_INITIAL_WISHES,
    wishEndpoint = '',
    wishTopic = '',
    rsvpEndpoint = '',
}: ElegantInvitationProps) {
    const [searchParams] = useSearchParams();
    const isPreviewMode = searchParams.get('preview') === '1';
    const [previewData, setPreviewData] = useState<ElegantInvitationData | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(isPreviewMode && !data);
    const [isOpeningVisible, setIsOpeningVisible] = useState(true);
    const [isOpeningOut, setIsOpeningOut] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [submittedRsvp, setSubmittedRsvp] = useState(false);
    const [wishes, setWishes] = useState(initialWishes);
    const [wishStatus, setWishStatus] = useState('');
    const lastSubmittedWishRef = useRef<{ name: string; message: string } | null>(null);
    const lastSubmittedWishDeliveredRef = useRef(false);
    const lastInitialWishesRef = useRef<{ name: string; message: string }[]>(initialWishes);

    const invitationData = data ?? previewData ?? defaultElegantInvitationData;
    const { guest } = useParams<{ guest?: string }>();
    const guestName = guest
        ? decodeGuestName(guest)
        : (searchParams.get('to') || searchParams.get('guest') || 'Quý khách');

    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const musicTrack = invitationData.musicTrack;
    const musicStartTime = Math.max(0, Number(musicTrack?.timeStart || 0));

    const startFadeIn = (audio: HTMLAudioElement) => {
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        audio.volume = 0;
        const duration = 3000; // 3 seconds
        const interval = 50; // smooth updates
        const step = 1 / (duration / interval);
        
        fadeTimerRef.current = setInterval(() => {
            const nextVolume = audio.volume + step;
            if (nextVolume >= 1) {
                audio.volume = 1;
                if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
            } else {
                audio.volume = nextVolume;
            }
        }, interval);
    };

    const playWithFadeIn = async () => {
        const audio = audioRef.current;
        if (!audio || !musicTrack?.fileUrl) return;
        try {
            audio.volume = 0;
            if (audio.currentTime < musicStartTime) {
                audio.currentTime = musicStartTime;
            }
            await audio.play();
            setIsMusicPlaying(true);
            startFadeIn(audio);
        } catch {
            setIsMusicPlaying(false);
        }
    };

    const toggleMusic = async () => {
        const audio = audioRef.current;
        if (!audio || !musicTrack?.fileUrl) {
            return;
        }

        if (audio.paused) {
            await playWithFadeIn();
            return;
        }

        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
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

        playWithFadeIn();

        const handleInteraction = async () => {
            if (audio.paused) {
                await playWithFadeIn();
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });

        return () => {
            if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [musicTrack?.fileUrl, musicStartTime, editable]);

    const eventParts = useMemo(() => getEventParts(invitationData.eventDate), [invitationData.eventDate]);
    const isDefaultDate = invitationData.eventDate === '2026-12-31';

    const preloadImages = useMemo(() => {
        return [
            invitationData.images.cover,
            invitationData.images.hero,
            invitationData.images.portraitOne,
            invitationData.images.portraitTwo,
            ...invitationData.images.gallery,
            sealImage,
            '/img/flower.png',
            '/img/flower2.png',
            '/img/flower3.png',
        ].filter(Boolean);
    }, [invitationData.images]);

    const areImagesLoading = useInvitationImagePreload(onImageClick ? [] : preloadImages);

    // Load preview data if in preview mode
    useEffect(() => {
        if (!isPreviewMode || data) {
            return;
        }

        setIsLoadingPreview(true);
        loadElegantPreview()
            .then((stored) => {
                if (stored && typeof stored === 'object') {
                    setPreviewData(stored as ElegantInvitationData);
                }
            })
            .catch(() => { })
            .finally(() => {
                setIsLoadingPreview(false);
            });
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
        if (areImagesLoading || isLoadingPreview) {
            return undefined;
        }

        const items = document.querySelectorAll<HTMLElement>('[data-qp-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.05 },
        );

        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, [areImagesLoading, isLoadingPreview]);

    const openInvitation = () => {
        setIsOpeningOut(true);
        window.setTimeout(() => setIsOpeningVisible(false), 1800);
        playWithFadeIn();
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

    const rawGallery = invitationData.images.gallery || [];
    const normalizedGallery = [...rawGallery, ...Array(Math.max(0, 20 - rawGallery.length)).fill('')];
    const filledGallery = normalizedGallery.filter(Boolean);
    const lastFilledIndex = normalizedGallery.reduce((acc, curr, idx) => curr ? idx : acc, -1);
    const visibleCount = Math.min(20, Math.max(6, lastFilledIndex + 2));
    const galleryToRender = editable
        ? normalizedGallery.slice(0, visibleCount)
        : filledGallery;
    const groomFamilyMembers = [invitationData.groomFather, invitationData.groomMother].filter((member) => member.trim());
    const brideFamilyMembers = [invitationData.brideFather, invitationData.brideMother].filter((member) => member.trim());

    if (areImagesLoading || isLoadingPreview) {
        return <InvitationLoadingScreen className="qp-page" variant="emerald-skeleton" />;
    }

    const isOpened = isOpeningOut || editable;

    return (
        <main className={`qp-page${editable ? ' is-editing' : ''}${isOpened ? ' is-opened' : ''}`}>
            {musicTrack?.fileUrl && !editable && (
                <>
                    <audio
                        ref={audioRef}
                        src={musicTrack.fileUrl}
                        preload="metadata"
                        onEnded={() => setIsMusicPlaying(false)}
                    />
                    <button
                        className={`elgt-music-control-btn${isMusicPlaying ? ' is-playing' : ''}`}
                        type="button"
                        onClick={toggleMusic}
                        aria-label={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
                    >
                        <span className="elgt-music-inner">
                            <span className="elgt-music-bars">
                                <i style={{ '--bar-height': '22px', '--bar-delay': '-0.2s' } as CSSProperties} />
                                <i style={{ '--bar-height': '14px', '--bar-delay': '-0.4s' } as CSSProperties} />
                                <i style={{ '--bar-height': '8px', '--bar-delay': '-0.1s' } as CSSProperties} />
                                <i style={{ '--bar-height': '18px', '--bar-delay': '-0.3s' } as CSSProperties} />
                            </span>
                        </span>
                    </button>
                </>
            )}
            {isOpeningVisible && !editable && (
                <section className={`qp-opening${isOpeningOut ? ' is-open' : ''}`} aria-label="Mở thiệp cưới">
                    <div className="qp-opening-side qp-opening-left">
                        <div className="qp-opening-save">S<span>ave our date</span></div>
                        <div className="qp-opening-names">
                            <strong>{invitationData.groomName}</strong>
                            <em>&amp;</em>
                            <strong>{invitationData.brideName}</strong>
                        </div>
                        <p>Trân trọng kính mời</p>
                        <b>{guestName}</b>
                    </div>
                    <div className="qp-opening-side qp-opening-right" />
                    <button className="qp-opening-seal" type="button" onClick={openInvitation} aria-label="Mở thiệp">
                        <img src={sealImage} alt="" />
                    </button>
                    <button className="qp-opening-cta" type="button" onClick={openInvitation}>
                        Mở thiệp
                    </button>
                </section>
            )}

            <section className="qp-hero">
                <EditablePhoto
                    src={invitationData.images.cover}
                    alt={`${invitationData.groomName} và ${invitationData.brideName}`}
                    target="images.cover"
                    editable={editable}
                    onImageClick={onImageClick}
                />
                <div className="qp-hero-copy">
                    <span>Wedding by</span>
                    <h1>
                        <span className="qp-hero-groom">{invitationData.groomName}</span>
                        <b className="qp-hero-bride">{invitationData.brideName}</b>
                    </h1>
                    <p>{eventParts.day}.{eventParts.month.padStart(2, '0')}.{eventParts.year}</p>
                </div>
            </section>

            <section className="qp-formal-invite" data-qp-reveal>
                <img className="qp-formal-flower" src="/img/flower.png" alt="" aria-hidden="true" />
                <div className="qp-formal-family">
                    <article>
                        <h2>{invitationData.groomFamilyLabel}</h2>
                        {groomFamilyMembers.map((member, index) => (
                            <p key={`groom-family-${index}`}>{member}</p>
                        ))}
                    </article>
                    <span aria-hidden="true" />
                    <article>
                        <h2>{invitationData.brideFamilyLabel}</h2>
                        {brideFamilyMembers.map((member, index) => (
                            <p key={`bride-family-${index}`}>{member}</p>
                        ))}
                    </article>
                </div>
                <p className="qp-formal-intro">Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.</p>
                <h2 className="qp-formal-names">
                    <img className="qp-name-flower is-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                    <img className="qp-name-flower is-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                    <img className="qp-name-flower is-small" src="/img/flower3.png" alt="" aria-hidden="true" />
                    <span>{invitationData.groomName}</span>
                    <em>and</em>
                    <span>{invitationData.brideName}</span>
                </h2>
                <p className="qp-formal-ceremony">Hôn lễ được tổ chức</p>
                <div className="qp-formal-date">
                    <span>{invitationData.eventTime}</span>
                    <strong>
                        <span>{eventParts.dayName}</span>
                        <em>{eventParts.day}</em>
                        <span>Tháng {eventParts.month}</span>
                    </strong>
                    <span>{eventParts.year}</span>
                </div>
                {isDefaultDate && (
                    <em className="qp-formal-lunar">(Tức ngày 23 tháng 11 năm Bính Ngọ)</em>
                )}
                <p className="qp-formal-place-label">Tại địa điểm</p>
                <h3>{invitationData.venueName}</h3>
                <address>{invitationData.address}</address>
                {invitationData.mapUrl && (
                    <a href={invitationData.mapUrl} target="_blank" rel="noreferrer">
                        <MapPin size={22} />
                        Chỉ đường
                    </a>
                )}
            </section>

            <section className="qp-couple-profile" data-qp-reveal>
                <img className="qp-couple-flower qp-couple-flower-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-small is-top" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-small is-mid" src="/img/flower3.png" alt="" aria-hidden="true" />

                <article className="qp-profile-card qp-profile-groom">
                    <div className="qp-profile-copy">
                        <em>Chú rể</em>
                        <h2>{invitationData.groomName}</h2>
                    </div>
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.portraitOne}
                            alt={`Chú rể ${invitationData.groomName}`}
                            target="images.portraitOne"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                </article>

                <img className="qp-profile-seal" src={sealImage} alt="" aria-hidden="true" />

                <article className="qp-profile-card qp-profile-bride">
                    <figure>
                        <EditablePhoto
                            src={invitationData.images.portraitTwo}
                            alt={`Cô dâu ${invitationData.brideName}`}
                            target="images.portraitTwo"
                            editable={editable}
                            onImageClick={onImageClick}
                        />
                    </figure>
                    <div className="qp-profile-copy">
                        <em>Cô dâu</em>
                        <h2>{invitationData.brideName}</h2>
                    </div>
                </article>
            </section>

            <section className="qp-album" data-qp-reveal>
                <img className="qp-album-flower is-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-album-flower is-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                <h2>
                    <span className="qp-album-word is-album">Album</span>
                    <span className="qp-album-word is-of">of</span>
                    <span className="qp-album-word is-love">Love</span>
                </h2>
                <div className="qp-album-grid">
                    {galleryToRender.map((image, index) => (
                        <figure
                            key={`album-img-${index}`}
                            className={index % 3 === 0 ? 'is-large' : ''}
                            data-qp-reveal
                        >
                            <EditablePhoto
                                src={image}
                                alt={`Album cưới ${index + 1}`}
                                target={`images.gallery.${index}`}
                                editable={editable}
                                onImageClick={onImageClick}
                            />
                        </figure>
                    ))}
                </div>
            </section>

            <section className="qp-rsvp" data-qp-reveal>
                <h2>Xác Nhận Tham Dự</h2>
                <p>Việc xác nhận giúp chúng mình chuẩn bị chu đáo hơn. Cảm ơn bạn!</p>
                <form onSubmit={handleRsvpSubmit}>
                    <input name="name" placeholder="Họ và tên" required />
                    <div className="qp-radio-row">
                        <label><input type="radio" name="attend" value="yes" defaultChecked /> Có, tôi sẽ tham dự</label>
                        <label><input type="radio" name="attend" value="no" /> Xin lỗi, tôi bận mất rồi!</label>
                    </div>
                    <button type="submit">{submittedRsvp ? 'Đã xác nhận' : 'Xác nhận'}</button>
                </form>
            </section>

            <section className="qp-wishes" data-qp-reveal>
                <h2>Sổ lưu bút</h2>
                <p>Cảm ơn bạn rất nhiều vì đã gửi những lời chúc mừng tốt đẹp nhất đến đám cưới của chúng tôi!</p>
                <form onSubmit={handleWishSubmit}>
                    <input name="name" placeholder="Tên của bạn" maxLength={40} required />
                    <textarea name="message" placeholder="Gửi lời chúc" rows={4} maxLength={260} required />
                    <button type="submit">
                        <Send size={17} />
                        Gửi lời chúc
                    </button>
                </form>
                {wishStatus && <b className="qp-status">{wishStatus}</b>}
                <div className="qp-wish-list">
                    {wishes.map((wish, index) => (
                        <article key={`wish-${index}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            {invitationData.showGiftSection !== false && (
                <section className="qp-gift" data-qp-reveal>
                    <button type="button" onClick={() => setIsGiftOpen(true)}>
                        <Gift size={18} />
                        Quà mừng cưới
                    </button>
                </section>
            )}

            {isGiftOpen && (
                <div className="qp-gift-modal" role="dialog" aria-modal="true" aria-label="Quà mừng cưới">
                    <button className="qp-gift-backdrop" type="button" onClick={() => setIsGiftOpen(false)} aria-label="Đóng" />
                    <section className="qp-gift-panel">
                        <button className="qp-close" type="button" onClick={() => setIsGiftOpen(false)} aria-label="Đóng">
                            <X size={20} />
                        </button>
                        <h2>Quà mừng cưới</h2>
                        <div className="qp-gift-qrs">
                            {invitationData.showGroomGift && (
                                <figure className="qp-gift-qr-card">
                                    <figcaption>Mừng cưới Chú rể</figcaption>
                                    <EditablePhoto
                                        src={invitationData.images.groomQr}
                                        alt="QR Chú rể"
                                        target="images.groomQr"
                                        editable={editable}
                                        onImageClick={onImageClick}
                                    />
                                </figure>
                            )}
                            {invitationData.showBrideGift && (
                                <figure className="qp-gift-qr-card">
                                    <figcaption>Mừng cưới Cô dâu</figcaption>
                                    <EditablePhoto
                                        src={invitationData.images.brideQr}
                                        alt="QR Cô dâu"
                                        target="images.brideQr"
                                        editable={editable}
                                        onImageClick={onImageClick}
                                    />
                                </figure>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default ElegantInvitation;
