import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

type AuthMode = 'login' | 'register';

function MaterialStatusIcon({ included }: { included: boolean }) {
    return (
        <span className={`home-material-status ${included ? 'is-check' : 'is-cancel'}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {included ? (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                ) : (
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                )}
            </svg>
            <span className="home-sr-only">{included ? 'Có' : 'Không'}</span>
        </span>
    );
}

function HomePage() {
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
    const [openFaq, setOpenFaq] = useState(0);
    const isRegister = authMode === 'register';

    const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    useEffect(() => {
        const elements = document.querySelectorAll<HTMLElement>('[data-home-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.14 },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="home-app">
            <nav className="home-navbar">
                <div className="home-brand">
                    <div className="home-brand-mark">H</div>
                    <div>
                        <strong>Harmony</strong>
                        <span>Thiệp Cưới</span>
                    </div>
                </div>
                <ul className="home-nav-links">
                    <li><a href="#home">Trang chủ</a></li>
                    <li><a href="#pricing">Bảng giá</a></li>
                    <li><a href="#cards">Mẫu thiệp</a></li>
                    <li><a href="#contact">Liên hệ</a></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                </ul>
                <div className="home-auth-actions">
                    <button type="button" className="home-auth-login" onClick={() => setAuthMode('login')}>Đăng nhập</button>
                    <button type="button" className="home-auth-register" onClick={() => setAuthMode('register')}>Đăng ký</button>
                </div>
            </nav>

            <main className="home-hero" id="home">
                <div className="home-hero-copy">
                    <span className="home-eyebrow">Thiệp cưới online</span>
                    <h1>Thiệp cưới online<br />Nhà có Hỷ</h1>
                    <span className="home-art-script">Nơi lời mời trở thành một kỷ niệm dịu dàng</span>
                    <p>
                        Một tấm thiệp không chỉ là lời mời, mà là cách kể lại câu chuyện tình yêu của bạn.
                    </p>
                    <div className="home-hero-actions">
                        <a href="#contact" className="home-btn home-btn-primary">Liên hệ ngay</a>
                        <Link to="/thiep-moi" className="home-btn home-btn-ghost">Xem mẫu thiệp</Link>
                    </div>
                </div>

                <div className="home-hero-visual">
                    <div className="home-hero-mockups" aria-label="Mockup thiệp cưới online">
                        <img
                            src="/img/mockup-thiep-cuoi-online-2.webp"
                            alt="Mockup thiệp cưới online Harmony"
                            width="400"
                            height="500"
                            className="home-mockup-card home-mockup-card-left"
                        />
                        <img
                            src="/img/mockup-thiep-cuoi-online-1.webp"
                            alt="Mockup thiệp cưới online trên điện thoại"
                            width="400"
                            height="500"
                            loading="lazy"
                            className="home-mockup-card home-mockup-card-right"
                        />
                        {/*
                        <img
                            src="/img/img.png"
                            alt="Mockup thiệp cưới online Harmony"
                            width="400"
                            height="500"
                            className="home-mockup-card home-mockup-card-left"
                        />
                        <img
                            src="/img/img.png"
                            alt="Mockup thiệp cưới online trên điện thoại"
                            width="400"
                            height="500"
                            loading="lazy"
                            className="home-mockup-card home-mockup-card-right"
                        />
                        */}
                    </div>
                </div>
            </main>

            <section className="home-features" id="services" data-home-reveal>
                <div className="home-feature-heading">
                    <p>Vì sao chọn chúng tôi?</p>
                    <h2>Ba lý do để thiệp cưới online trở nên nhẹ nhàng hơn</h2>
                </div>
                <div className="home-feature-grid">
                    <article>
                        <h2>Thiệp đẹp, đúng gu</h2>
                        <p>Mỗi mẫu thiệp được chăm chút về bố cục, màu sắc và cảm xúc để hợp với câu chuyện riêng của hai bạn.</p>
                    </article>
                    <article>
                        <h2>Làm nhanh, gửi gọn</h2>
                        <p>Chỉ cần gửi thông tin cưới, chúng tôi hoàn thiện thiệp online chỉn chu để bạn dễ dàng chia sẻ cho khách mời.</p>
                    </article>
                    <article>
                        <h2>Đủ tính năng cần thiết</h2>
                        <p>Từ Google Map, lời chúc, nhạc nền, QR mừng cưới đến xác nhận tham dự đều được sắp xếp rõ ràng.</p>
                    </article>
                </div>
            </section>

            <section className="home-pricing" id="pricing" data-home-reveal>
                <div className="home-pricing-heading">
                    <p>Bảng giá thiệp cưới online</p>
                    <h2>Chọn gói phù hợp cho ngày vui của bạn</h2>
                    <em className="home-art-script">Chỉn chu từng chi tiết, trọn vẹn từng lời mời</em>
                    <span>Gói cao hơn đã bao gồm toàn bộ tính năng của các gói thấp hơn.</span>
                </div>

                <div className="home-pricing-table" aria-label="Bảng so sánh các gói giá">
                    <div className="home-pricing-row home-pricing-head">
                        <div>Tính năng</div>
                        <div>
                            <span>Cơ bản</span>
                            <div className="home-price-stack">
                                <del>199k</del>
                                <strong>99k</strong>
                            </div>
                        </div>
                        <div className="is-popular-plan">
                            <em>Phổ biến nhất</em>
                            <span>Nổi bật</span>
                            <div className="home-price-stack">
                                <del>299k</del>
                                <strong>199k</strong>
                            </div>
                        </div>
                        <div>
                            <span>Cao cấp</span>
                            <div className="home-price-stack">
                                <del>399k</del>
                                <strong>299k</strong>
                            </div>
                        </div>
                    </div>

                    {[
                        ['Thông tin cô dâu & chú rể', true, true, true],
                        ['Lịch cưới, thời gian & địa điểm', true, true, true],
                        ['Bản đồ Google Map', true, true, true],
                        ['Gửi lời chúc', true, true, true],
                        ['Nhạc nền', false, true, true],
                        ['QR mừng cưới', false, true, true],
                        ['Xác nhận tham dự qua email', false, true, true],
                        ['Tùy chỉnh màu sắc thiệp', false, false, true],
                        ['Hiệu ứng rơi theo chủ đề', false, false, true],
                        ['Thống kê lượt xem thiệp', false, false, true],
                        ['Hỗ trợ sedding lời chúc', false, false, true],
                    ].map(([feature, basic, standard, premium]) => (
                        <div className="home-pricing-row" key={String(feature)}>
                            <div>{feature}</div>
                            <div className={basic ? 'is-included' : 'is-empty'}>
                                <MaterialStatusIcon included={Boolean(basic)} />
                            </div>
                            <div className={standard ? 'is-included' : 'is-empty'}>
                                <MaterialStatusIcon included={Boolean(standard)} />
                            </div>
                            <div className={premium ? 'is-included' : 'is-empty'}>
                                <MaterialStatusIcon included={Boolean(premium)} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="home-pricing-cards">
                    <article>
                        <div className="home-plan-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2.5c3.1.7 5.4 3.5 5.4 6.8 0 1.8-.7 3.5-1.8 4.7l1.3 4.8-4.2-2.3c-.2 0-.5.1-.7.1s-.5 0-.7-.1l-4.2 2.3L8.4 14c-1.1-1.2-1.8-2.9-1.8-4.7 0-3.3 2.3-6.1 5.4-6.8zm0 2.4c-1.8.5-3.1 2.2-3.1 4.4 0 2.5 1.8 4.6 3.1 4.6s3.1-2.1 3.1-4.6c0-2.2-1.3-3.9-3.1-4.4z" />
                            </svg>
                        </div>
                        <p>Gói Cơ Bản</p>
                        <span>Phù hợp cho cặp đôi mới bắt đầu, muốn có thiệp cưới đẹp với chi phí hợp lý.</span>
                        <div className="home-card-price">
                            <strong>99.000 đ</strong>
                            <div>
                                <del>199.000 đ</del>
                                <em>-50%</em>
                            </div>
                        </div>
                        <Link to="/chon-mau/99k">Lựa mẫu</Link>
                    </article>
                    <article className="is-featured">
                        <div className="home-plan-badge">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m12 17.3 6.2 3.7-1.6-7 5.4-4.7-7.1-.6L12 2 9.1 8.7 2 9.3 7.4 14l-1.6 7 6.2-3.7z" />
                            </svg>
                            Phổ biến nhất
                        </div>
                        <div className="home-plan-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M6.2 3h11.6L22 9l-10 12L2 9l4.2-6zm1.1 2-2 3h4.4l1-3H7.3zm5.9 0-1 3h6.1l-2.1-3h-3zm4.9 5h-5l-1.1 6.6L18.1 10zm-7.2 0h-5L12 16.6 10.9 10z" />
                            </svg>
                        </div>
                        <p>Gói Chuyên Nghiệp</p>
                        <span>Lựa chọn hoàn hảo cho cặp đôi muốn thiệp cưới độc đáo và chuyên nghiệp.</span>
                        <div className="home-card-price">
                            <strong>199.000 đ</strong>
                            <div>
                                <del>299.000 đ</del>
                                <em>-50%</em>
                            </div>
                        </div>
                        <Link to="/chon-mau/199k">Lựa mẫu</Link>
                    </article>
                    <article>
                        <div className="home-plan-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="m5 16-3-9 6 4 4-7 4 7 6-4-3 9H5zm14 3H5v2h14v-2z" />
                            </svg>
                        </div>
                        <p>Gói VIP</p>
                        <span>Dịch vụ cao cấp nhất, tạo ra thiệp cưới độc đáo và ấn tượng nhất.</span>
                        <div className="home-card-price">
                            <strong>299.000 đ</strong>
                            <div>
                                <del>599.000 đ</del>
                                <em>-50%</em>
                            </div>
                        </div>
                        <Link to="/chon-mau/299k">Lựa mẫu</Link>
                    </article>
                </div>

                <div className="home-price-faq">
                    <h2>Câu hỏi thường gặp</h2>
                    {[
                        [
                            'Có phí ẩn nào không?',
                            'Không. Tất cả giá đã bao gồm phí thiết kế và dịch vụ. Bạn chỉ thanh toán đúng số tiền hiển thị trên bảng giá.',
                        ],
                        [
                            'Có thể nâng cấp gói sau không?',
                            'Có. Bạn có thể nâng cấp gói bất kỳ lúc nào và chỉ cần thanh toán phần chênh lệch giữa hai gói.',
                        ],
                        [
                            'Bao lâu thì nhận được thiệp?',
                            'Thông thường thiệp sẽ được hoàn thiện trong ngày sau khi bạn gửi đủ thông tin, hình ảnh và nội dung cần hiển thị.',
                        ],
                        [
                            'Tôi có được chỉnh sửa nội dung sau khi nhận thiệp không?',
                            'Có. Bạn có thể yêu cầu chỉnh sửa các thông tin như tên, ngày giờ, địa điểm, ảnh và nội dung lời mời trước khi gửi khách.',
                        ],
                        [
                            'Thiệp có xem được trên điện thoại không?',
                            'Có. Thiệp được tối ưu để xem mượt trên điện thoại, máy tính bảng và máy tính, phù hợp khi chia sẻ qua Zalo, Facebook hoặc tin nhắn.',
                        ],
                    ].map(([question, answer], index) => {
                        const isOpen = openFaq === index;

                        return (
                            <article className={isOpen ? 'is-open' : ''} key={question}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                >
                                    <span>{question}</span>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                                    </svg>
                                </button>
                                <div className="home-faq-answer">
                                    <p>{answer}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>


            <section className="home-cards" id="cards" data-home-reveal>
                <div>
                    <p>Mẫu thiệp đám cưới</p>
                    <h2>Decor tinh tế cho ngày trăm năm</h2>
                    <em className="home-art-script">Một phong cách riêng cho câu chuyện riêng</em>
                    <span>Những mẫu thiệp được thiết kế để hòa hợp với không gian cưới ấm áp và lãng mạn.</span>
                </div>

            </section>
            <section className="home-ready-cta" data-home-reveal>
                <h2>Sẵn sàng tạo thiệp cưới hoàn hảo?</h2>
                <p>Liên hệ ngay để được tư vấn miễn phí và chọn gói dịch vụ phù hợp nhất.</p>
                <div>
                    <a href="#contact" className="home-ready-primary">Liên hệ tư vấn</a>
                    <Link to="/thiep-moi" className="home-ready-secondary">Xem mẫu thiệp</Link>
                </div>
            </section>




            <footer className="home-footer" data-home-reveal>
                <div className="home-footer-main">
                    <div className="home-footer-brand">
                        <h2>WeddingDays</h2>
                        <p>Lưu Giữ Khoảnh Khắc Thiêng Liêng</p>
                        <span>CÔNG TY TNHH WeddingDays</span>
                        <span>Mã số thuế: Đang cập nhật</span>
                    </div>

                    <div className="home-footer-contact">
                        <h3>Liên hệ</h3>
                        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Vui lòng liên hệ với chúng tôi qua các kênh dưới đây để được tư vấn.</p>
                        <div className="home-footer-socials">
                            <a href="https://zalo.me/" target="_blank" rel="noreferrer" aria-label="Liên hệ Zalo">
                                <img src="/img/zalo-logo.svg" alt="" />
                            </a>
                            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="Liên hệ TikTok">
                                <img src="/img/tiktok-logo.svg" alt="" />
                            </a>
                            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Liên hệ Facebook">
                                <img src="/img/facebook-logo.svg" alt="" />
                            </a>
                        </div>
                    </div>

                    <div className="home-footer-links">
                        <h3>WeddingDays</h3>
                        <a href="#home">Trang chủ</a>
                        <a href="#services">Điều khoản sử dụng</a>
                        <a href="#contact">Chính sách bảo mật</a>
                        <a href="#contact">Chăm sóc khách hàng</a>
                    </div>
                </div>
                <div className="home-footer-bottom">
                    Copyright © 2024 WeddingDays. All rights reserved
                </div>
            </footer>

            <aside className="home-floating-contact" aria-label="Liên hệ nhanh">
                <a href="https://zalo.me/" target="_blank" rel="noreferrer" aria-label="Liên hệ Zalo">
                    <img src="https://th.bing.com/th/id/R.21eabc8fa667f86843a9bfa549da2e30?rik=6Np0hdLw5lOW9g&riu=http%3a%2f%2fwww.dlghoteldanang.com%2fimages%2fci%2f349-03.png&ehk=UTdXtfbYkEESRzbdlgqt6D0C%2ftG0IFTKiEmeT5pIgBU%3d&risl=&pid=ImgRaw&r=0" alt="" />
                </a>
                <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok">
                    <img src="https://static.vecteezy.com/system/resources/previews/006/057/996/original/tiktok-logo-on-transparent-background-free-vector.jpg" alt="" />
                </a>
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <img src="https://tse2.mm.bing.net/th/id/OIP._-N0rPk3XBfnfR9ZvP892wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="" />
                </a>
            </aside>

            {authMode && (
                <div className="home-auth-modal-backdrop" role="presentation" onClick={() => setAuthMode(null)}>
                    <section
                        className="home-auth-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="home-auth-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="home-auth-modal-close"
                            aria-label="Đóng popup"
                            onClick={() => setAuthMode(null)}
                        >
                            &times;
                        </button>

                        <div className="home-auth-modal-heading">
                            <span>Harmony Account</span>
                            <h2 id="home-auth-title">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
                            <p>
                                {isRegister
                                    ? 'Tạo tài khoản để lưu mẫu thiệp và quản lý lời mời của bạn.'
                                    : 'Đăng nhập để tiếp tục chỉnh sửa và quản lý thiệp cưới.'}
                            </p>
                        </div>

                        <div className="home-auth-tabs">
                            <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                                Đăng nhập
                            </button>
                            <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                                Đăng ký
                            </button>
                        </div>

                        <button type="button" className="home-google-auth" onClick={handleGoogleLogin}>
                            <img src="/img/google-logo.svg" alt="" className="home-google-logo" aria-hidden="true" />
                            Tiếp tục với Google
                        </button>

                        <div className="home-auth-divider">
                            <span>hoặc</span>
                        </div>

                        <form className="home-auth-form" onSubmit={handleAuthSubmit}>
                            {isRegister && (
                                <label>
                                    Họ và tên
                                    <input name="name" placeholder="Nguyễn Văn A" autoComplete="name" />
                                </label>
                            )}
                            <label>
                                Email
                                <input name="email" type="email" placeholder="hello@harmony.com" autoComplete="email" />
                            </label>
                            <label>
                                Mật khẩu
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                />
                            </label>

                            {!isRegister && (
                                <div className="home-auth-form-row">
                                    <label className="home-auth-remember">
                                        <input type="checkbox" name="remember" />
                                        Ghi nhớ đăng nhập
                                    </label>
                                    <button type="button">Quên mật khẩu?</button>
                                </div>
                            )}

                            <button type="submit" className="home-auth-submit">
                                {isRegister ? 'Đăng ký' : 'Đăng nhập'}
                            </button>
                        </form>

                        <p className="home-auth-switch-text">
                            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                            <button type="button" onClick={() => setAuthMode(isRegister ? 'login' : 'register')}>
                                {isRegister ? 'Đăng nhập' : 'Đăng ký'}
                            </button>
                        </p>
                    </section>
                </div>
            )}
        </div>
    );
}

export default HomePage;
