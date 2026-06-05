import { FormEvent, useEffect, useState } from 'react';
import { Gift, MapPin, Music2, Pause, Send, X } from 'lucide-react';
import './QuiphaiInvitation.css';

const miuImages = {
    cover: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774083011748-1773752594568-1768964174030-615120422_925471073144357_5596178545909683221_n-cropped.webp',
    hero: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773752594568-1768964174030-615120422_925471073144357_5596178545909683221_n.webp',
    portraitOne: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773827069067-1768964171283-615345224_925470689811062_7585168431261975884_n.webp',
    portraitTwo: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1773840525498-1768964164483-615561845_925470776477720_6829025550080629353_n.webp',
    squareOne: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078485365-1768964172658-615230427_925470969811034_7650799844769027040_n.webp',
    squareTwo: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774078746116-1768964168632-615384719_925470186477779_6557986561779589458_n.webp',
    squareThree: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774079955594-1768964158904-615722702_925470336477764_5506631755238654106_n.webp',
    albumOne: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774080179841-1768964157102-615400830_925471493144315_1411328482513847053_n.webp',
    albumTwo: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774080805134-1768964165763-615390411_925471636477634_5492652073986767813_n.webp',
    albumThree: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774080805174-1768964160249-616232837_925471769810954_3687612262548518167_n.webp',
    albumFour: 'https://miuwedding.com/uploads/69b95065dcc4597893deb84b/1774081048372-1768964163122-615456040_925470323144432_2903202482121864786_n.webp',
    seal: 'https://miuwedding.com/assets/images/side-card-icon.png',
};

const albumImages = [
    miuImages.squareOne,
    miuImages.squareTwo,
    miuImages.squareThree,
    miuImages.albumOne,
    miuImages.albumTwo,
    miuImages.albumThree,
    miuImages.albumFour,
    miuImages.portraitOne,
];

const wishesSeed = [
    { name: 'Minh Anh', message: 'Chúc hai bạn một đời an yên, thương nhau bằng tất cả dịu dàng.' },
    { name: 'Gia đình cô Ba', message: 'Chúc mừng ngày vui của hai con. Trăm năm hạnh phúc!' },
];

