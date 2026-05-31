import { FormEvent, useCallback, useEffect, useState } from 'react';
import { BadgeCheck, HeartHandshake, Sparkles, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthUserBadge from './AuthUserBadge';
import GoogleLoginButton from './GoogleLoginButton';
import { authService } from '../services/auth.service';
import { authTokenService } from '../services/auth-token.service';
import { ApiError } from '../services/http.service';
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
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
    const [openFaq, setOpenFaq] = useState(0);
    const [authMessage, setAuthMessage] = useState('');
    const [authMessageType, setAuthMessageType] = useState<'success' | 'error'>('success');
    const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => authTokenService.getUser());
    const isRegister = authMode === 'register';

    const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setAuthMessage('');

        const form = new FormData(formElement);
        const fullname = String(form.get('fullname') || '').trim();
        const email = String(form.get('email') || '').trim();
        const password = String(form.get('password') || '').trim();

        if ((isRegister && !fullname) || !email || !password) {
            setAuthMessageType('error');
            setAuthMessage(isRegister ? 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' : 'Vui lòng nhập email và mật khẩu.');
            return;
        }

        setIsAuthSubmitting(true);

        try {
            if (isRegister) {
                await authService.register({ fullname, email, password });
                setAuthMessageType('success');
                setAuthMessage('Đăng ký tài khoản thành công.');
                formElement.reset();
                setAuthMode('login');
                return;
            }

            const response = await authService.login({ email, password });
            const loggedInUser = response.data?.user ?? authTokenService.getUser();
            setAuthMessageType('success');
            setAuthMessage('Đăng nhập thành công.');
            formElement.reset();
            setCurrentUser(loggedInUser);
            setAuthMode(null);
            navigate(loggedInUser?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
        } catch (error) {
            setAuthMessageType('error');
            setAuthMessage(error instanceof ApiError ? error.message : isRegister ? 'Đăng ký thất bại. Vui lòng thử lại.' : 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsAuthSubmitting(false);
        }
    };
    const handleGoogleLoginStart = useCallback(() => {
        setIsAuthSubmitting(true);
        setAuthMessage('');
    }, []);

    const handleGoogleLoginSuccess = useCallback((loggedInUser: ReturnType<typeof authTokenService.getUser>) => {
        setAuthMessageType('success');
        setAuthMessage('Đăng nhập Google thành công.');
        setCurrentUser(loggedInUser);
        setAuthMode(null);
        navigate(loggedInUser?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    }, [navigate]);

    const handleGoogleLoginError = useCallback((message: string) => {
        setAuthMessageType('error');
        setAuthMessage(message);
    }, []);

    const handleGoogleLoginSettled = useCallback(() => {
        setIsAuthSubmitting(false);
    }, []);

    const handleLogout = () => {
        authTokenService.clearSession();
        setCurrentUser(null);
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
                    <img className="home-brand-mark" src="/img/logo.png" alt="" />
                    <div>
                        <strong>Gòi Xong Cưới</strong>
                    </div>
                </div>
                <ul className="home-nav-links">
                    <li><a href="#home">Trang chủ</a></li>
                    <li><a href="#pricing">Bảng giá</a></li>
                    <li><Link to="/chon-mau/co-ban">Mẫu thiệp</Link></li>
                    <li><a href="#contact">Liên hệ</a></li>
                </ul>
                {currentUser ? (
                    <AuthUserBadge user={currentUser} onLogout={handleLogout} />
                ) : (
                    <div className="home-auth-actions">
                        <button type="button" className="home-auth-login" onClick={() => setAuthMode('login')}>Đăng nhập</button>
                        <button type="button" className="home-auth-register" onClick={() => setAuthMode('register')}>Đăng ký</button>
                    </div>
                )}
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
                        <Link to="/chon-mau/co-ban" className="home-btn home-btn-ghost">Xem mẫu thiệp</Link>
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
                            <BadgeCheck size={42} strokeWidth={2.35} />
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
                        <Link to="/chon-mau/co-ban">Lựa mẫu</Link>
                    </article>
                    <article className="is-featured">
                        <div className="home-plan-badge">
                            <Sparkles size={16} strokeWidth={2.6} aria-hidden="true" />
                            Phổ biến nhất
                        </div>
                        <div className="home-plan-icon" aria-hidden="true">
                            <HeartHandshake size={42} strokeWidth={2.35} />
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
                        <Link to="/chon-mau/chuyen-nghiep">Lựa mẫu</Link>
                    </article>
                    <article>
                        <div className="home-plan-icon" aria-hidden="true">
                            <Trophy size={42} strokeWidth={2.35} />
                        </div>
                        <p>Gói Thời Thượng</p>
                        <span>Dịch vụ cao cấp nhất, tạo ra thiệp cưới độc đáo và ấn tượng nhất.</span>
                        <div className="home-card-price">
                            <strong>299.000 đ</strong>
                            <div>
                                <del>599.000 đ</del>
                                <em>-50%</em>
                            </div>
                        </div>
                        <Link to="/chon-mau/thoi-thuong">Lựa mẫu</Link>
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
                    <Link to="/chon-mau/co-ban" className="home-ready-secondary">Xem mẫu thiệp</Link>
                </div>
            </section>




            <footer className="home-footer" data-home-reveal>
                <div className="home-footer-main">
                    <div className="home-footer-brand">
                        <h2>Gòi Xong Cưới</h2>
                        <p>Lưu Giữ Khoảnh Khắc Thiêng Liêng</p>
                        <span>CÔNG TY TNHH Gòi Xong Cưới</span>
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
                        <h3>Gòi Xong Cưới</h3>
                        <a href="#home">Trang chủ</a>
                        <a href="#services">Điều khoản sử dụng</a>
                        <a href="#contact">Chính sách bảo mật</a>
                        <a href="#contact">Chăm sóc khách hàng</a>
                    </div>
                </div>
                <div className="home-footer-bottom">
                    Copyright © 2024 Gòi Xong Cưới. All rights reserved
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

                        <GoogleLoginButton
                            disabled={isAuthSubmitting}
                            onStart={handleGoogleLoginStart}
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            onSettled={handleGoogleLoginSettled}
                        />

                        <div className="home-auth-divider">
                            <span>hoặc</span>
                        </div>

                        <form className="home-auth-form" onSubmit={handleAuthSubmit}>
                            {isRegister && (
                                <label>
                                    Họ và tên
                                    <input name="fullname" placeholder="Nguyễn Văn A" autoComplete="name" required />
                                </label>
                            )}
                            <label>
                                Email
                                <input name="email" type="email" placeholder="hello@harmony.com" autoComplete="email" required />
                            </label>
                            <label>
                                Mật khẩu
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                    required
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

                            {authMessage && <p className={`home-auth-message is-${authMessageType}`}>{authMessage}</p>}

                            <button type="submit" className="home-auth-submit" disabled={isAuthSubmitting}>
                                {isAuthSubmitting ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
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




