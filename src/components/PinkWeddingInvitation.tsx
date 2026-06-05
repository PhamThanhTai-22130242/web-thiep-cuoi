import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Gift, MapPin, Music2, Pause, Send, X } from 'lucide-react';
import './PinkWeddingInvitation.css';

const onlineImages = {
    groom: 'https://statics.pancake.vn/web-media/7f/6f/61/20/2b9e24ef51d59835b6c74e6218402757d78081a5f9bd66fa867b8964-w:966-h:1449-l:61481-t:image/jpeg.jpg',
    bride: 'https://statics.pancake.vn/web-media/68/f6/c9/2a/d2232636059e3a84124def4c0061d5efa5a88c4de2a7d962d8ce5d11-w:966-h:1449-l:71766-t:image/jpeg.jpg',
    embrace: 'https://statics.pancake.vn/web-media/dd/9c/8c/a8/87a897b01d024f8789f8083f9e089b531c2718a9a15d53e8df35459e-w:966-h:1449-l:250805-t:image/jpeg.jpg',
    standing: 'https://statics.pancake.vn/web-media/80/ef/b5/09/6c1db6a25f68b4dca4e44de83c669091bc58a717a12864f63da21990-w:966-h:644-l:136924-t:image/jpeg.jpg',
    kiss: 'https://statics.pancake.vn/web-media/51/18/dd/f1/a0df37532a6fd765e12b1bd4e6a7e7c0abd73b2a2d4b46a6bf5c5cae-w:966-h:1449-l:303373-t:image/jpeg.jpg',
    galleryOne: 'https://statics.pancake.vn/web-media/19/2f/08/ba/9cbbd36cdcb549e04381d24960a29385e3cf93c9c871d2441e3e59e6-w:966-h:1449-l:170170-t:image/jpeg.jpg',
    galleryTwo: 'https://statics.pancake.vn/web-media/bf/bd/74/d1/12e5fe573cba95d32bc536066e948593c1e7e8d983e02b6b0da34f89-w:966-h:1449-l:117292-t:image/jpeg.jpg',
    galleryThree: 'https://statics.pancake.vn/web-media/1d/8e/aa/61/bbcf792d619ed12ba766e768fedad8ce41647e73b392783b22cde128-w:966-h:1449-l:192299-t:image/jpeg.jpg',
    galleryFour: 'https://statics.pancake.vn/web-media/a0/f8/a6/4f/94cc6154da9818df09077753959de47054802f403ee687189cda6b00-w:966-h:1449-l:346091-t:image/jpeg.jpg',
};

const galleryImages = [
    onlineImages.embrace,
    onlineImages.standing,
    onlineImages.kiss,
    onlineImages.galleryOne,
    onlineImages.galleryTwo,
    onlineImages.galleryThree,
    onlineImages.galleryFour,
    onlineImages.groom,
    onlineImages.bride,
];

const wishesSeed = [
    { name: 'Minh Anh', message: 'Chúc Minh Hoàng và Mai Hương một đời bình an, yêu thương và luôn chọn nhau.' },
    { name: 'Gia đình cô Ba', message: 'Chúc hai con trăm năm hạnh phúc, ngày vui thật trọn vẹn.' },
];

const giftAccounts = [
    {
        role: 'Chú rể',
        name: 'Minh Hoàng',
        bank: 'MBBANK',
        account: '8838683860',
        qr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%208838683860%20MINH%20HOANG%20MUNG%20CUOI',
    },
    {
        role: 'Cô dâu',
        name: 'Mai Hương',
        bank: 'MBBANK',
        account: '0123456789',
        qr: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=MBBANK%200123456789%20MAI%20HUONG%20MUNG%20CUOI',
    },
];

function PinkSectionTitle({ title, eyebrow }: { title: string; eyebrow?: string }) {
    return (
        <div className="pwi-section-title">
            {eyebrow && <span>{eyebrow}</span>}
            <h2>{title}</h2>
        </div>
    );
}

