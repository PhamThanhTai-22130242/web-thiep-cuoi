import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    CreditCard,
    Download,
    Edit3,
    Eye,
    Home,
    LayoutTemplate,
    LockKeyhole,
    MoreVertical,
    Package,
    Search,
    Settings,
    SlidersHorizontal,
    Smartphone,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { authTokenService } from '../services/auth-token.service';
import './AdminDashboard.css';
import './AdminUserManager.css';

const ADMIN_USERS_API = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADMIN.USERS}`;

interface AdminUser {
    id: number;
    email: string;
    fullname: string;
    role: 'ADMIN' | 'USER' | string;
    status: 'ACTIVE' | 'BLOCKED' | 'LOCKED' | 'INACTIVE' | string;
    createdAt: string;
    updateAt: string;
}

interface AdminUsersResponse {
    code: number;
    data: AdminUser[];
    message: string;
    timestamp: string;
}

interface AdminUserResponse {
    code: number;
    data: AdminUser;
    message: string;
    timestamp: string;
}

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard' },
    { label: 'Đơn hàng', icon: Package, path: '/admin-orders' },
    { label: 'Người dùng', icon: Users, path: '/admin-users', active: true },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations' },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates' },
    { label: 'Thanh toán', icon: CreditCard, path: '/admin-payments' },
    { label: 'Cài đặt', icon: Settings, path: '/admin-settings' },
];

function getInitials(name: string) {
    const parts = name.split(' ').filter(Boolean);
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.slice(0, 2);
}

function formatDateTime(value: string) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getRoleLabel(role: string) {
    return role === 'ADMIN' ? 'Admin' : 'Khách hàng';
}

function getStatusLabel(status: string) {
    if (status === 'ACTIVE') {
        return 'Hoạt động';
    }

    if (status === 'BLOCKED' || status === 'LOCKED') {
        return 'Bị khóa';
    }

    return status || 'Không rõ';
}

function AdminUserManager() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [blockingUserId, setBlockingUserId] = useState<number | null>(null);
    const [blockError, setBlockError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function fetchUsers() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const accessToken = authTokenService.getAccessToken();
                const response = await fetch(ADMIN_USERS_API, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                });

                const payload = await response.json() as AdminUsersResponse;

                if (!response.ok || payload.code < 200 || payload.code >= 300) {
                    throw new Error(payload.message || 'Không thể tải danh sách người dùng.');
                }

                if (isMounted) {
                    setUsers(Array.isArray(payload.data) ? payload.data : []);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách người dùng.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return users.filter((user) => {
            const matchesQuery = !normalizedQuery
                || user.fullname.toLowerCase().includes(normalizedQuery)
                || user.email.toLowerCase().includes(normalizedQuery)
                || String(user.id).includes(normalizedQuery);
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesQuery && matchesRole && matchesStatus;
        });
    }, [query, roleFilter, statusFilter, users]);

    const activeCount = users.filter((user) => user.status === 'ACTIVE').length;
    const lockedCount = users.filter((user) => user.status === 'BLOCKED' || user.status === 'LOCKED').length;
    const newUserCount = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        return !Number.isNaN(createdAt.getTime()) && createdAt.getTime() >= thirtyDaysAgo;
    }).length;

    const userStats = [
        { label: 'Tổng người dùng', value: String(users.length), note: 'Tất cả tài khoản', icon: Users, tone: 'blue' },
        { label: 'Người dùng hoạt động', value: String(activeCount), note: 'Đang hoạt động', icon: UserCheck, tone: 'green' },
        { label: 'Người dùng mới (30 ngày)', value: String(newUserCount), note: 'Đăng ký mới', icon: UserPlus, tone: 'orange' },
        { label: 'Tài khoản bị khóa', value: String(lockedCount), note: 'Đã bị khóa', icon: LockKeyhole, tone: 'red' },
    ];

    const handleBlockUser = async (userId: number) => {
        setBlockingUserId(userId);
        setBlockError('');

        try {
            const accessToken = authTokenService.getAccessToken();
            const response = await fetch(`${ADMIN_USERS_API}/${userId}/block`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            });
            const payload = await response.json() as AdminUserResponse;

            if (!response.ok || payload.code < 200 || payload.code >= 300 || !payload.data) {
                throw new Error(payload.message || 'Block user thất bại.');
            }

            setUsers((currentUsers) => currentUsers.map((user) => (
                user.id === userId ? payload.data : user
            )));
        } catch {
            setBlockError('Xảy ra lỗi');
        } finally {
            setBlockingUserId(null);
        }
    };

    return (
        <main className="admin-dashboard admin-users-page">
            {blockError && (
                <div className="admin-users-error-popup" role="alertdialog" aria-modal="true">
                    <div>
                        <strong>{blockError}</strong>
                        <p>Không thể khóa người dùng. Vui lòng thử lại.</p>
                        <button type="button" onClick={() => setBlockError('')}>Đóng</button>
                    </div>
                </div>
            )}

            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-mark">H</div>
                    <div>
                        <strong>Harmony</strong>
                        <span>Thiệp Cưới</span>
                    </div>
                </div>

                <nav className="admin-nav" aria-label="Admin navigation">
                    {navItems.map(({ label, icon: Icon, path, active }) => (
                        <Link className={active ? 'is-active' : ''} to={path} key={label}>
                            <Icon size={18} strokeWidth={2} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <section className="admin-main">
                <div className="admin-users-content">
                    <section className="admin-users-heading">
                        <div>
                            <h1>Quản lý người dùng</h1>
                            <p>Quản lý tất cả tài khoản người dùng trên hệ thống.</p>
                        </div>
                    </section>

                    <section className="admin-users-stats" aria-label="Thống kê người dùng">
                        {userStats.map(({ label, value, note, icon: Icon, tone }) => (
                            <article className={`admin-users-stat is-${tone}`} key={label}>
                                <div>
                                    <Icon size={22} strokeWidth={2.1} />
                                </div>
                                <span>
                                    <small>{label}</small>
                                    <strong>{value}</strong>
                                    <em>{note}</em>
                                </span>
                            </article>
                        ))}
                    </section>

                    <section className="admin-users-toolbar" aria-label="Bộ lọc người dùng">
                        <label className="admin-users-search">
                            <Search size={16} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Tìm kiếm theo tên, email, ID..."
                            />
                        </label>

                        <select aria-label="Vai trò" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                            <option value="all">Vai trò: Tất cả</option>
                            <option value="ADMIN">Admin</option>
                            <option value="USER">Khách hàng</option>
                        </select>

                        <select aria-label="Trạng thái" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Trạng thái: Tất cả</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="BLOCKED">Bị khóa</option>
                        </select>

                        <button className="admin-users-date" type="button">
                            <span>Ngày đăng ký</span>
                            <CalendarDays size={16} />
                        </button>

                        <button className="admin-users-export" type="button">
                            <Download size={16} />
                            Xuất Excel
                        </button>

                        <button className="admin-users-filter" type="button" aria-label="Bộ lọc nâng cao">
                            <SlidersHorizontal size={17} />
                        </button>
                    </section>

                    <section className="admin-users-table-card">
                        <div className="admin-users-table-wrap">
                            <table className="admin-users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Người dùng</th>
                                        <th>Email</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Cập nhật</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && (
                                        <tr>
                                            <td className="admin-users-state" colSpan={8}>Đang tải danh sách người dùng...</td>
                                        </tr>
                                    )}

                                    {!isLoading && errorMessage && (
                                        <tr>
                                            <td className="admin-users-state is-error" colSpan={8}>{errorMessage}</td>
                                        </tr>
                                    )}

                                    {!isLoading && !errorMessage && filteredUsers.length === 0 && (
                                        <tr>
                                            <td className="admin-users-state" colSpan={8}>Không có người dùng phù hợp.</td>
                                        </tr>
                                    )}

                                    {!isLoading && !errorMessage && filteredUsers.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>#{user.id}</td>
                                            <td>
                                                <span className={`admin-users-avatar is-${index % 5}`}>{getInitials(user.fullname || user.email)}</span>
                                                <strong>{user.fullname || '-'}</strong>
                                            </td>
                                            <td>{user.email}</td>
                                            <td><span className={user.role === 'ADMIN' ? 'admin-users-role is-admin' : 'admin-users-role'}>{getRoleLabel(user.role)}</span></td>
                                            <td><span className={user.status === 'ACTIVE' ? 'admin-users-status is-active' : 'admin-users-status is-locked'}>{getStatusLabel(user.status)}</span></td>
                                            <td>{formatDateTime(user.createdAt)}</td>
                                            <td>{formatDateTime(user.updateAt)}</td>
                                            <td>
                                                <div className="admin-users-actions">
                                                    <button type="button" aria-label="Xem"><Eye size={15} /></button>
                                                    <button type="button" aria-label="Chỉnh sửa"><Edit3 size={15} /></button>
                                                    <button
                                                        type="button"
                                                        aria-label="Khóa người dùng"
                                                        disabled={blockingUserId === user.id || user.status === 'BLOCKED' || user.status === 'LOCKED'}
                                                        onClick={() => handleBlockUser(user.id)}
                                                    >
                                                        <LockKeyhole size={15} />
                                                    </button>
                                                    <button type="button" aria-label="Thêm"><MoreVertical size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <footer className="admin-users-footer">
                            <span>Hiển thị {filteredUsers.length ? 1 : 0} - {filteredUsers.length} trong tổng số {users.length} người dùng</span>
                            <div className="admin-users-page-size">
                                <span>Hiển thị</span>
                                <select aria-label="Số mục mỗi trang" defaultValue="8">
                                    <option>8</option>
                                    <option>16</option>
                                    <option>32</option>
                                </select>
                                <span>mục mỗi trang</span>
                            </div>
                            <div className="admin-users-pages">
                                <button type="button">‹</button>
                                <button className="is-active" type="button">1</button>
                                <button type="button">›</button>
                            </div>
                        </footer>
                    </section>
                </div>
            </section>
        </main>
    );
}

export default AdminUserManager;
