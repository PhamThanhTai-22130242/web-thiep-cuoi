import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import {
    defaultInvitationTemplate,
    defaultWishes,
    InvitationTemplate,
    loadStoredInvitationTemplate,
    Wish,
} from '../data/invitationTemplates';
import './RubyBasicInvitation.css';

type RubyBasicInvitationProps = {
    template?: InvitationTemplate;
    preview?: boolean;
};

const imgFooter = `/img/double-dragon.webp`;

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

function RubyPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
    return (
        <figure className={`rbi-photo ${className}`}>
            <img src={src} alt={alt} />
        </figure>
    );
}

function RubyBasicInvitation({ template, preview = false }: RubyBasicInvitationProps) {
    const invitationData = useMemo(
        () => template || loadStoredInvitationTemplate() || defaultInvitationTemplate,
        [template],
    );
    const galleryImages = useMemo(() => {
        const source = invitationData.images.gallery?.filter(Boolean);
        const fallback = [
            invitationData.images.smile,
            invitationData.images.kiss,
            invitationData.images.studio,
            invitationData.images.cover,
            invitationData.images.walk,
            invitationData.images.thank,
        ];

        return (source && source.length ? source : fallback).slice(0, 20);
    }, [invitationData.images]);
    const galleryPreview = useMemo(() => galleryImages.slice(0, 4), [galleryImages]);
    const hiddenGalleryCount = Math.max(galleryImages.length - galleryPreview.length, 0);
    const [countdown, setCountdown] = useState(() => getCountdown(invitationData.event.date));
    const [wishes, setWishes] = useState<Wish[]>(defaultWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const ornaments = useMemo(() => Array.from({ length: preview ? 8 : 16 }, (_, index) => index), [preview]);

    const pageStyle = {
        '--rbi-red': '#9f2c24',
        '--rbi-red-deep': '#7f1712',
        '--rbi-gold': '#d8b16a',
        '--rbi-paper': '#f6e8dc',
        '--rbi-paper-strong': '#fbf4ee',
        '--rbi-script': `'${invitationData.design.scriptFont}', 'Great Vibes', cursive`,
        '--rbi-serif': `'Cormorant Garamond', '${invitationData.design.serifFont}', Georgia, serif`,
        '--rbi-speed': invitationData.design.animationSpeed,
    } as CSSProperties;

    useEffect(() => {
        setCountdown(getCountdown(invitationData.event.date));
        const timer = window.setInterval(() => {
            setCountdown(getCountdown(invitationData.event.date));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [invitationData.event.date]);

    useEffect(() => {
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
    }, [invitationData.id]);

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
            <div className="rbi-ornaments" aria-hidden="true">
                {ornaments.map((ornament) => (
                    <span
                        key={ornament}
                        style={
                            {
                                '--i': ornament,
                                '--drift': `${((ornament % 5) - 2) * 14}px`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>

            {!preview && <a className="rbi-back-top" href="#top" aria-label="Lên đầu trang">↑</a>}

            <section className="rbi-hero">
                <p className="rbi-hero-kicker" data-rbi-reveal="down">{invitationData.couple.headline}</p>
                <div className="rbi-envelope" aria-hidden="true">
                    <div className="rbi-envelope-flap" />
                    <RubyPhoto src={invitationData.images.cover} alt="Ảnh cưới cô dâu chú rể" className="rbi-photo-left" />
                    <RubyPhoto src={invitationData.images.kiss} alt="Khoảnh khắc cô dâu chú rể" className="rbi-photo-right" />
                    <div className="rbi-seal">囍</div>
                </div>
                <h1 data-rbi-reveal="up">
                    {invitationData.couple.groom} <span>&</span> {invitationData.couple.bride}
                </h1>
                <div className="rbi-date-lockup" data-rbi-reveal="up">
                    <strong>{invitationData.event.year}</strong>
                    <span>{invitationData.event.monthName}</span>
                </div>
            </section>

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

                <div className="rbi-couple-row">
                    <article data-rbi-reveal>
                        <div className="rbi-line-ornament" />
                        <span>{invitationData.couple.groomRole}</span>
                        <h2>{invitationData.couple.groom}</h2>
                    </article>
                    <div data-rbi-image="right">
                        <RubyPhoto src={invitationData.images.walk} alt="Chân dung cô dâu chú rể" className="rbi-photo-center" />
                    </div>
                    <article data-rbi-reveal>
                        <span>{invitationData.couple.brideRole}</span>
                        <h2>{invitationData.couple.bride}</h2>
                        <div className="rbi-line-ornament rbi-line-ornament-right" />
                    </article>
                </div>
            </section>

            <section className="rbi-invite-card" data-rbi-reveal>
                <div className="rbi-band">
                    <p>Trân trọng kính mời</p>
                    <h2>Quý khách</h2>
                    <span>Đến chung vui cùng gia đình chúng tôi trong ngày trọng đại.</span>
                </div>
                <p>Vào lúc {invitationData.event.time}</p>
                <p>{invitationData.event.dayName}</p>
                <div className="rbi-date-line">
                    <span>Tháng {invitationData.event.month}</span>
                    <strong>{invitationData.event.day}</strong>
                    <span>Năm {invitationData.event.year}</span>
                </div>
                <em>({invitationData.event.lunar})</em>
                <div className="rbi-rings" aria-hidden="true" />
                <h3>Tại: {invitationData.event.venue}</h3>
                <address>{invitationData.event.address}</address>
                <a href="#map">Xem chỉ đường</a>
            </section>

            <section className="rbi-map-section" id="map" data-rbi-image="left">
                <iframe title="Bản đồ địa điểm cưới" src={invitationData.event.mapUrl} loading="lazy" />
            </section>

            <section className="rbi-timeline" data-rbi-reveal>
                <RubySectionTitle title="Timeline" subtitle="Khoảnh khắc đẹp sẽ bắt đầu từ những điều chỉn chu nhất." />
                <div className="rbi-timeline-track">
                    {invitationData.timeline.map((item) => (
                        <article key={item.time}>
                            <div className={`rbi-event-icon is-${item.icon}`} />
                            <strong>{item.time}</strong>
                            <span>{item.title}</span>
                        </article>
                    ))}
                </div>
            </section>



            <section className="rbi-gallery" data-rbi-reveal>
                <RubySectionTitle title="Our Memories" subtitle={invitationData.couple.quote} />
                <div className="rbi-gallery-grid">
                    {galleryPreview.map((image, index) => {
                        const isOverlayCard = index === galleryPreview.length - 1 && hiddenGalleryCount > 0;

                        return (
                            <button
                                key={`${image}-${index}`}
                                className={`rbi-gallery-tile${isOverlayCard ? ' is-overlay' : ''}`}
                                type="button"
                                onClick={() => openGalleryAt(index)}
                                aria-label={`Mở album ảnh cưới, ảnh số ${index + 1}`}
                            >
                                <img src={image} alt={`Kỷ niệm cưới ${index + 1}`} />
                                {isOverlayCard && <span>+{hiddenGalleryCount}</span>}
                            </button>
                        );
                    })}
                </div>
                <button className="rbi-gallery-open" type="button" onClick={() => openGalleryAt(0)}>
                    Xem toàn bộ {galleryImages.length} ảnh
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
                    <input name="name" placeholder="Tên của bạn" />
                    <textarea name="message" placeholder="Lời chúc" rows={4} />
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
                <img src={imgFooter} alt="Cô dâu chú rể gửi lời cảm ơn" />
                <div>
                    <h2>Thank You</h2>
                    <p>Rất hân hạnh được đón tiếp</p>
                </div>
            </footer>
        </main>
    );
}

export default RubyBasicInvitation;