function PinkWeddingInvitation() {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [wishes, setWishes] = useState(wishesSeed);
    const [wishStatus, setWishStatus] = useState('');
    const calendarDays = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);

    useEffect(() => {
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
    }, []);

    const handleWishSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get('name') || '').trim();
        const message = String(form.get('message') || '').trim();

        if (!name || !message) {
            setWishStatus('Bạn nhập tên và lời chúc giúp mình nhé.');
            return;
        }

        setWishes((current) => [{ name, message }, ...current]);
        setWishStatus('Cảm ơn bạn, lời chúc đã được gửi đến cô dâu chú rể.');
        event.currentTarget.reset();
    };

    return (
        <main className="pwi-page">
            <button
                className={`pwi-music-button${isMusicPlaying ? ' is-playing' : ''}`}
                type="button"
                onClick={() => setIsMusicPlaying((current) => !current)}
                aria-label={isMusicPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
                title={isMusicPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
            >
                {isMusicPlaying ? <Pause size={18} /> : <Music2 size={18} />}
            </button>

            {false && (
            <section className="pwi-cover">
                <div className="pwi-cover-photo">
                    <img src={onlineImages.standing} alt="Minh Hoàng và Mai Hương" />
                </div>
                <div className="pwi-cover-text">
                    <p>Wedding Invitation</p>
                    <h1>
                        Minh Hoàng
                        <span>&amp;</span>
                        Mai Hương
                    </h1>
                    <strong>14.12.2025</strong>
                </div>
            </section>

            )}

            <section className="pwi-save-photo" data-pwi-reveal>
                <div className="pwi-save-heading">
                    <span>Save The Date</span>
                    <h2>
                        <span>Minh Hoàng</span>
                        <b>&amp;</b>
                        <span>Mai Hương</span>
                    </h2>
                </div>
                <figure>
                    <img src={onlineImages.standing} alt="Ảnh cưới Minh Hoàng và Mai Hương" />
                </figure>
                <div className="pwi-save-time">
                    <strong>18:00</strong>
                    <span>Chủ Nhật</span>
                    <b>14.12</b>
                    <em>2025</em>
                </div>
                <p>(Tức Ngày 25 Tháng 10 Năm Ất Tỵ)</p>
            </section>

            <section className="pwi-family" data-pwi-reveal>
                <article className="pwi-person-row">
                    <figure>
                        <img src={onlineImages.groom} alt="Chú rể Minh Hoàng" />
                    </figure>
                    <div>
                        <span>Nhà trai</span>
                        <strong>Ông Trần Quốc Tuấn</strong>
                        <strong>Bà Lê Thị Mỹ Duyên</strong>
                        <p>Quận 4, TP. Hồ Chí Minh</p>
                        <em>Chú Rể</em>
                        <h2>Minh Hoàng</h2>
                    </div>
                </article>

                <article className="pwi-person-row is-reversed">
                    <figure>
                        <img src={onlineImages.bride} alt="Cô dâu Mai Hương" />
                    </figure>
                    <div>
                        <span>Nhà gái</span>
                        <strong>Ông Phạm Gia Long</strong>
                        <strong>Bà Nguyễn Thị Ngọc Hạnh</strong>
                        <p>Quận 8, TP. Hồ Chí Minh</p>
                        <em>Cô Dâu</em>
                        <h2>Mai Hương</h2>
                    </div>
                </article>
            </section>

            <section className="pwi-letter" data-pwi-reveal>
                <PinkSectionTitle title="Thư Mời" />
                <p>Tham dự lễ cưới Minh Hoàng &amp; Mai Hương</p>
                <div className="pwi-letter-gallery">
                    <figure>
                        <img src={onlineImages.embrace} alt="Ảnh cưới cô dâu chú rể" />
                    </figure>
                    <figure>
                        <img src={onlineImages.standing} alt="Ảnh cưới đứng trong vườn" />
                    </figure>
                    <figure>
                        <img src={onlineImages.kiss} alt="Khoảnh khắc cưới lãng mạn" />
                    </figure>
                </div>
            </section>

            <section className="pwi-ceremony" data-pwi-reveal>
                <h2>Lễ Thành Hôn</h2>
                <span>Vào Lúc</span>
                <div className="pwi-date-lockup">
                    <p>14 giờ 00</p>
                    <strong>
                        Chủ Nhật
                        <b>14</b>
                        Tháng 12
                    </strong>
                    <p>Năm 2025</p>
                </div>
                <em>(Tức Ngày 25 Tháng 10 Năm Ất Tỵ)</em>
                <p>Tại Tư Gia Nhà Trai</p>

                <article className="pwi-party-card">
                    <h3>Tiệc Mừng Lễ Thành Hôn</h3>
                    <p>18:00 - Chủ Nhật</p>
                    <strong>14.12.2025</strong>
                    <em>(Tức Ngày 25 Tháng 10 Năm Ất Tỵ)</em>
                    <span>Tại Adora Center - Phú Nhuận</span>
                </article>
            </section>

            <section className="pwi-calendar" data-pwi-reveal>
                <h2>
                    Save The Date
                    <span>Tháng 12 - 2025</span>
                </h2>
                <div className="pwi-calendar-card">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((weekday) => (
                        <strong key={weekday}>{weekday}</strong>
                    ))}
                    {calendarDays.map((day) => (
                        <span key={day} className={day === 14 ? 'is-wedding-day' : day % 7 === 0 ? 'is-weekend' : ''}>
                            {day}
                        </span>
                    ))}
                </div>
            </section>

            <section className="pwi-location" data-pwi-reveal>
                <PinkSectionTitle title="Địa Điểm Tổ Chức" />
                <div className="pwi-location-info">
                    <MapPin size={54} strokeWidth={1.8} />
                    <div>
                        <h3>Adora Center - Phú Nhuận</h3>
                        <address>431 Hoàng Văn Thụ, Phường 4, TP. Hồ Chí Minh</address>
                    </div>
                </div>
                <a className="pwi-map-button" href="https://maps.app.goo.gl/KhdfShPWXwXHfDR49" target="_blank" rel="noreferrer">
                    Xem Chỉ Đường
                </a>
                <iframe
                    title="Bản đồ Adora Center Phú Nhuận"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4204.701851603388!2d106.6593982!3d10.7984131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529d96e56d9bd%3A0x205428f74d7f4ddb!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgLSBUaeG7h2MgY8aw4bubaSBUaGUgQURPUkE!5e1!3m2!1svi!2s!4v1764416160404!5m2!1svi!2s"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </section>

            <section className="pwi-gallery" data-pwi-reveal>
                <PinkSectionTitle title="Album Hình Cưới" />
                <div className="pwi-gallery-grid">
                    {galleryImages.map((image, index) => (
                        <figure key={image} className={index % 5 === 1 ? 'is-wide' : ''}>
                            <img src={image} alt={`Album hình cưới ${index + 1}`} loading="lazy" />
                        </figure>
                    ))}
                </div>
            </section>

            <section className="pwi-actions" data-pwi-reveal>
                <button type="button" onClick={() => setIsGiftOpen(true)}>
                    <Gift size={18} />
                    Gửi mừng cưới
                </button>
                <button type="button">
                    Xác nhận tham dự lễ cưới
                </button>
            </section>

            <section className="pwi-rsvp" data-pwi-reveal>
                <PinkSectionTitle title="Gửi Lời Chúc" />
                <form onSubmit={handleWishSubmit}>
                    <input name="name" placeholder="Tên của bạn là?" maxLength={40} />
                    <input name="relationship" placeholder="Bạn là gì của Dâu Rể nhỉ?" maxLength={60} />
                    <textarea name="message" placeholder="Gửi lời chúc đến Dâu Rể nhé!" rows={4} maxLength={260} />
                    <button type="submit">
                        <Send size={18} />
                        Gửi ngay
                    </button>
                </form>
                {wishStatus && <p className="pwi-status">{wishStatus}</p>}
                <div className="pwi-wish-list">
                    {wishes.map((wish) => (
                        <article key={`${wish.name}-${wish.message}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            {isGiftOpen && (
                <div className="pwi-gift-modal" role="dialog" aria-modal="true" aria-label="Gửi mừng cưới">
                    <button className="pwi-gift-backdrop" type="button" aria-label="Đóng gửi mừng cưới" onClick={() => setIsGiftOpen(false)} />
                    <section className="pwi-gift-panel">
                        <button className="pwi-gift-close" type="button" aria-label="Đóng" onClick={() => setIsGiftOpen(false)}>
                            <X size={20} />
                        </button>
                        <div className="pwi-gift-title">
                            <span>Wedding Gift</span>
                            <h2>Gửi Mừng Cưới</h2>
                        </div>
                        <div className="pwi-gift-grid">
                            {giftAccounts.map((gift) => (
                                <article key={gift.account} className="pwi-gift-card">
                                    <div>
                                        <span>{gift.role}</span>
                                        <h3>{gift.name}</h3>
                                        <p>{gift.bank}</p>
                                        <strong>{gift.account}</strong>
                                    </div>
                                    <img src={gift.qr} alt={`Mã QR mừng cưới ${gift.role} ${gift.name}`} />
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default PinkWeddingInvitation;
