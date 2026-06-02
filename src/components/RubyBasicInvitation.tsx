import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import {
    defaultInvitationTemplate,
    defaultWishes,
    InvitationTemplate,
    loadPreviewInvitationTemplate,
    loadStoredInvitationTemplate,
    rubyTemplatePreviewStorageKey,
    rubyTemplateStorageKey,
    Wish,
} from '../data/invitationTemplates';
import './RubyBasicInvitation.css';

type RubyBasicInvitationProps = {
    template?: InvitationTemplate;
    preview?: boolean;
    onImageClick?: (target: string) => void;
};

const rubyFallbackImages = {
    cover: 'https://felywedding.com/wp-content/uploads/2023/03/100-5.jpg',
    kiss: 'https://tuart.net/wp-content/uploads/2022/11/315473918_808354887122087_2957267466775816451_n.jpg',
    studio: 'https://mimosawedding.net/wp-content/uploads/2022/07/chup-anh-cuoi-phong-cach-han-quoc-4-4.jpg',
    defaultThank: defaultInvitationTemplate.images.thank,
    thank: '/img/double-dragon.webp',
};

function getCountdown(targetDate: string) {
    const distance = Math.max(new Date(targetDate).getTime() - Date.now(), 0);

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
    };
}

function RubySectionTitle({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
    return (
        <div className="rbi-section-title">
            {label && <p>{label}</p>}
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
        </div>
    );
}

function RubyPhoto({ src, alt, className, onClick }: { src: string; alt: string; className: string; onClick?: () => void }) {
    const hasImage = Boolean(src);

    return (
        <figure className={`rbi-photo ${className}${onClick ? ' is-editable' : ''}${!hasImage ? ' is-empty' : ''}`} onClick={onClick}>
            {hasImage ? <img src={src} alt={alt} /> : <span className="rbi-photo-empty">Chưa có ảnh</span>}
            {onClick && <span className="rbi-edit-image-hint">Đổi ảnh</span>}
        </figure>
    );
}

function RubyBasicInvitation({ template, preview = false, onImageClick }: RubyBasicInvitationProps) {
    const shouldLoadSavedPreview = !template && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1';
    const [savedPreviewTemplate, setSavedPreviewTemplate] = useState<InvitationTemplate | null>(null);
    const invitationData = template || savedPreviewTemplate || (shouldLoadSavedPreview ? defaultInvitationTemplate : loadStoredInvitationTemplate(rubyTemplateStorageKey)) || defaultInvitationTemplate;
    const invitationImages = useMemo(() => {
        if (onImageClick) {
            return {
                ...invitationData.images,
                thank: rubyFallbackImages.thank,
            };
        }

        return {
            ...invitationData.images,
            cover: invitationData.images.cover || rubyFallbackImages.cover,
            kiss: invitationData.images.kiss || rubyFallbackImages.kiss,
            studio: invitationData.images.studio || rubyFallbackImages.studio,
            thank: !invitationData.images.thank || invitationData.images.thank === rubyFallbackImages.defaultThank ? rubyFallbackImages.thank : invitationData.images.thank,
        };
    }, [invitationData.images, onImageClick]);
    const galleryImages = useMemo(() => {
        if (onImageClick) {
            const editableGallery = invitationImages.gallery || [];
            return Array.from({ length: Math.max(4, editableGallery.length) }, (_, index) => editableGallery[index] || '');
        }

        const source = invitationImages.gallery?.filter(Boolean);
        const fallback = [
            invitationImages.smile,
            invitationImages.kiss,
            invitationImages.studio,
            invitationImages.cover,
            invitationImages.walk,
            invitationImages.thank,
        ];

        return (source && source.length ? source : fallback).slice(0, 20);
    }, [invitationImages, onImageClick]);
    const galleryPreview = useMemo(() => galleryImages.slice(0, 4), [galleryImages]);
    const hiddenGalleryCount = Math.max(galleryImages.length - galleryPreview.length, 0);
    const eventTimeParts = useMemo(() => {
        const match = invitationData.event.time.match(/^(\d{1,2})\s*(?:giờ|:)\s*(\d{2})$/i);

        return match ? { hour: match[1], minute: match[2] } : null;
    }, [invitationData.event.time]);
    const [countdown, setCountdown] = useState(() => getCountdown(invitationData.event.date));
    const [wishes, setWishes] = useState<Wish[]>(defaultWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const pageStyle = {
        '--rbi-red': invitationData.design.primaryColor || '#9f2c24',
        '--rbi-red-deep': invitationData.design.primaryColor || '#7f1712',
        '--rbi-gold': invitationData.design.accentColor || '#d8b16a',
        '--rbi-paper': invitationData.design.backgroundColor || '#f6e8dc',
        '--rbi-paper-strong': '#fbf4ee',
        '--rbi-script': `'${invitationData.design.scriptFont}', 'Great Vibes', cursive`,
        '--rbi-serif': `'Cormorant Garamond', '${invitationData.design.serifFont}', Georgia, serif`,
        '--rbi-speed': invitationData.design.animationSpeed,
    } as CSSProperties;

    useEffect(() => {
        if (!shouldLoadSavedPreview) {
            return undefined;
        }

        let isActive = true;
        loadPreviewInvitationTemplate(rubyTemplatePreviewStorageKey).then((previewTemplate) => {
            if (isActive && previewTemplate) {
                setSavedPreviewTemplate(previewTemplate);
            }
        });

        return () => {
            isActive = false;
        };
    }, [shouldLoadSavedPreview]);

    useEffect(() => {
        setCountdown(getCountdown(invitationData.event.date));
        const timer = window.setInterval(() => {
            setCountdown(getCountdown(invitationData.event.date));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [invitationData.event.date]);

    useEffect(() => {
        if (shouldLoadSavedPreview && !savedPreviewTemplate) {
            return undefined;
        }

        const elements = document.querySelectorAll<HTMLElement>('[data-rbi-reveal], [data-rbi-image]');
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
    }, [invitationData.id, savedPreviewTemplate, shouldLoadSavedPreview]);

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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [galleryImages.length, isGalleryOpen]);

    useEffect(() => {
        if (!isGalleryOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isGalleryOpen]);

    const handleWish = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const nextWish = {
            name: String(form.get('name') || '').trim(),
            message: String(form.get('message') || '').trim(),
        };

        if (!nextWish.name || !nextWish.message) {
            setWishStatus('Vui lòng nhập tên và lời chúc để gửi đến cô dâu chú rể.');
            return;
        }

        setWishes((current) => [nextWish, ...current]);
        setWishStatus('Cảm ơn bạn, lời chúc đã được gửi thành công.');
        event.currentTarget.reset();
    };

    const openGalleryAt = (index: number) => {
        setActiveGalleryIndex(index);
        setIsGalleryOpen(true);
    };

    const showPreviousGalleryImage = () => {
        setActiveGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
    };

    const showNextGalleryImage = () => {
        setActiveGalleryIndex((current) => (current + 1) % galleryImages.length);
    };

    return (
        <main className={`rbi-page${preview ? ' rbi-page-preview' : ''}`} id="top" style={pageStyle}>
            <section className="rbi-hero">
                <div className="rbi-envelope" aria-hidden="true">
                    <div className="rbi-envelope-flap" />
                    <RubyPhoto src={invitationImages.cover} alt="Ảnh cưới cô dâu chú rể" className="rbi-photo-left" onClick={onImageClick ? () => onImageClick('images.cover') : undefined} />
                    <RubyPhoto src={invitationImages.kiss} alt="Khoảnh khắc cô dâu chú rể" className="rbi-photo-right" onClick={onImageClick ? () => onImageClick('images.kiss') : undefined} />
                    <div className="rbi-seal">囍</div>
                </div>
                <div className="rbi-couple-row">
                    <article data-rbi-reveal>
                        <div className="rbi-line-ornament" />
                        <span>{invitationData.couple.groomRole}</span>
                        <h2>{invitationData.couple.groom}</h2>
                    </article>
                    <div data-rbi-image="right">
                        <RubyPhoto src={invitationImages.studio} alt="Chân dung cô dâu chú rể" className="rbi-photo-center" onClick={onImageClick ? () => onImageClick('images.studio') : undefined} />
                    </div>
                    <article data-rbi-reveal>
                        <span>{invitationData.couple.brideRole}</span>
                        <h2>{invitationData.couple.bride}</h2>
                        <div className="rbi-line-ornament rbi-line-ornament-right" />
                    </article>
                </div>

                <section className="rbi-invite-card" data-rbi-reveal>
                    <div className="rbi-band">
                        <p>Trân trọng kính mời</p>
                        <h2>Quý khách</h2>
                        <span>Đến chung vui cùng gia đình chúng tôi trong ngày trọng đại.</span>
                    </div>
                    <p className="rbi-invite-time">
                        Vào lúc{' '}
                        {eventTimeParts ? (
                            <>
                                <span>{eventTimeParts.hour}</span> giờ <span>{eventTimeParts.minute}</span>
                            </>
                        ) : (
                            invitationData.event.time
                        )}
                    </p>
                    <p>{invitationData.event.dayName}</p>
                    <div className="rbi-date-line">
                        <span>Tháng {invitationData.event.month}</span>
                        <strong>{invitationData.event.day}</strong>
                        <span>Năm {invitationData.event.year}</span>
                    </div>
                    <em>({invitationData.event.lunar})</em>

                </section>

                <div className="rbi-countdown">
                    {[
                        ['Ngày', countdown.days],
                        ['Giờ', countdown.hours],
                        ['Phút', countdown.minutes],
                        ['Giây', countdown.seconds],
                    ].map(([label, value]) => (
                        <article key={label}>
                            <strong>{String(value).padStart(2, '0')}</strong>
                            <span>{label}</span>
                        </article>
                    ))}
                </div>



                <section className="rbi-calendar-section" data-rbi-reveal>
                    <div className="rbi-calendar-card">
                        <div className="rbi-weekdays">
                            {invitationData.calendar.weekdays.map((weekday) => (
                                <span key={weekday}>{weekday}</span>
                            ))}
                        </div>


                        <div className="rbi-days">
                            {Array.from({ length: invitationData.calendar.blanks }, (_, index) => (
                                <span key={`blank-${index}`} />
                            ))}
                            {invitationData.calendar.days.map((day) => (
                                <span key={day} className={day === Number(invitationData.event.day) ? 'is-wedding-day' : ''}>
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="rbi-location-card">

                    <h3>Tiệc cưới sẽ diễn ra tại</h3>
                    <address>{invitationData.event.address}</address>
                    <a href="#map">Xem chỉ đường</a>
                </div>


                {/* <div className="rbi-date-lockup" data-rbi-reveal="up">
                    <strong>{invitationData.event.year}</strong>
                    <span>{invitationData.event.monthName}</span>
                </div> */}
            </section>



            <section className="rbi-map-section" id="map" data-rbi-image="left">
                <iframe title="Bản đồ địa điểm cưới" src={invitationData.event.mapUrl} loading="lazy" />
            </section>
            <section className="rbi-gallery" data-rbi-reveal>
                <RubySectionTitle title="Our Memories" subtitle={invitationData.couple.quote} />
                <div className="rbi-gallery-grid">
                    {galleryPreview.map((image, index) => {
                        const isOverlayCard = index === galleryPreview.length - 1 && hiddenGalleryCount > 0;

                        return (
                            <button
                                key={`${image}-${index}`}
                                className={`rbi-gallery-tile${isOverlayCard ? ' is-overlay' : ''}${!image ? ' is-empty' : ''}`}
                                type="button"
                                onClick={() => (onImageClick ? onImageClick(`images.gallery.${index}`) : openGalleryAt(index))}
                                aria-label={`Mở album ảnh cưới, ảnh số ${index + 1}`}
                            >
                                {image ? <img src={image} alt={`Kỷ niệm cưới ${index + 1}`} /> : <span className="rbi-gallery-empty">Chưa có ảnh</span>}
                                {onImageClick && <span className="rbi-edit-image-hint">Đổi ảnh</span>}
                                {isOverlayCard && <span>+{hiddenGalleryCount}</span>}
                            </button>
                        );
                    })}
                </div>
                <button className="rbi-gallery-open" type="button" onClick={() => openGalleryAt(0)}>
                    Xem toàn bộ <span>{galleryImages.length}</span> ảnh
                </button>
            </section>

            {isGalleryOpen && (
                <div className="rbi-gallery-modal" role="dialog" aria-modal="true" aria-label="Album ảnh cưới">
                    <button className="rbi-gallery-backdrop" type="button" aria-label="Đóng album ảnh" onClick={() => setIsGalleryOpen(false)} />
                    <div className="rbi-gallery-panel">
                        <div className="rbi-gallery-panel-head">
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
                        <div className="rbi-gallery-viewer">
                            <button className="rbi-gallery-nav is-prev" type="button" onClick={showPreviousGalleryImage} aria-label="Ảnh trước">
                                ‹
                            </button>
                            <figure className="rbi-gallery-stage">
                                <img src={galleryImages[activeGalleryIndex]} alt={`Album cưới ${activeGalleryIndex + 1}`} />
                            </figure>
                            <button className="rbi-gallery-nav is-next" type="button" onClick={showNextGalleryImage} aria-label="Ảnh sau">
                                ›
                            </button>
                        </div>
                        <div className="rbi-gallery-strip" aria-label="Danh sách ảnh thu nhỏ">
                            {galleryImages.map((image, index) => (
                                <button
                                    key={`${image}-thumb-${index}`}
                                    className={`rbi-gallery-thumb${index === activeGalleryIndex ? ' is-active' : ''}`}
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
            <section className="rbi-wishes" data-rbi-reveal>
                <RubySectionTitle
                    title="Gửi Lời Chúc"
                    subtitle="Mỗi lời chúc đều là một dấu ấn đẹp mà cô dâu chú rể luôn trân trọng."
                />
                <form onSubmit={handleWish}>
                    <input name="name" placeholder="Tên của bạn" maxLength={30} />
                    <textarea name="message" placeholder="Lời chúc" rows={4} maxLength={300} />
                    <button type="submit">Gửi</button>
                </form>
                {wishStatus && <p className="rbi-status">{wishStatus}</p>}
                <div className="rbi-wish-list">
                    {wishes.map((wish) => (
                        <article key={`${wish.name}-${wish.message}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            <footer className="rbi-thanks" data-rbi-reveal>
                <img
                    src={invitationImages.thank}
                    alt="Cô dâu chú rể gửi lời cảm ơn"
                />
                <div>
                    <h2>Thank You</h2>
                    <p>Rất hân hạnh được đón tiếp</p>
                </div>
            </footer>
        </main>
    );
}

export default RubyBasicInvitation;