function QuiphaiInvitation() {
    const [isOpeningVisible, setIsOpeningVisible] = useState(true);
    const [isOpeningOut, setIsOpeningOut] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);
    const [wishes, setWishes] = useState(wishesSeed);
    const [wishStatus, setWishStatus] = useState('');

    useEffect(() => {
        const items = document.querySelectorAll<HTMLElement>('[data-qp-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.16 },
        );

        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, []);

    const openInvitation = () => {
        setIsOpeningOut(true);
        window.setTimeout(() => setIsOpeningVisible(false), 1800);
    };

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
        <main className="qp-page">
            {isOpeningVisible && (
                <section className={`qp-opening${isOpeningOut ? ' is-open' : ''}`} aria-label="Mở thiệp cưới">
                    <div className="qp-opening-side qp-opening-left">
                        <div className="qp-opening-save">S<span>ave our date</span></div>
                        <div className="qp-opening-names">
                            <strong>Thanh Sơn</strong>
                            <em>&amp;</em>
                            <strong>Diệu Nhi</strong>
                        </div>
                        <p>Trân trọng kính mời</p>
                        <b>Quý khách</b>
                    </div>
                    <div className="qp-opening-side qp-opening-right" />
                    <button className="qp-opening-seal" type="button" onClick={openInvitation} aria-label="Mở thiệp">
                        <img src={miuImages.seal} alt="" />
                    </button>
                    <button className="qp-opening-cta" type="button" onClick={openInvitation}>
                        Mở thiệp
                    </button>
                </section>
            )}

            <button
                className={`qp-audio${isMusicPlaying ? ' is-playing' : ''}`}
                type="button"
                onClick={() => setIsMusicPlaying((current) => !current)}
                aria-label={isMusicPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
            >
                {isMusicPlaying ? <Pause size={18} /> : <Music2 size={18} />}
            </button>

            <section className="qp-hero">
                <img src={miuImages.cover} alt="Thanh Sơn và Diệu Nhi" />
                <div className="qp-hero-copy">
                    <span>Wedding by</span>
                    <h1>
                        Thanh Sơn
                        <b>Diệu Nhi</b>
                    </h1>
                    <p>31.12.2026</p>
                </div>
            </section>

            <section className="qp-formal-invite" data-qp-reveal>
                <img className="qp-formal-flower" src="/img/flower.png" alt="" aria-hidden="true" />
                <div className="qp-formal-family">
                    <article>
                        <h2>Nhà trai</h2>
                        <p>Ông: Nguyễn Gia Bảo</p>
                        <p>Bà: Hoàng Thị Cúc</p>
                    </article>
                    <span aria-hidden="true" />
                    <article>
                        <h2>Nhà gái</h2>
                        <p>Ông: Đào Duy Linh</p>
                        <p>Bà: Tô Thị Như</p>
                    </article>
                </div>
                <p className="qp-formal-intro">Thân mời đến tham dự Tiệc cưới cùng gia đình chúng tôi!</p>
                <h2 className="qp-formal-names">
                    <img className="qp-name-flower is-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                    <img className="qp-name-flower is-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                    <img className="qp-name-flower is-small" src="/img/flower3.png" alt="" aria-hidden="true" />
                    <span>Thanh Sơn</span>
                    <em>and</em>
                    <span>Diệu Nhi</span>
                </h2>
                <p className="qp-formal-ceremony">Hôn lễ được tổ chức</p>
                <div className="qp-formal-date">
                    <span>08:00</span>
                    <strong>
                        <span>Thứ Năm</span>
                        <em>31</em>
                        <span>Tháng 12</span>
                    </strong>
                    <span>2026</span>
                </div>
                <em className="qp-formal-lunar">(Tức ngày 23 tháng 11 năm Bính Ngọ)</em>
                <p className="qp-formal-place-label">Tại địa điểm</p>
                <h3>Tư gia nhà trai</h3>
                <address>43A ngõ 26 Phạm Ngọc Thạch, Đống Đa, TP. Hà Nội</address>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer">
                    <MapPin size={22} />
                    Chỉ đường
                </a>
            </section>


            <section className="qp-couple-profile" data-qp-reveal>
                <img className="qp-couple-flower qp-couple-flower-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-small is-top" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-couple-flower qp-couple-flower-small is-mid" src="/img/flower3.png" alt="" aria-hidden="true" />

                <article className="qp-profile-card qp-profile-groom">
                    <div className="qp-profile-copy">
                        <em>Chú rể</em>
                        <h2>Thanh Sơn</h2>
                    </div>
                    <figure>
                        <img src={miuImages.portraitOne} alt="Chú rể Thanh Sơn" loading="lazy" />
                    </figure>
                </article>

                <img className="qp-profile-seal" src={miuImages.seal} alt="" aria-hidden="true" />

                <article className="qp-profile-card qp-profile-bride">
                    <figure>
                        <img src={miuImages.portraitTwo} alt="Cô dâu Diệu Nhi" loading="lazy" />
                    </figure>
                    <div className="qp-profile-copy">
                        <em>Cô dâu</em>
                        <h2>Diệu Nhi</h2>
                    </div>
                </article>
            </section>



            <section className="qp-album" data-qp-reveal>
                <img className="qp-album-flower is-left" src="/img/flower3.png" alt="" aria-hidden="true" />
                <img className="qp-album-flower is-right" src="/img/flower2.png" alt="" aria-hidden="true" />
                <img className="qp-album-petals" src="/img/flower3.png" alt="" aria-hidden="true" />
                <h2>
                    <span className="qp-album-word is-album">Album</span>
                    <span className="qp-album-word is-of">of</span>
                    <span className="qp-album-word is-love">Love</span>
                </h2>
                <div className="qp-album-grid">
                    {albumImages.map((image, index) => (
                        <figure key={image} className={index === 0 || index === 5 ? 'is-large' : ''}>
                            <img src={image} alt={`Album cưới ${index + 1}`} loading="lazy" />
                        </figure>
                    ))}
                </div>
            </section>


            <section className="qp-rsvp" data-qp-reveal>
                <h2>Xác Nhận Tham Dự</h2>
                <p>Việc xác nhận giúp chúng mình chuẩn bị chu đáo hơn. Cảm ơn bạn!</p>
                <form>
                    <input placeholder="Họ và tên" />
                    <div className="qp-radio-row">
                        <label><input type="radio" name="attend" defaultChecked /> Có, tôi sẽ tham dự</label>
                        <label><input type="radio" name="attend" /> Xin lỗi, tôi bận mất rồi!</label>
                    </div>
                    <button type="button">Xác nhận</button>
                </form>
            </section>

            <section className="qp-wishes" data-qp-reveal>
                <h2>Sổ lưu bút</h2>
                <p>Cảm ơn bạn rất nhiều vì đã gửi những lời chúc mừng tốt đẹp nhất đến đám cưới của chúng tôi!</p>
                <form onSubmit={handleWishSubmit}>
                    <input name="name" placeholder="Tên của bạn" maxLength={40} />
                    <textarea name="message" placeholder="Gửi lời chúc" rows={4} maxLength={260} />
                    <button type="submit">
                        <Send size={17} />
                        Gửi lời chúc
                    </button>
                </form>
                {wishStatus && <b className="qp-status">{wishStatus}</b>}
                <div className="qp-wish-list">
                    {wishes.map((wish) => (
                        <article key={`${wish.name}-${wish.message}`}>
                            <strong>{wish.name}</strong>
                            <p>{wish.message}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="qp-gift" data-qp-reveal>
                <button type="button" onClick={() => setIsGiftOpen(true)}>
                    <Gift size={18} />
                    Quà mừng cưới
                </button>
            </section>

            {isGiftOpen && (
                <div className="qp-gift-modal" role="dialog" aria-modal="true" aria-label="Quà mừng cưới">
                    <button className="qp-gift-backdrop" type="button" onClick={() => setIsGiftOpen(false)} aria-label="Đóng" />
                    <section className="qp-gift-panel">
                        <button className="qp-close" type="button" onClick={() => setIsGiftOpen(false)} aria-label="Đóng">
                            <X size={20} />
                        </button>
                        <h2>Quà mừng cưới</h2>
                        <article>
                            <span>Chú rể</span>
                            <strong>TÊN TÀI KHOẢN</strong>
                            <p>MB Bank</p>
                            <b>xxxx xxxx xxxx</b>
                        </article>
                        <article>
                            <span>Cô dâu</span>
                            <strong>TÊN TÀI KHOẢN</strong>
                            <p>MB Bank</p>
                            <b>xxxx xxxx xxxx</b>
                        </article>
                    </section>
                </div>
            )}

        </main>
    );
}

export default QuiphaiInvitation;
