import { useEffect, useMemo, useState } from 'react';
import {
    CreditCard,
    MessageCircle,
    Download,
    Edit3,
    Eye,
    FileText,
    CheckCircle2,
    Home,
    LayoutTemplate,
    LockKeyhole,
    MoreVertical,
    Package,
    Plus,
    Search,
    Settings,
    Smartphone,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { authTokenService } from '../services/auth-token.service';
import './AdminDashboard.css';
import './AdminInvitationList.css';

const ADMIN_INVITATIONS_API = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADMIN.INVITATIONS}`;

type InvitationStatus = 'active' | 'draft' | 'locked' | string;

interface AdminInvitation {
    weddingId: number;
    groomName?: string;
    brideName?: string;
    slug: string;
    creatorId: number;
    creatorName?: string;
    creatorEmail?: string;
    status: InvitationStatus;
    createdAt?: string;
    viewCount?: number;
    previewImg?: string;
}

interface AdminInvitationPage {
    items: AdminInvitation[];
    totalItems: number;
    page: number;
    size: number;
    totalPages: number;
}

interface AdminInvitationPageResponse {
    code: number;
    data: AdminInvitationPage;
    message: string;
    timestamp: string;
}

interface AdminInvitationStatusResponse {
    code: number;
    data: AdminInvitation;
    message: string;
    timestamp: string;
}

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard' },
    { label: 'Đơn hàng', icon: Package, path: '/admin-orders' },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations', active: true },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates' },
    { label: 'Thanh toán', icon: CreditCard, path: '/admin-payments' },
    { label: 'Cài đặt', icon: Settings, path: '/admin-settings' },
];

const statusTabs = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Bản nháp', value: 'draft' },
    { label: 'Đã khóa', value: 'locked' },
];

const statusActions: Array<{ label: string; value: InvitationStatus; icon: LucideIcon }> = [
    { label: 'Chuyển active', value: 'active', icon: CheckCircle2 },
    { label: 'Chuyển draft', value: 'draft', icon: FileText },
    { label: 'Lock thiệp', value: 'locked', icon: LockKeyhole },
];

function getCoupleName(invitation: AdminInvitation) {
    const groom = invitation.groomName?.trim() || 'Chú rể';
    const bride = invitation.brideName?.trim() || 'Cô dâu';
    return `${groom} & ${bride}`;
}

function getCreatorName(invitation: AdminInvitation) {
    return invitation.creatorName?.trim() || invitation.creatorEmail || `User #${invitation.creatorId}`;
}

function formatDate(value?: string) {
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
    }).format(date);
}

function formatViews(value?: number) {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
}

function getStatusLabel(status: string) {
    if (status === 'active') {
        return 'Đang hoạt động';
    }

    if (status === 'draft') {
        return 'Bản nháp';
    }

    if (status === 'locked' || status === 'blocked') {
        return 'Đã khóa';
    }

    return status || 'Không rõ';
}

function getStatusClass(status: string) {
    if (status === 'active') {
        return 'is-active';
    }

    if (status === 'draft') {
        return 'is-draft';
    }

    return 'is-locked';
}

function createPages(currentPage: number, totalPages: number) {
    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((left, right) => left - right);
}

