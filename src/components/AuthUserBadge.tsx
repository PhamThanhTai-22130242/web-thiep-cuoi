import { CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '../models/auth.model';

const avatarColors = [
    '#8f1c12',
    '#b45309',
    '#0f766e',
    '#1d4ed8',
    '#7c3aed',
    '#be123c',
    '#166534',
    '#9f1239',
];

function getDisplayName(user: AuthUser) {
    return user.fullname || user.fullName || user.email.split('@')[0];
}

function getAvatarInitial(user: AuthUser) {
    const displayName = getDisplayName(user).trim();
    const lastWord = displayName.split(/\s+/).filter(Boolean).pop() || user.email;

    return Array.from(lastWord)[0]?.toLocaleUpperCase('vi-VN') || 'U';
}

function getAvatarColor(user: AuthUser) {
    const seed = `${getDisplayName(user)}-${user.email}`;
    const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);

    return avatarColors[hash % avatarColors.length];
}

function AuthUserBadge({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    const handleEditProfile = () => {
        setIsOpen(false);
        window.alert('Chức năng chỉnh sửa hồ sơ sẽ được cập nhật sau.');
    };

    const handleManageInvitations = () => {
        setIsOpen(false);
        navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    };

    return (
        <div className={`home-user-menu${isOpen ? ' is-open' : ''}`}>
            <button
                className="home-user-badge"
                type="button"
                aria-label={`Tài khoản ${user.email}`}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
            >
                <span
                    className="home-user-avatar"
                    style={{ '--home-user-avatar-color': getAvatarColor(user) } as CSSProperties}
                    aria-hidden="true"
                >
                    {getAvatarInitial(user)}
                </span>
                <span className="home-user-meta">
                    <strong>{getDisplayName(user)}</strong>
                    <small>{user.email}</small>
                </span>
            </button>

            <div className="home-user-dropdown" role="menu" onClick={(event) => event.stopPropagation()}>
                <button type="button" role="menuitem" onClick={handleEditProfile}>
                    Chỉnh sửa hồ sơ
                </button>
                <button type="button" role="menuitem" onClick={handleManageInvitations}>
                    Quản lí thiệp cưới
                </button>
                <button className="is-danger" type="button" role="menuitem" onClick={handleLogout}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

export default AuthUserBadge;
