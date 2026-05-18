import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import './CineLoveTraditionalInvitation.css';
import { defaultInvitationTemplate } from '../data/invitationTemplates';

const assetBase = 'https://img.cinelove.me/templates/assets/7e64b0eb-9b5b-497f-b09e-3d3024571dfa';
const thiepMoiImages = defaultInvitationTemplate.images;
const thiepMoiGallery = [
    ...(thiepMoiImages.gallery ?? []),
    thiepMoiImages.cover,
    thiepMoiImages.kiss,
    thiepMoiImages.walk,
    thiepMoiImages.smile,
    thiepMoiImages.studio,
    thiepMoiImages.thank,
].filter(Boolean);
const memoryGalleryImages = (thiepMoiImages.gallery?.filter(Boolean).length ? thiepMoiImages.gallery : thiepMoiGallery).filter(Boolean);

const images = {
    hero: 'https://sadesign.vn/wp-content/uploads/2023/02/Anh-album-mau-AM074_9.jpg',
    groom: `${assetBase}/c22c2c02-e235-4b12-b586-30ff0aa282e9.jpeg`,
    bride: thiepMoiImages.cover,
    inviteLeft: thiepMoiGallery[1] ?? thiepMoiImages.kiss,
    inviteCenter: thiepMoiGallery[2] ?? thiepMoiImages.walk,
    inviteRight: thiepMoiGallery[3] ?? thiepMoiImages.smile,
};

const groomName = 'Nguyễn Thanh Huy';
const brideName = 'Trịnh Phương Thúy';

const initialWishes = [
    { name: 'Nguyễn Minh Tân', message: 'Tuyệt vời, chúc hai bạn một đời an yên.' },
    { name: 'Sơn Tùng', message: 'Chúc vợ chồng trăm năm hạnh phúc.' },
    { name: 'Người em đáng ghét', message: 'Ngày cưới thật đẹp, cười thật nhiều nha.' },
];

const giftRecipients = [
    {
        title: 'Mừng cưới đến chú rể',
        bank: 'Vietcombank',
        accountName: 'Phạm Hà Đô',
        accountNumber: '9383216200',
        qr: 'https://img.vietqr.io/image/VCB-9383216200-compact2.png?amount=0&addInfo=Mung%20cuoi%20chu%20re&accountName=Pham%20Ha%20Do',
    },
    {
        title: 'Mừng cưới đến cô dâu',
        bank: 'MBBank',
        accountName: 'Nguyễn Thị Giang Thanh',
        accountNumber: '1001652007',
        qr: 'https://img.vietqr.io/image/MB-1001652007-compact2.png?amount=0&addInfo=Mung%20cuoi%20co%20dau&accountName=Nguyen%20Thi%20Giang%20Thanh',
    },
];

type WeddingWish = (typeof initialWishes)[number];

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