function AdminInvitationList() {
    const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [sort, setSort] = useState('created_desc');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const creatorOptions = useMemo(() => {
        const map = new Map<number, string>();
        invitations.forEach((invitation) => {
            map.set(invitation.creatorId, getCreatorName(invitation));
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [invitations]);

    useEffect(() => {
        let isMounted = true;

        async function fetchInvitations() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    size: String(pageSize),
                    query,
                    status: statusFilter,
                    sort,
                });
                if (userFilter !== 'all') {
                    params.set('userId', userFilter);
                }

                const accessToken = authTokenService.getAccessToken();
                const response = await fetch(`${ADMIN_INVITATIONS_API}?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                });
                const payload = await response.json() as AdminInvitationPageResponse;

                if (!response.ok || payload.code < 200 || payload.code >= 300 || !payload.data) {
                    throw new Error(payload.message || 'Không thể tải danh sách thiệp cưới.');
                }

                if (isMounted) {
                    setInvitations(Array.isArray(payload.data.items) ? payload.data.items : []);
                    setTotalItems(payload.data.totalItems || 0);
                    setTotalPages(Math.max(1, payload.data.totalPages || 1));
                }
            } catch (error) {
                if (isMounted) {
                    setInvitations([]);
                    setTotalItems(0);
                    setTotalPages(1);
                    setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách thiệp cưới.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchInvitations();

        return () => {
            isMounted = false;
        };
    }, [page, pageSize, query, sort, statusFilter, userFilter]);

    async function updateInvitationStatus(invitation: AdminInvitation, status: InvitationStatus) {
        if (invitation.status === status || updatingStatusId !== null) {
            return;
        }

        setUpdatingStatusId(invitation.weddingId);
        setErrorMessage('');

        try {
            const accessToken = authTokenService.getAccessToken();
            const response = await fetch(`${ADMIN_INVITATIONS_API}/${invitation.weddingId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ status }),
            });
            const payload = await response.json() as AdminInvitationStatusResponse;

            if (!response.ok || payload.code < 200 || payload.code >= 300 || !payload.data) {
                throw new Error(payload.message || 'Không thể cập nhật trạng thái thiệp cưới.');
            }

            setInvitations((currentInvitations) => {
                const nextInvitations = currentInvitations.map((currentInvitation) =>
                    currentInvitation.weddingId === invitation.weddingId ? payload.data : currentInvitation,
                );

                if (statusFilter !== 'all' && payload.data.status !== statusFilter) {
                    return nextInvitations.filter((currentInvitation) => currentInvitation.weddingId !== invitation.weddingId);
                }

                return nextInvitations;
            });

            if (statusFilter !== 'all' && payload.data.status !== statusFilter) {
                setTotalItems((currentTotal) => Math.max(0, currentTotal - 1));
            }

            setOpenActionMenuId(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái thiệp cưới.');
        } finally {
            setUpdatingStatusId(null);
        }
    }

    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);
    const pages = createPages(page, totalPages);

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
                            <input
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Tìm tên cặp đôi, slug..."
                            />
                            <Search size={16} />
                        </label>

                        <div className="admin-invitation-tabs">
                            {statusTabs.map((item) => (
                                <button
                                    className={statusFilter === item.value ? 'is-active' : ''}
                                    type="button"
                                    key={item.value}
                                    onClick={() => {
                                        setStatusFilter(item.value);
                                        setPage(1);
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <select
                            aria-label="Người dùng"
                            value={userFilter}
                            onChange={(event) => {
                                setUserFilter(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">Tất cả người dùng</option>
                            {creatorOptions.map((creator) => (
                                <option value={creator.id} key={creator.id}>{creator.name}</option>
                            ))}
                        </select>

                        <select
                            aria-label="Sắp xếp"
                            value={sort}
                            onChange={(event) => {
                                setSort(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="created_desc">Sắp xếp: Ngày tạo mới nhất</option>
                            <option value="created_asc">Ngày tạo cũ nhất</option>
                            <option value="views_desc">Lượt xem cao</option>
                        </select>

                        <button className="admin-invitation-export" type="button">
                            <Download size={16} />
                            Xuất Excel
                        </button>

                        <Link className="admin-invitation-add" to="/chon-mau/basic">
                            <Plus size={17} />
                            Thêm thiệp
                        </Link>
                    </section>

                    <section className="admin-invitation-table-card">
                        <div className="admin-invitation-table-wrap">
                            <table className="admin-invitation-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên cặp đôi</th>
                                        <th>Slug</th>
                                        <th>Người tạo</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Lượt xem</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && (
                                        <tr>
                                            <td colSpan={8} className="admin-invitation-empty">Đang tải danh sách thiệp cưới...</td>
                                        </tr>
                                    )}
                                    {!isLoading && errorMessage && (
                                        <tr>
                                            <td colSpan={8} className="admin-invitation-empty is-error">{errorMessage}</td>
                                        </tr>
                                    )}
                                    {!isLoading && !errorMessage && invitations.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="admin-invitation-empty">Chưa có thiệp cưới phù hợp.</td>
                                        </tr>
                                    )}
                                    {!isLoading && !errorMessage && invitations.map((invitation) => (
                                        <tr key={invitation.weddingId}>
                                            <td>
                                                <strong className="admin-invitation-code">#{invitation.weddingId}</strong>
                                            </td>
                                            <td>{getCoupleName(invitation)}</td>
                                            <td>
                                                <span className="admin-invitation-slug">/{invitation.slug}</span>
                                            </td>
                                            <td>
                                                <div className="admin-invitation-owner">
                                                    <strong>{getCreatorName(invitation)}</strong>
                                                    {invitation.creatorEmail && <span>{invitation.creatorEmail}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`admin-invitation-status ${getStatusClass(invitation.status)}`}>
                                                    {getStatusLabel(invitation.status)}
                                                </span>
                                            </td>
                                            <td>{formatDate(invitation.createdAt)}</td>
                                            <td>{formatViews(invitation.viewCount)}</td>
                                            <td>
                                                <div className="admin-invitation-actions">
                                                    <Link to={`/thiep/${invitation.slug}`} aria-label="Xem thiệp">
                                                        <Eye size={15} />
                                                    </Link>
                                                    <Link to={`/EmeraldInvitation/edit?weddingId=${invitation.weddingId}`} aria-label="Chỉnh sửa">
                                                        <Edit3 size={15} />
                                                    </Link>
                                                    <Link to={`/quan-li-binh-luan/${invitation.slug}`} aria-label="Quản lí bình luận">
                                                        <MessageCircle size={15} />
                                                    </Link>
                                                    <div className="admin-invitation-action-menu">
                                                        <button
                                                            type="button"
                                                            aria-label="Đổi trạng thái thiệp"
                                                            aria-expanded={openActionMenuId === invitation.weddingId}
                                                            onClick={() => setOpenActionMenuId((currentId) => currentId === invitation.weddingId ? null : invitation.weddingId)}
                                                            disabled={updatingStatusId === invitation.weddingId}
                                                        >
                                                            <MoreVertical size={15} />
                                                        </button>
                                                        {openActionMenuId === invitation.weddingId && (
                                                            <div className="admin-invitation-status-menu" role="menu">
                                                                {statusActions.map(({ label, value, icon: Icon }) => (
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        key={value}
                                                                        disabled={invitation.status === value || updatingStatusId === invitation.weddingId}
                                                                        onClick={() => updateInvitationStatus(invitation, value)}
                                                                    >
                                                                        <Icon size={14} />
                                                                        <span>{invitation.status === value ? `${label} hiện tại` : label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <footer className="admin-invitation-footer">
                            <span>Hiển thị {firstItem} đến {lastItem} trong tổng số {totalItems} thiệp</span>
                            <div className="admin-invitation-pages">
                                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
                                {pages.map((pageNumber, index) => {
                                    const previousPage = pages[index - 1];
                                    return (
                                        <span className="admin-invitation-page-item" key={pageNumber}>
                                            {previousPage && pageNumber - previousPage > 1 && <span>...</span>}
                                            <button
                                                className={pageNumber === page ? 'is-active' : ''}
                                                type="button"
                                                onClick={() => setPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </span>
                                    );
                                })}
                                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</button>
                            </div>
                            <select
                                aria-label="Số dòng mỗi trang"
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setPage(1);
                                }}
                            >
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>
                        </footer>
                    </section>
                </div>
            </section>
        </main>
    );
}

export default AdminInvitationList;
