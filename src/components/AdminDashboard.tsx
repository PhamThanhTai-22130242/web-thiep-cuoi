import {
    Bell,
    CalendarDays,
    ChevronRight,
    CreditCard,
    Gift,
    Headphones,
    Home,
    LayoutTemplate,
    MoreVertical,
    Package,
    Plus,
    Search,
    Settings,
    ShoppingCart,
    Smartphone,
    TrendingUp,
    Users,
    WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard', active: true },
    { label: 'Đơn hàng', icon: Package, path: '/admin-orders' },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations' },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates' },
    { label: 'Thanh toán', icon: CreditCard, path: '/admin-payments' },
    { label: 'Doanh thu', icon: TrendingUp, path: '/admin-dashboard' },
    { label: 'Khuyến mãi', icon: Gift, path: '/admin-dashboard' },
    { label: 'Hỗ trợ', icon: Headphones, path: '/admin-dashboard' },
    { label: 'Cài đặt', icon: Settings, path: '/admin-settings' },
];

const kpiCards = [
    { label: 'Tổng người dùng', value: '2.486', change: '12,5%', icon: Users },
    { label: 'Thiệp đang hoạt động', value: '1.284', change: '8,3%', icon: Smartphone },
    { label: 'Đơn hàng tháng này', value: '356', change: '15,7%', icon: ShoppingCart },
    { label: 'Doanh thu tháng', value: '286.400.000đ', change: '18,9%', icon: WalletCards },
];

const revenueMonths = ['12/2024', '01/2025', '02/2025', '03/2025', '04/2025', '05/2025'];
const revenueValues = ['156.2M', '182.7M', '210.4M', '245.6M', '270.1M', '286.4M'];
const chartPoints = '20,130 96,116 172,101 248,82 324,64 400,48';

const templateStats = [
    { name: 'Thiệp Nang Thơ', value: 1284, width: '100%', image: '/img/mockup-thiep-cuoi-online-1.webp' },
    { name: 'Thiệp Hỷ Sự', value: 986, width: '76%', image: '/img/double-dragon.webp' },
    { name: 'Thiệp Red Classic', value: 752, width: '58%', image: '/img/img.png' },
    { name: 'Thiệp Hoa Sen', value: 612, width: '48%', image: '/img/mockup-thiep-cuoi-online-2.webp' },
    { name: 'Thiệp Thanh Huy - Phương Thúy', value: 498, width: '39%', image: '/img/header.png' },
];

const newUsers = [
    { name: 'Trần Minh Tuấn', email: 'tuan.minh@gmail.com', time: '10 phút trước' },
    { name: 'Lê Thị Hương', email: 'huongle1998@gmail.com', time: '25 phút trước' },
    { name: 'Phạm Quốc Bảo', email: 'quocbao@gmail.com', time: '1 giờ trước' },
    { name: 'Nguyễn Hoài An', email: 'hoaian.nguyen@gmail.com', time: '2 giờ trước' },
    { name: 'Đặng Văn Khoa', email: 'khoadang@gmail.com', time: '3 giờ trước' },
];

const orders = [
    { id: '#ORD1256', customer: 'Trần Minh Tuấn', plan: 'Premium', status: 'Hoàn thành', pay: 'Đã thanh toán', date: '31/05/2025 09:42', total: '1.250.000đ' },
    { id: '#ORD1255', customer: 'Lê Thị Hương', plan: 'Standard', status: 'Đang xử lý', pay: 'Đã thanh toán', date: '31/05/2025 09:20', total: '850.000đ' },
    { id: '#ORD1254', customer: 'Phạm Quốc Bảo', plan: 'Premium', status: 'Chờ thanh toán', pay: 'Chưa thanh toán', date: '31/05/2025 08:55', total: '1.450.000đ' },
    { id: '#ORD1253', customer: 'Nguyễn Hoài An', plan: 'Basic', status: 'Đã hủy', pay: 'Đã hoàn tiền', date: '30/05/2025 16:30', total: '650.000đ' },
    { id: '#ORD1252', customer: 'Đặng Văn Khoa', plan: 'Premium', status: 'Hoàn thành', pay: 'Đã thanh toán', date: '30/05/2025 14:10', total: '1.300.000đ' },
];

