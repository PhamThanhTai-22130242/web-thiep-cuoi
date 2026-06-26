import { useState, useEffect } from 'react';
import {
    Bell,
    CalendarDays,
    ChevronRight,
    Home,
    LayoutTemplate,
    MoreVertical,
    Plus,
    Search,
    ShoppingCart,
    Smartphone,
    Users,
    WalletCards,
    LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authTokenService } from '../services/auth-token.service';
import { adminDashboardService, AdminDashboardResponse } from '../services/admin-dashboard.service';
import './AdminDashboard.css';

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard', active: true },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations' },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates' },
];

function AdminDashboard() {
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentUser = authTokenService.getUser();
    const adminName = currentUser?.fullname || 'Admin';
    const avatarLetter = adminName.charAt(0).toUpperCase();

    useEffect(() => {
        adminDashboardService.getDashboardStats()
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load dashboard stats", err);
                setError("Không thể tải dữ liệu dashboard. Vui lòng đăng nhập lại hoặc thử lại sau.");
                setLoading(false);
            });
    }, []);

    // Calculate dynamic line chart properties
    const dynamicChartData = () => {
        if (!stats || !stats.revenueChart || stats.revenueChart.length === 0) {
            return {
                points: '20,150 96,150 172,150 248,150 324,150 400,150',
                months: [],
                values: []
            };
        }
        const months = stats.revenueChart.map(r => r.month);
        const values = stats.revenueChart.map(r => r.value);
        const numericValues = stats.revenueChart.map(r => {
            const parsed = parseFloat(r.value.replace(/[^\d.]/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        });
        const maxVal = Math.max(...numericValues, 1);
        const points = numericValues.map((val, i) => {
            const x = 20 + i * 76;
            const y = Math.round(150 - (val / maxVal) * 120);
            return `${x},${y}`;
        }).join(' ');

        return { points, months, values };
    };

    const { points: chartPoints, months: revenueMonths, values: revenueValues } = dynamicChartData();

    // Calculate dynamic donut properties
    const dynamicDonutData = () => {
        if (!stats || !stats.cardStatus) {
            return {
                conicBg: 'conic-gradient(#8ccf7e 0% 100%)',
                total: 0,
                active: 0,
                draft: 0,
                locked: 0
            };
        }
        const { active, draft, locked } = stats.cardStatus;
        const total = active + draft + locked || 1;
        const activePct = (active / total) * 100;
        const draftPct = (draft / total) * 100;

        const activeEnd = activePct;
        const draftEnd = activePct + draftPct;

        const conicBg = `conic-gradient(#8ccf7e 0% ${activeEnd.toFixed(1)}%, #f7a81b ${activeEnd.toFixed(1)}% ${draftEnd.toFixed(1)}%, #d13a34 ${draftEnd.toFixed(1)}% 100%)`;

        return {
            conicBg,
            total: stats.cardStatus.active + stats.cardStatus.draft + stats.cardStatus.locked,
            active,
            draft,
            locked
        };
    };

    const donut = dynamicDonutData();

    const formatDateString = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
            return dateStr;
        }
    };

    const kpiCards = stats ? [
        { label: 'Tổng người dùng', value: stats.totalUsers.toLocaleString('vi-VN'), change: 'Tài khoản hệ thống', icon: Users },
        { label: 'Thiệp đang hoạt động', value: stats.activeCards.toLocaleString('vi-VN'), change: 'Thời gian thực', icon: Smartphone },
        { label: 'Tổng thiệp cưới', value: stats.totalCards.toLocaleString('vi-VN'), change: 'Bao gồm bản nháp', icon: ShoppingCart },
        { label: 'Doanh thu hệ thống', value: stats.totalRevenue, change: 'Tổng tích lũy active', icon: WalletCards },
    ] : [];

    return (
        <main className="admin-dashboard">
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
                    <Link
                        to="/"
                        onClick={() => {
                            authTokenService.clearSession();
                        }}
                    >
                        <LogOut size={18} strokeWidth={2} />
                        <span>Đăng xuất</span>
                    </Link>
                </nav>
            </aside>

            <section className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-breadcrumb">
                        <strong>Admin</strong>
                        <ChevronRight size={14} />
                        <span>Dashboard</span>
                    </div>

                    <label className="admin-search">
                        <input placeholder="Tìm kiếm nhanh..." />
                        <Search size={17} />
                    </label>

                    <button className="admin-date" type="button">
                        <span>Báo cáo hôm nay</span>
                        <CalendarDays size={16} />
                    </button>

                    <button className="admin-bell" type="button" aria-label="Thông báo">
                        <Bell size={19} />
                        <span>8</span>
                    </button>

                    <Link to="/admin-templates">
                        <button className="admin-create" type="button">
                            <Plus size={17} />
                            Quản lý mẫu
                        </button>
                    </Link>

                    <div className="admin-profile">
                        <div>{avatarLetter}</div>
                        <span>
                            <strong>{adminName}</strong>
                            <small>Quản trị viên</small>
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    <section className="admin-heading">
                        <p>Dashboard Admin</p>
                        <span>Theo dõi hoạt động kinh doanh và vận hành hệ thống Harmony</span>
                    </section>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: '#8e746b' }}>
                            <div className="admin-brand-mark" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '16px' }}>H</div>
                            <strong>Đang tải dữ liệu từ máy chủ...</strong>
                        </div>
                    ) : error ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#d13a34', backgroundColor: '#fdf3f2', borderRadius: '12px', border: '1px solid #f9d6d5', margin: '20px 0' }}>
                            <strong>Đã xảy ra lỗi!</strong>
                            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>{error}</p>
                        </div>
                    ) : stats ? (
                        <>
                            <section className="admin-kpis" aria-label="Chỉ số tổng quan">
                                {kpiCards.map(({ label, value, change, icon: Icon }) => (
                                    <article className="admin-kpi" key={label}>
                                        <div className="admin-kpi-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <span>{label}</span>
                                            <strong>{value}</strong>
                                            <small>{change}</small>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <section className="admin-grid">
                                <article className="admin-panel admin-revenue">
                                    <div className="admin-panel-title">
                                        <h2>Doanh thu 6 tháng gần đây</h2>
                                    </div>
                                    <div className="admin-line-chart">
                                        {revenueMonths.length > 0 ? (
                                            <>
                                                <svg viewBox="0 0 430 170" preserveAspectRatio="none" aria-hidden="true">
                                                    <g className="grid-lines">
                                                        <line x1="20" x2="410" y1="30" y2="30" />
                                                        <line x1="20" x2="410" y1="70" y2="70" />
                                                        <line x1="20" x2="410" y1="110" y2="110" />
                                                        <line x1="20" x2="410" y1="150" y2="150" />
                                                    </g>
                                                    <polyline points={chartPoints} />
                                                    {chartPoints.split(' ').map((point, index) => {
                                                        const [cx, cy] = point.split(',');
                                                        return <circle cx={cx} cy={cy} r="4" key={point} data-label={revenueValues[index]} />;
                                                    })}
                                                </svg>
                                                <div className="admin-chart-months">
                                                    {revenueMonths.map((month) => <span key={month}>{month}</span>)}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#8e746b' }}>
                                                Chưa có dữ liệu doanh thu
                                            </div>
                                        )}
                                    </div>
                                </article>

                                <article className="admin-panel admin-donut-panel">
                                    <div className="admin-panel-title">
                                        <h2>Trạng thái thiệp cưới</h2>
                                    </div>
                                    <div className="admin-donut-wrap">
                                        <div className="admin-donut" style={{ background: donut.conicBg }}>
                                            <span>Tổng<strong>{donut.total.toLocaleString('vi-VN')}</strong></span>
                                        </div>
                                        <ul>
                                            <li><i className="is-process" />Đang hoạt động <strong>{donut.active.toLocaleString('vi-VN')}</strong></li>
                                            <li><i className="is-waiting" />Bản nháp <strong>{donut.draft.toLocaleString('vi-VN')}</strong></li>
                                            <li><i className="is-cancel" />Đã khóa <strong>{donut.locked.toLocaleString('vi-VN')}</strong></li>
                                        </ul>
                                    </div>
                                    <small>Cập nhật tự động thời gian thực</small>
                                </article>

                                <article className="admin-panel admin-new-users">
                                    <div className="admin-panel-title">
                                        <h2>Người dùng mới</h2>
                                        <Link to="/admin-users">
                                            <button type="button">Xem tất cả</button>
                                        </Link>
                                    </div>
                                    {stats.newUsers.length > 0 ? (
                                        stats.newUsers.map((user) => {
                                            const name = user.name || user.email;
                                            return (
                                                <div className="admin-user-row" key={user.email}>
                                                    <div>{name.charAt(0).toUpperCase()}</div>
                                                    <span>
                                                        <strong>{name}</strong>
                                                        <small>{user.email}</small>
                                                    </span>
                                                    <time>{user.time}</time>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ color: '#8e746b', padding: '20px 0', textAlign: 'center' }}>Chưa có người dùng mới</div>
                                    )}
                                </article>

                                <article className="admin-panel admin-orders">
                                    <div className="admin-panel-title">
                                        <h2>Thiệp cưới kích hoạt gần đây</h2>
                                        <Link to="/admin-invitations">
                                            <button type="button">Xem tất cả</button>
                                        </Link>
                                    </div>
                                    {stats.recentCards.length > 0 ? (
                                        <>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Mã thiệp</th>
                                                        <th>Cặp đôi</th>
                                                        <th>Người tạo</th>
                                                        <th>Gói</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ngày kích hoạt</th>
                                                        <th>Giá tiền</th>
                                                        <th aria-label="Thao tác" />
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.recentCards.map((card) => {
                                                        const displayGroom = card.groomName || 'Chú rể';
                                                        const displayBride = card.brideName || 'Cô dâu';
                                                        const plan = card.category === 1 ? 'Basic' : card.category === 2 ? 'Standard' : 'Premium';
                                                        const priceStr = card.promoPrice || '0đ';
                                                        return (
                                                            <tr key={card.weddingId}>
                                                                <td>#INV{card.weddingId}</td>
                                                                <td>{displayGroom} & {displayBride}</td>
                                                                <td>
                                                                    <span className="admin-table-user">{(card.creatorName || 'U').charAt(0).toUpperCase()}</span>
                                                                    {card.creatorName || card.creatorEmail}
                                                                </td>
                                                                <td>{plan}</td>
                                                                <td>
                                                                    <span className={`admin-pill ${card.status === 'active' ? 'is-green' : card.status === 'locked' ? 'is-red' : 'is-yellow'}`}>
                                                                        {card.status === 'active' ? 'Hoạt động' : card.status === 'locked' ? 'Đã khóa' : 'Bản nháp'}
                                                                    </span>
                                                                </td>
                                                                <td>{formatDateString(card.createdAt)}</td>
                                                                <td><strong>{priceStr}</strong></td>
                                                                <td><MoreVertical size={15} /></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <div className="admin-table-footer">
                                                <span>Hiển thị 1 đến {stats.recentCards.length} trong tổng số {stats.activeCards} thiệp đã kích hoạt</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: '#8e746b', padding: '40px 0', textAlign: 'center' }}>Chưa có thiệp cưới nào hoạt động</div>
                                    )}
                                </article>
                            </section>
                        </>
                    ) : null}
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;
