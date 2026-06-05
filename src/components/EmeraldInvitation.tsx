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
    const countdownTargetDate = getCountdownTargetDate(invitationData.event);
    const weddingCalendar = getWeddingCalendar(invitationData.event);
    const shouldShowVenue = Boolean(invitationData.event.venue?.trim());
    const [countdown, setCountdown] = useState(() => getCountdown(countdownTargetDate));
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
        setCountdown(getCountdown(countdownTargetDate));
        const timer = window.setInterval(() => {
            setCountdown(getCountdown(countdownTargetDate));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdownTargetDate]);

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
                                    <strong key={`${label}-${value}`}>{String(value).padStart(2, '0')}</strong>
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
                    {shouldShowVenue && <h3>Tại: {invitationData.event.venue}</h3>}
                    {shouldShowVenue && <address>{invitationData.event.address}</address>}
                    {shouldShowVenue && <a href="#map">Xem chỉ đường</a>}
                </div>

                {shouldShowVenue && <div className="ei-map-card" data-ei-image-reveal="left">
                    <div className="ei-map-copy">
                        <span>Venue Guide</span>
                        <h3>{invitationData.event.venue}</h3>
                        <p>{invitationData.event.address}</p>
                    </div>
                    <section className="ei-map-section" id="map">
                        <iframe title="Bản đồ địa điểm cưới" src={invitationData.event.mapUrl} loading="lazy" />
                    </section>
                </div>}
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
                    <input name="name" placeholder="Tên của bạn" maxLength={30} />
                    <input name="message" placeholder="Lời chúc" maxLength={300} />
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