function CineLoveTraditionalInvitation() {
    const [submitted, setSubmitted] = useState(false);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const [galleryDirection, setGalleryDirection] = useState<'next' | 'prev'>('next');
    const [wishes, setWishes] = useState<WeddingWish[]>(initialWishes);
    const [wishStatus, setWishStatus] = useState('');

    const calendarDays = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1), []);
    const galleryPreview = useMemo(() => memoryGalleryImages.slice(0, 4), []);
    const hiddenGalleryCount = Math.max(memoryGalleryImages.length - galleryPreview.length, 0);

    useEffect(() => {
        const revealItems = document.querySelectorAll<HTMLElement>(
            '.clv-page > section:not(.clv-hero), .clv-family-grid article, .clv-memory-card, .clv-wish-list article, .clv-gift-cards article',
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setIsRsvpOpen(false);
    };

    const handleWishSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const nextWish = {
            name: String(form.get('wishName') || '').trim(),
            message: String(form.get('wishMessage') || '').trim(),
        };

        if (!nextWish.name || !nextWish.message) {
            setWishStatus('Bạn nhập tên và lời chúc trước khi gửi nha.');
            return;
        }

        setWishes((current) => [nextWish, ...current]);
        setWishStatus('Cảm ơn bạn, lời chúc đã được gửi đến cô dâu chú rể.');
        event.currentTarget.reset();
    };

    const openGalleryAt = (index: number) => {
        setGalleryDirection(index >= activeGalleryIndex ? 'next' : 'prev');
        setActiveGalleryIndex(index);
        setIsGalleryOpen(true);
    };

    const showPreviousGalleryImage = () => {
        setGalleryDirection('prev');
        setActiveGalleryIndex((current) => (current - 1 + memoryGalleryImages.length) % memoryGalleryImages.length);
    };

    const showNextGalleryImage = () => {
        setGalleryDirection('next');
        setActiveGalleryIndex((current) => (current + 1) % memoryGalleryImages.length);
    };

    return (
        <main className="clv-page">
            <section className="clv-hero">
                <div className="clv-hero__top">
                    <p className="clv-save">Save The Date</p>
                    <p className="clv-date-small">16 .11 .2025</p>
                </div>

                <h1>Thanh Huy - Phương Thúy</h1>
                <img className="clv-hero__couple" src='https://i.pinimg.com/736x/0a/0b/a6/0a0ba6a2118e4fd2f686ff876efb80b8.jpg' alt="Thanh Huy và Phương Thúy" />
            </section>

            <section className="clv-intro clv-cream-panel">
                <div className="clv-arch-title">
                    <h2>Wedding Invitation</h2>
                </div>

                <div className="clv-family-grid">
                    <article>
                        <h3>Nhà trai</h3>
                        <p>Ông Nguyễn Viết Minh</p>
                        <p>Bà Trịnh Thị Lan</p>
                        <div className="clv-portrait">
                            <img src='https://tse2.mm.bing.net/th/id/OIP.c189c5Yzun-CiAX_cxmYagHaJm?w=600&h=778&rs=1&pid=ImgDetMain&o=7&rm=3' alt="Chú rể Nguyễn Thanh Huy" />
                        </div>
                        <SplitScriptName name={groomName} />
                    </article>

                    <span className="clv-amp">&amp;</span>

                    <article>
                        <h3>Nhà gái</h3>
                        <p>Ông Trịnh Văn Huy</p>
                        <p>Bà Ngô Mai Hoàn</p>
                        <div className="clv-portrait">
                            <img src='https://afamilycdn.com/150157425591193600/2021/11/25/photo-1-16378362373871156703010-1637841966879-1637841967004902439285.jpg' alt="Cô dâu Trịnh Phương Thúy" />
                        </div>
                        <SplitScriptName name={brideName} />
                    </article>
                </div>

                <div className="clv-countdown" aria-label="Đếm ngược ngày cưới">
                    {['NGÀY', 'GIỜ', 'PHÚT', 'GIÂY'].map((label) => (
                        <div key={label}>
                            <strong>00</strong>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="clv-invite clv-bordered-panel">
                <p className="clv-event-title">Trân Trọng Kính Mời</p>
                <p className="clv-at">Anh Dũng</p>

                <div className="clv-time-row">
                    <span>12:00</span>
                    <strong>
                        <span className="clv-time-row__label">Chủ Nhật</span>
                        <em>16</em>
                        <span className="clv-time-row__label">Tháng 11</span>
                    </strong>
                    <span>2025</span>
                </div>

                <div className="clv-calendar">
                    <div className="clv-calendar__head">11.2025</div>
                    <div className="clv-calendar__body">
                        <span className="clv-year-watermark">2025</span>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                            <strong key={day}>{day}</strong>
                        ))}
                        {Array.from({ length: 5 }, (_, index) => (
                            <span key={`empty-${index}`} />
                        ))}
                        {calendarDays.map((day) => (
                            <span className={day === 16 ? 'clv-calendar__active' : ''} key={day}>
                                {day}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="clv-location clv-bordered-panel">
                <h2>Địa Điểm Tổ Chức</h2>
                <p>
                    Nhà hàng Dinamond Palace,
                    <br />
                    Hai Bà Trưng, Hà Nội
                </p>
                <iframe
                    title="Bản đồ địa điểm tổ chức tiệc cưới"
                    src="https://maps.google.com/maps?q=Tr%E1%BB%91ng%20%C4%90%E1%BB%93ng%20Palace%20C%E1%BA%A3nh%20H%E1%BB%93%2C%20173B%20%C4%90.%20Tr%C6%B0%E1%BB%9Dng%20Chinh%2C%20H%C3%A0%20N%E1%BB%99i&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
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
                                key={`${image}-${index}`}
                                className={`clv-memory-card${isOverlayCard ? ' is-overlay' : ''}`}
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

                <button className="clv-memories__open" type="button" onClick={() => openGalleryAt(0)}>
                    Xem toàn bộ {memoryGalleryImages.length} ảnh
                </button>
            </section>

            <section className="clv-wishes">
                <div className="clv-wishes__title">
                    <h2>Gửi Lời Chúc</h2>
                    <p>Mỗi lời chúc, mỗi sự hiện diện đều là điều đáng quý mà chúng tôi luôn trân trọng.</p>
                </div>

                <form className="clv-wish-form" onSubmit={handleWishSubmit}>
                    <input name="wishName" type="text" placeholder="Tên của bạn" />
                    <textarea name="wishMessage" placeholder="Lời chúc" rows={5} />
                    <button type="submit">Gửi</button>
                </form>

                {wishStatus && <p className="clv-wish-status">{wishStatus}</p>}

                <div className="clv-wish-list" aria-label="Danh sách lời chúc">
                    {wishes.map((wish) => (
                        <article key={`${wish.name}-${wish.message}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="clv-gift">
                <div className="clv-gift__copy">
                    <h2>Hộp Quà Cưới</h2>
                    <p>Nếu muốn gửi một món quà nhỏ thay lời chúc, tụi mình xin nhận bằng tất cả sự trân quý.</p>
                </div>
                <button className="clv-gift__button" type="button" onClick={() => setIsGiftOpen(true)}>
                    Hộp Quà Cưới
                </button>
            </section>

            <section className="clv-rsvp clv-bordered-panel">
                <h2>Xác Nhận Tham Dự</h2>
                <p className="clv-rsvp-copy">Hồi âm của bạn là một niềm vui thật đẹp trong ngày chung đôi.</p>
                <button className="clv-rsvp-open" type="button" onClick={() => setIsRsvpOpen(true)}>
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
                                <article key={recipient.accountNumber}>
                                    <h3>{recipient.title}</h3>
                                    <div className="clv-gift-qr">
                                        <img src={recipient.qr} alt={`QR chuyển khoản ${recipient.title}`} />
                                    </div>
                                    <p>
                                        Ngân hàng: <strong>{recipient.bank}</strong>
                                    </p>
                                    <p>
                                        Tên tài khoản: <strong>{recipient.accountName}</strong>
                                    </p>
                                    <p>
                                        Số tài khoản: <strong>{recipient.accountNumber}</strong>
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isGalleryOpen && (
                <div className="clv-gallery-modal" role="dialog" aria-modal="true" aria-label="Album ảnh cưới">
                    <button className="clv-gallery-backdrop" type="button" aria-label="Đóng album ảnh" onClick={() => setIsGalleryOpen(false)} />
                    <div className="clv-gallery-panel">
                        <div className="clv-gallery-panel__head">
                            <div>
                                <p>Album ảnh cưới</p>
                                <strong>
                                    {activeGalleryIndex + 1}/{memoryGalleryImages.length}
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
                                    src={memoryGalleryImages[activeGalleryIndex]}
                                    alt={`Album cưới ${activeGalleryIndex + 1}`}
                                />
                            </figure>
                            <button className="clv-gallery-nav is-next" type="button" onClick={showNextGalleryImage} aria-label="Ảnh sau" />
                        </div>

                        <div className="clv-gallery-strip" aria-label="Danh sách ảnh thu nhỏ">
                            {memoryGalleryImages.map((image, index) => (
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
                </div>
            )}

            <section className="clv-ending">
                <p>Thank You!</p>
            </section>
        </main>
    );
}

export default CineLoveTraditionalInvitation;
