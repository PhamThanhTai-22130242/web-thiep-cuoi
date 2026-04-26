import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import {
    defaultInvitationTemplate,
    defaultWishes,
    InvitationTemplate,
    loadStoredInvitationTemplate,
    Rsvp,
    Wish,
} from '../data/invitationTemplates';
import './EmeraldInvitation.css';

type EmeraldInvitationProps = {
    template?: InvitationTemplate;
    preview?: boolean;
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

async function postWhenConfigured<T>(endpoint: string, payload: T) {
    if (!endpoint) {
        return;
    }

    await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
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

function Polaroid({ src, alt, className }: { src: string; alt: string; className: string }) {
    return (
        <figure className={`ei-polaroid ${className}`}>
            <img src={src} alt={alt} />
        </figure>
    );
}

function EmeraldInvitation({ template, preview = false }: EmeraldInvitationProps) {
    const invitationData = useMemo(
        () => template || loadStoredInvitationTemplate() || defaultInvitationTemplate,
        [template],
    );
    const [countdown, setCountdown] = useState(() => getCountdown(invitationData.event.date));
    const [wishes, setWishes] = useState<Wish[]>(defaultWishes);
    const [wishStatus, setWishStatus] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState('');
    const petals = useMemo(() => Array.from({ length: preview ? 12 : 26 }, (_, index) => index), [preview]);

    const pageStyle = {
        '--ei-green': invitationData.design.primaryColor,
        '--ei-green-dark': invitationData.design.primaryColor,
        '--ei-paper': invitationData.design.backgroundColor,
        '--ei-gold': invitationData.design.accentColor,
        '--ei-script': `'${invitationData.design.scriptFont}', 'Great Vibes', cursive`,
        '--ei-serif': `'${invitationData.design.serifFont}', Georgia, serif`,
        '--ei-name-size': `${invitationData.design.nameSize}px`,
        '--ei-heading-size': `${invitationData.design.headingSize}px`,
        '--ei-speed': invitationData.design.animationSpeed,
    } as CSSProperties;

    useEffect(() => {
        setCountdown(getCountdown(invitationData.event.date));
        const timer = window.setInterval(() => {
            setCountdown(getCountdown(invitationData.event.date));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [invitationData.event.date]);

    useEffect(() => {
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
    }, [invitationData.id]);

    const handleWish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const nextWish = {
            name: String(form.get('name') || '').trim(),
            message: String(form.get('message') || '').trim(),
        };

        if (!nextWish.name || !nextWish.message) {
            setWishStatus('Nhập tên và lời chúc giúp dâu rể nha.');
            return;
        }

        setWishes((current) => [nextWish, ...current]);
        setWishStatus('Dâu rể đã nhận được lời chúc của bạn.');
        event.currentTarget.reset();
        await postWhenConfigured(invitationData.api.wishEndpoint, nextWish);
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

    return (
        <main className={`ei-page${preview ? ' ei-page-preview' : ''}`} id="top" style={pageStyle}>
            <div className="ei-petals" aria-hidden="true">
                {petals.map((petal) => (
                    <span
                        key={petal}
                        style={
                            {
                                '--i': petal,
                                '--drift': `${((petal % 7) - 3) * 18}px`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>

            {!preview && <a className="ei-back-top" href="#top" aria-label="Lên đầu trang">↑</a>}

            <section className="ei-hero">
                <div className="ei-hero-topline" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <p className="ei-hero-kicker" data-ei-reveal="down">
                    {invitationData.couple.headline}
                </p>
                <div className="ei-envelope" aria-hidden="true">
                    <div className="ei-envelope-flap" />
                    <Polaroid src={invitationData.images.cover} alt="Ảnh cưới của cô dâu chú rể" className="ei-polaroid-left" />
                    <Polaroid src={invitationData.images.kiss} alt="Khoảnh khắc của cô dâu chú rể" className="ei-polaroid-right" />
                    <div className="ei-wax-seal" />
                </div>
                <h1 data-ei-reveal="up">
                    {invitationData.couple.groom} <span>&</span> {invitationData.couple.bride}
                </h1>
                <div className="ei-year-lockup" data-ei-reveal="up">
                    <strong>{invitationData.event.year}</strong>
                    <span>{invitationData.event.monthName}</span>
                </div>
                <div className="ei-hero-summary" data-ei-reveal>
                    <article>
                        <small>Thời gian</small>
                        <strong>{invitationData.event.time}</strong>
                    </article>
                    <article>
                        <small>Địa điểm</small>
                        <strong>{invitationData.event.venue}</strong>
                    </article>
                </div>
            </section>

            <section className="ei-calendar-section" data-ei-reveal>
                <div className="ei-calendar-shell">
                    <div className="ei-calendar-card">
                        <div className="ei-calendar-copy">
                            <span>Lịch cưới</span>
                            <h3>{invitationData.event.dayName}</h3>
                            <p>
                                {invitationData.event.day}/{invitationData.event.month}/{invitationData.event.year}
                            </p>
                        </div>
                        <div className="ei-calendar">
                            <div className="ei-weekdays">
                                {invitationData.calendar.weekdays.map((weekday) => (
                                    <span key={weekday}>{weekday}</span>
                                ))}
                            </div>
                            <div className="ei-days">
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
                    </div>

                    <div className="ei-countdown-shell">
                        <div className="ei-countdown-head">
                            <span>Countdown</span>
                            <p>Đếm ngược tới khoảnh khắc chúng mình gặp nhau trong ngày vui.</p>
                        </div>
                        <div className="ei-countdown">
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
                    </div>
                </div>

                <div className="ei-couple-row">
                    <article data-ei-reveal>
                        <div className="ei-line-flower" />
                        <span>{invitationData.couple.groomRole}</span>
                        <h2>{invitationData.couple.groom}</h2>
                    </article>
                    <div data-ei-image-reveal="right">
                        <Polaroid src={invitationData.images.walk} alt="Chú rể và cô dâu" className="ei-polaroid-tilt" />
                    </div>
                    <article data-ei-reveal>
                        <span>{invitationData.couple.brideRole}</span>
                        <h2>{invitationData.couple.bride}</h2>
                        <div className="ei-line-flower ei-line-flower-right" />
                    </article>
                </div>
            </section>

            <section className="ei-details-stage" data-ei-reveal>
                <div className="ei-invite-card">
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
                    <div className="ei-rings" aria-hidden="true" />
                    <h3>Tại: {invitationData.event.venue}</h3>
                    <address>{invitationData.event.address}</address>
                    <a href="#map">Xem chỉ đường</a>
                </div>

                <div className="ei-map-card" data-ei-image-reveal="left">
                    <div className="ei-map-copy">
                        <span>Venue Guide</span>
                        <h3>{invitationData.event.venue}</h3>
                        <p>{invitationData.event.address}</p>
                    </div>
                    <section className="ei-map-section" id="map">
                        <iframe title="Bản đồ địa điểm cưới" src={invitationData.event.mapUrl} loading="lazy" />
                    </section>
                </div>
            </section>

            <section className="ei-timeline" data-ei-reveal>
                <SectionTitle title="Timeline" subtitle="Lịch trình được sắp xếp gọn gàng để mọi khoảnh khắc đều thật đẹp." />
                <div className="ei-timeline-track">
                    {invitationData.timeline.map((item) => (
                        <article key={item.time} className={`ei-icon-${item.icon}`}>
                            <div className="ei-event-icon" />
                            <strong>{item.time}</strong>
                            <span>{item.title}</span>
                        </article>
                    ))}
                </div>
            </section>

            <section className="ei-wishes" data-ei-reveal>
                <SectionTitle
                    title="Gửi Lời Chúc"
                    subtitle="Mỗi lời chúc, mỗi sự hiện diện đều là điều đáng quý mà chúng tôi luôn trân trọng."
                />
                <form onSubmit={handleWish}>
                    <input name="name" placeholder="Tên của bạn" />
                    <input name="message" placeholder="Lời chúc" />
                    <button type="submit">Gửi</button>
                </form>
                {wishStatus && <p className="ei-status">{wishStatus}</p>}
                <div className="ei-wish-list">
                    {wishes.map((wish) => (
                        <article key={`${wish.name}-${wish.message}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="ei-gallery" data-ei-reveal>
                <SectionTitle title="Our Memories" subtitle={invitationData.couple.quote} />
                <div className="ei-gallery-grid">
                    {[invitationData.images.smile, invitationData.images.kiss, invitationData.images.studio, invitationData.images.cover, invitationData.images.walk].map((image, index) => (
                        <img key={image} src={image} alt={`Kỷ niệm cưới ${index + 1}`} />
                    ))}
                </div>
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
                <img src={invitationData.images.thank} alt="Cô dâu chú rể gửi lời cảm ơn" />
                <div>
                    <h2>Thank You!</h2>
                    <p>Rất hân hạnh được đón tiếp</p>
                </div>
            </footer>
        </main>
    );
}

export default EmeraldInvitation;
