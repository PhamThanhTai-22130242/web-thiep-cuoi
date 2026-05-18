import {
    Archive,
    CreditCard,
    Download,
    Edit3,
    Eye,
    Home,
    LayoutTemplate,
    MoreVertical,
    Package,
    Plus,
    Search,
    Settings,
    Smartphone,
    Trash2,
    Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminTemplateManager.css';

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard' },
    { label: 'Đơn hàng', icon: Package, path: '/admin-orders' },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations' },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates', active: true },
    { label: 'Thanh toán', icon: CreditCard, path: '/admin-payments' },
    { label: 'Cài đặt', icon: Settings, path: '/admin-settings' },
];

const summaryCards = [
    { label: 'Tổng mẫu thiệp', value: '128', icon: Archive, tone: 'red' },
    { label: 'Đang hiển thị', value: '96', icon: Eye, tone: 'green' },
];

const templates = [
    {
        name: 'Thiệp Song Hỷ Đỏ',
        code: 'TPL-001',
        category: 'Truyền thống',
        price: '299.000đ',
        status: 'Đang hiển thị',
        uses: '1.284',
        image: '/img/double-dragon.webp',
    },
    {
        name: 'Thiệp Nàng Thơ',
        code: 'TPL-002',
        category: 'Hiện đại',
        price: '349.000đ',
        status: 'Đang hiển thị',
        uses: '986',
        image: '/img/mockup-thiep-cuoi-online-1.webp',
    },
    {
        name: 'Thiệp Hoa Sen',
        code: 'TPL-003',
        category: 'Việt Nam',
        price: '299.000đ',
        status: 'Đang hiển thị',
        uses: '752',
        image: '/img/mockup-thiep-cuoi-online-2.webp',
    },
    {
        name: 'Thiệp Minimal Cream',
        code: 'TPL-004',
        category: 'Tối giản',
        price: '199.000đ',
        status: 'Bản nháp',
        uses: '320',
        image: '/img/footer.png',
    },
    {
        name: 'Thiệp Long Phụng',
        code: 'TPL-005',
        category: 'Truyền thống',
        price: '399.000đ',
        status: 'Đang hiển thị',
        uses: '612',
        image: '/img/header.png',
    },
    {
        name: 'Thiệp Elegant Bloom',
        code: 'TPL-006',
        category: 'Sang trọng',
        price: '349.000đ',
        status: 'Đã ẩn',
        uses: '210',
        image: '/img/background.png',
    },
];

function AdminTemplateManager() {
    return (
        <main className="admin-dashboard admin-template-page">
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
                <div className="admin-template-content">
                    <section className="admin-template-heading">
                        <h1>Quản lý mẫu thiệp</h1>
                        <p>Quản lý, chỉnh sửa và theo dõi tất cả mẫu thiệp cưới đang hiển thị trên hệ thống.</p>
                    </section>

                    <section className="admin-template-stats" aria-label="Thống kê mẫu thiệp">
                        {summaryCards.map(({ label, value, icon: Icon, tone }) => (
                            <article className={`admin-template-stat is-${tone}`} key={label}>
                                <div>
                                    <Icon size={22} strokeWidth={2.2} />
                                </div>
                                <span>
                                    <small>{label}</small>
                                    <strong>{value}</strong>
                                </span>
                            </article>
                        ))}
                    </section>

                    <section className="admin-template-toolbar" aria-label="Bộ lọc mẫu thiệp">
                        <label className="admin-template-search">
                            <Search size={16} />
                            <input placeholder="Tìm tên mẫu, mã mẫu..." />
                        </label>

                        <div className="admin-template-tabs">
                            {['Tất cả', 'Đang hiển thị', 'Bản nháp', 'Đã ẩn', 'Nổi bật'].map((item, index) => (
                                <button className={index === 0 ? 'is-active' : ''} type="button" key={item}>
                                    {item}
                                </button>
                            ))}
                        </div>

                        <select aria-label="Danh mục">
                            <option>Danh mục: Tất cả</option>
                            <option>Truyền thống</option>
                            <option>Hiện đại</option>
                            <option>Tối giản</option>
                        </select>

                        <select aria-label="Sắp xếp">
                            <option>Sắp xếp: Mới nhất</option>
                            <option>Lượt dùng cao</option>
                            <option>Giá thấp đến cao</option>
                        </select>

                        <button className="admin-template-export" type="button">
                            <Download size={16} />
                            Xuất Excel
                        </button>

                        <button className="admin-template-add" type="button">
                            <Plus size={17} />
                            Thêm mẫu thiệp
                        </button>
                    </section>

                    <section className="admin-template-grid" aria-label="Danh sách mẫu thiệp">
                        {templates.map((template) => (
                            <article className="admin-template-card" key={template.code}>
                                <button className="admin-template-more" type="button" aria-label="Thao tác khác">
                                    <MoreVertical size={16} />
                                </button>

                                <div className="admin-template-preview">
                                    <img src={template.image} alt={template.name} />
                                </div>

                                <div className="admin-template-info">
                                    <h2>{template.name}</h2>
                                    <p>Mã: {template.code}</p>
                                    <p>Danh mục: {template.category}</p>
                                    <strong>Giá: {template.price}</strong>
                                </div>

                                <div className="admin-template-meta">
                                    <span>Trạng thái</span>
                                    <em className={template.status === 'Đang hiển thị' ? 'is-visible' : template.status === 'Bản nháp' ? 'is-draft' : 'is-hidden'}>
                                        {template.status}
                                    </em>
                                    <span>Lượt dùng</span>
                                    <strong>{template.uses}</strong>
                                </div>

                                <div className="admin-template-actions">
                                    <button type="button"><Eye size={14} />Xem trước</button>
                                    <button type="button"><Edit3 size={14} />Chỉnh sửa</button>
                                    <button type="button"><Archive size={14} />Ẩn mẫu</button>
                                    <button className="is-delete" type="button"><Trash2 size={14} />Xóa</button>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </section>
        </main>
    );
}

export default AdminTemplateManager;
