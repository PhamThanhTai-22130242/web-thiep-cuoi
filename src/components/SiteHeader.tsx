import { FormEvent, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthUserBadge from './AuthUserBadge';
import GoogleLoginButton from './GoogleLoginButton';
import { authService } from '../services/auth.service';
import { authTokenService } from '../services/auth-token.service';
import { ApiError } from '../services/http.service';
import './HomePage.css';
import './SiteHeader.css';

type AuthMode = 'login' | 'register';

function SiteHeader() {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
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

    return (
        <>
            <header className="site-header-shell">
                <nav className="home-navbar">
                    <Link to="/" className="home-brand">
                        <img className="home-brand-mark" src="/img/logo.png" alt="" />
                        <div>
                            <strong>Gòi Xong Cưới</strong>
                        </div>
                    </Link>

                    <ul className="home-nav-links">
                        <li><a href="/#home">Trang chủ</a></li>
                        <li><a href="/#pricing">Bảng giá</a></li>
                        <li><Link to="/chon-mau/co-ban">Mẫu thiệp</Link></li>
                        <li><a href="/#contact">Liên hệ</a></li>
                    </ul>

                    {currentUser ? (
                        <AuthUserBadge user={currentUser} onLogout={handleLogout} />
                    ) : (
                        <div className="home-auth-actions">
                            <button type="button" className="home-auth-login" onClick={() => setAuthMode('login')}>
                                Đăng nhập
                            </button>
                            <button type="button" className="home-auth-register" onClick={() => setAuthMode('register')}>
                                Đăng ký
                            </button>
                        </div>
                    )}
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
        </>
    );
}

export default SiteHeader;