function AdminDashboard() {
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
                </nav>

                <section className="admin-upgrade">
                    <span>Gói Premium</span>
                    <strong>Doanh nghiệp</strong>
                    <p>Hiệu lực đến: 31/12/2025</p>
                    <button type="button">Nâng cấp gói</button>
                </section>
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
                        <span>01/05/2025 - 31/05/2025</span>
                        <CalendarDays size={16} />
                    </button>

                    <button className="admin-bell" type="button" aria-label="Thông báo">
                        <Bell size={19} />
                        <span>8</span>
                    </button>

                    <button className="admin-create" type="button">
                        <Plus size={17} />
                        Tạo mẫu mới
                    </button>

                    <div className="admin-profile">
                        <div>A</div>
                        <span>
                            <strong>Nguyễn Văn A</strong>
                            <small>Quản trị viên</small>
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    <section className="admin-heading">
                        <p>Dashboard Admin</p>
                        <span>Theo dõi hoạt động kinh doanh và vận hành hệ thống Harmony</span>
                    </section>

                    <section className="admin-kpis" aria-label="Chỉ số tổng quan">
                        {kpiCards.map(({ label, value, change, icon: Icon }) => (
                            <article className="admin-kpi" key={label}>
                                <div className="admin-kpi-icon">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                    <small>↑ {change} so với tháng trước</small>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="admin-grid">
                        <article className="admin-panel admin-revenue">
                            <div className="admin-panel-title">
                                <h2>Doanh thu 6 tháng gần đây</h2>
                                <button type="button">6 tháng</button>
                            </div>
                            <div className="admin-line-chart">
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
                            </div>
                        </article>

                        <article className="admin-panel admin-donut-panel">
                            <div className="admin-panel-title">
                                <h2>Trạng thái đơn hàng</h2>
                            </div>
                            <div className="admin-donut-wrap">
                                <div className="admin-donut">
                                    <span>Tổng<strong>356</strong></span>
                                </div>
                                <ul>
                                    <li><i className="is-waiting" />Chờ thanh toán <strong>42</strong></li>
                                    <li><i className="is-process" />Đã thanh toán <strong>142</strong></li>
                                    <li><i className="is-pending" />Đang xử lý <strong>78</strong></li>
                                    <li><i className="is-done" />Hoàn thành <strong>81</strong></li>
                                    <li><i className="is-cancel" />Đã hủy <strong>13</strong></li>
                                </ul>
                            </div>
                            <small>Cập nhật: 31/05/2025 09:30</small>
                        </article>

                        <article className="admin-panel admin-template-panel">
                            <div className="admin-panel-title">
                                <h2>Mẫu thiệp được chọn nhiều</h2>
                                <button type="button">Top 5</button>
                            </div>
                            <div className="admin-template-list">
                                {templateStats.map((item) => (
                                    <div className="admin-template-row" key={item.name}>
                                        <img src={item.image} alt="" />
                                        <div>
                                            <span>{item.name}</span>
                                            <em><i style={{ width: item.width }} /> </em>
                                        </div>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="admin-panel admin-new-users">
                            <div className="admin-panel-title">
                                <h2>Người dùng mới</h2>
                                <button type="button">Xem tất cả</button>
                            </div>
                            {newUsers.map((user) => (
                                <div className="admin-user-row" key={user.email}>
                                    <div>{user.name.charAt(0)}</div>
                                    <span>
                                        <strong>{user.name}</strong>
                                        <small>{user.email}</small>
                                    </span>
                                    <time>{user.time}</time>
                                </div>
                            ))}
                        </article>

                        <article className="admin-panel admin-orders">
                            <div className="admin-panel-title">
                                <h2>Đơn hàng gần đây</h2>
                                <button type="button">Xem tất cả</button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Gói</th>
                                        <th>Trạng thái</th>
                                        <th>Thanh toán</th>
                                        <th>Ngày tạo</th>
                                        <th>Tổng tiền</th>
                                        <th aria-label="Thao tác" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>
                                                <span className="admin-table-user">{order.customer.charAt(0)}</span>
                                                {order.customer}
                                            </td>
                                            <td>{order.plan}</td>
                                            <td><span className={`admin-pill ${order.status === 'Hoàn thành' ? 'is-green' : order.status === 'Đã hủy' ? 'is-muted' : 'is-amber'}`}>{order.status}</span></td>
                                            <td><span className={`admin-pill ${order.pay === 'Đã thanh toán' ? 'is-green' : order.pay === 'Đã hoàn tiền' ? 'is-muted' : 'is-red'}`}>{order.pay}</span></td>
                                            <td>{order.date}</td>
                                            <td>{order.total}</td>
                                            <td><MoreVertical size={15} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="admin-table-footer">
                                <span>Hiển thị 1 đến 5 trong tổng số 356 đơn hàng</span>
                                <div>
                                    <button type="button">‹</button>
                                    <button className="is-active" type="button">1</button>
                                    <button type="button">2</button>
                                    <button type="button">3</button>
                                    <button type="button">...</button>
                                    <button type="button">72</button>
                                    <button type="button">›</button>
                                </div>
                            </div>
                        </article>

                    </section>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;
