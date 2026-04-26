import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import './SiteHeader.css';

type AuthMode = 'login' | 'register';

function SiteHeader() {
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
    const isRegister = authMode === 'register';

    const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    return (
        <>
            <header className="site-header-shell">
                <nav className="home-navbar">
                    <Link to="/" className="home-brand">
                        <div className="home-brand-mark">H</div>
                        <div>
                            <strong>Harmony</strong>
                            <span>Thiệp Cưới</span>
                        </div>
                    </Link>

                    <ul className="home-nav-links">
                        <li><a href="/#home">Trang chủ</a></li>
                        <li><a href="/#pricing">Bảng giá</a></li>
                        <li><a href="/#cards">Mẫu thiệp</a></li>
                        <li><a href="/#contact">Liên hệ</a></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                    </ul>

                    <div className="home-auth-actions">
                        <button type="button" className="home-auth-login" onClick={() => setAuthMode('login')}>
                            Đăng nhập
                        </button>
                        <button type="button" className="home-auth-register" onClick={() => setAuthMode('register')}>
                            Đăng ký
                        </button>
                    </div>
                </nav>
            </header>

            {authMode && (
                <div className="home-auth-modal-backdrop" role="presentation" onClick={() => setAuthMode(null)}>
                    <section
                        className="home-auth-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="site-auth-title"
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
                            <h2 id="site-auth-title">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
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
        </>
    );
}

export default SiteHeader;
