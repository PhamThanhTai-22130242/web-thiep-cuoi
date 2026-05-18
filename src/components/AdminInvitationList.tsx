import {
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
    Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminInvitationList.css';

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard' },
    { label: 'Đơn hàng', icon: Package, path: '/admin-orders' },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations', active: true },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates' },
    { label: 'Thanh toán', icon: CreditCard, path: '/admin-payments' },
    { label: 'Cài đặt', icon: Settings, path: '/admin-settings' },
];

const invitations = [
    {
        orderCode: 'ORD0001',
        couple: 'Thanh Huy & Phương Thúy',
        owner: 'Nguyễn Văn A',
        plan: 'Premium',
        status: 'Đang hoạt động',
        created: '31/05/2025',
        views: '2.345',
        image: '/img/double-dragon.webp',
    },
    {
        orderCode: 'ORD0002',
        couple: 'Hoàng Nam & Thanh Tú',
        owner: 'Lê Thu Hương',
        plan: 'Standard',
        status: 'Đang hoạt động',
        created: '30/05/2025',
        views: '1.980',
        image: '/img/mockup-thiep-cuoi-online-1.webp',
    },
    {
        orderCode: 'ORD0003',
        couple: 'Bảo Ngọc & Anh',
        owner: 'Phạm Quốc Bảo',
        plan: 'Standard',
        status: 'Bản nháp',
        created: '29/05/2025',
        views: '320',
        image: '/img/mockup-thiep-cuoi-online-2.webp',
    },
    {
        orderCode: 'ORD0004',
        couple: 'Minh Đức & Hà My',
        owner: 'Nguyễn Hoài An',
        plan: 'Basic',
        status: 'Bản nháp',
        created: '28/05/2025',
        views: '154',
        image: '/img/footer.png',
    },
    {
        orderCode: 'ORD0005',
        couple: 'Quang Huy & Thu Trang',
        owner: 'Đặng Văn Khoa',
        plan: 'Premium',
        status: 'Đang hoạt động',
        created: '28/05/2025',
        views: '2.876',
        image: '/img/header.png',
    },
    {
        orderCode: 'ORD0006',
        couple: 'Duy Khánh & Lan Anh',
        owner: 'Ngô Thị Hạnh',
        plan: 'Basic',
        status: 'Đã khóa',
        created: '27/05/2025',
        views: '98',
        image: '/img/background.png',
    },
];

function AdminInvitationList() {
    return (
        <main className="admin-dashboard admin-invitation-page">
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
                <div className="admin-invitation-content">
                    <section className="admin-invitation-heading">
                        <h1>Danh sách thiệp cưới</h1>
                        <p>Theo dõi và quản lý toàn bộ thiệp cưới do người dùng tạo trên hệ thống.</p>
                    </section>

                    <section className="admin-invitation-toolbar" aria-label="Bộ lọc danh sách thiệp cưới">
                        <label className="admin-invitation-search">
                            <input placeholder="Tìm tên cặp đôi, mã thiệp..." />
                            <Search size={16} />
                        </label>

                        <div className="admin-invitation-tabs">
                            {['Tất cả', 'Đang hoạt động', 'Bản nháp', 'Đã khóa'].map((item, index) => (
                                <button className={index === 0 ? 'is-active' : ''} type="button" key={item}>
                                    {item}
                                </button>
                            ))}
                        </div>

                        <select aria-label="Người dùng">
                            <option>Tất cả người dùng</option>
                            <option>Premium</option>
                            <option>Standard</option>
                            <option>Basic</option>
                        </select>

                        <select aria-label="Sắp xếp">
                            <option>Sắp xếp: Mới cập nhật</option>
                            <option>Lượt xem cao</option>
                            <option>Ngày tạo mới nhất</option>
                        </select>

                        <button className="admin-invitation-export" type="button">
                            <Download size={16} />
                            Xuất Excel
                        </button>

                        <button className="admin-invitation-add" type="button">
                            <Plus size={17} />
                            Thêm thiệp
                        </button>
                    </section>

                    <section className="admin-invitation-table-card">
                        <div className="admin-invitation-table-wrap">
                            <table className="admin-invitation-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Ảnh xem trước</th>
                                        <th>Tên cặp đôi</th>
                                        <th>Người tạo</th>
                                        <th>Gói</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Lượt xem</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map((invitation) => (
                                        <tr key={invitation.orderCode}>
                                            <td>
                                                <strong className="admin-invitation-code">{invitation.orderCode}</strong>
                                            </td>
                                            <td>
                                                <img className="admin-invitation-thumb" src={invitation.image} alt={invitation.couple} />
                                            </td>
                                            <td>{invitation.couple}</td>
                                            <td>{invitation.owner}</td>
                                            <td>{invitation.plan}</td>
                                            <td>
                                                <span className={`admin-invitation-status ${invitation.status === 'Đang hoạt động' ? 'is-active' : invitation.status === 'Bản nháp' ? 'is-draft' : 'is-locked'}`}>
                                                    {invitation.status}
                                                </span>
                                            </td>
                                            <td>{invitation.created}</td>
                                            <td>{invitation.views}</td>
                                            <td>
                                                <div className="admin-invitation-actions">
                                                    <button type="button" aria-label="Xem trước"><Eye size={15} /></button>
                                                    <button type="button" aria-label="Chỉnh sửa"><Edit3 size={15} /></button>
                                                    <button type="button" aria-label="Thao tác khác"><MoreVertical size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <footer className="admin-invitation-footer">
                            <span>Hiển thị 1 đến 6 trong tổng số 1.284 thiệp</span>
                            <div className="admin-invitation-pages">
                                <button type="button">‹</button>
                                <button className="is-active" type="button">1</button>
                                <button type="button">2</button>
                                <button type="button">3</button>
                                <button type="button">4</button>
                                <button type="button">5</button>
                                <span>...</span>
                                <button type="button">215</button>
                                <button type="button">›</button>
                            </div>
                            <select aria-label="Số dòng mỗi trang">
                                <option>10 / trang</option>
                                <option>20 / trang</option>
                                <option>50 / trang</option>
                            </select>
                        </footer>
                    </section>
                </div>
            </section>
        </main>
    );
}

export default AdminInvitationList;
