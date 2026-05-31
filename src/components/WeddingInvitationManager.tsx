import { useMemo, useState } from 'react';
import { ChevronDown, Eye, LinkIcon, Pencil, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import './WeddingInvitationManager.css';

type InvitationStatus = 'active' | 'draft' | 'scheduled' | 'archived';

interface InvitationCard {
    id: number;
    couple: string;
    template: string;
    date: string;
    views: string;
    updated: string;
    status: InvitationStatus;
    thumbnail: string;
    features: string[];
}

const invitations: InvitationCard[] = [
    {
        id: 1,
        couple: 'Thanh Huy & Phương Thúy',
        template: 'Mẫu Bright Love',
        date: '16 . 11 . 2025',
        views: '1.250',
        updated: '2 giờ trước',
        status: 'active',
        thumbnail: '/img/mockup-thiep-cuoi-online-1.webp',
        features: ['Có nhạc nền', 'Album ảnh', 'RSVP'],
    },
    {
        id: 2,
        couple: 'Hoàng Nam & Thanh Tú',
        template: 'Mẫu Song Hỷ Truyền Thống',
        date: '01 . 01 . 2026',
        views: '980',
        updated: '1 ngày trước',
        status: 'active',
        thumbnail: '/img/img.png',
        features: ['Có nhạc nền', 'RSVP'],
    },
    {
        id: 3,
        couple: 'Bảo Ngọc & Anh',
        template: 'Mẫu Hỷ Phượng',
        date: '20 . 12 . 2025',
        views: '760',
        updated: '3 ngày trước',
        status: 'scheduled',
        thumbnail: '/img/mockup-thiep-cuoi-online-2.webp',
        features: ['Album ảnh', 'RSVP'],
    },
    {
        id: 4,
        couple: 'Minh Đức & Hà My',
        template: 'Mẫu Minimal Flowers',
        date: '10 . 01 . 2026',
        views: '320',
        updated: '5 giờ trước',
        status: 'draft',
        thumbnail: '/img/background.png',
        features: ['Album ảnh'],
    },
    {
        id: 5,
        couple: 'Quang Huy & Thu Trang',
        template: 'Mẫu Long Phụng Sum Vầy',
        date: '15 . 02 . 2026',
        views: '1.540',
        updated: '4 giờ trước',
        status: 'active',
        thumbnail: '/img/header.png',
        features: ['Có nhạc nền', 'Album ảnh', 'RSVP'],
    },
    {
        id: 6,
        couple: 'Duy Khánh & Lan Anh',
        template: 'Mẫu Elegant Bloom',
        date: '22 . 03 . 2026',
        views: '210',
        updated: '1 ngày trước',
        status: 'draft',
        thumbnail: '/img/footer.png',
        features: ['RSVP'],
    },
];

const statusLabels: Record<InvitationStatus, string> = {
    active: 'Đang hoạt động',
    draft: 'Bản nháp',
    scheduled: 'Đã lên lịch',
    archived: 'Đã lưu trữ',
};

const filters: Array<{ label: string; value: InvitationStatus | 'all' }> = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Bản nháp', value: 'draft' },
    { label: 'Đã lên lịch', value: 'scheduled' },
    { label: 'Đã lưu trữ', value: 'archived' },
];

const sortOptions = ['Mới cập nhật', 'Lượt xem cao', 'Ngày cưới gần nhất'];

function WeddingInvitationManager() {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<InvitationStatus | 'all'>('all');
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const filteredInvitations = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return invitations.filter((invitation) => {
            const matchesFilter = activeFilter === 'all' || invitation.status === activeFilter;
            const matchesQuery = !normalizedQuery
                || invitation.couple.toLowerCase().includes(normalizedQuery)
                || invitation.template.toLowerCase().includes(normalizedQuery);

            return matchesFilter && matchesQuery;
        });
    }, [activeFilter, query]);

    const activeCount = invitations.filter((invitation) => invitation.status === 'active').length;
    const draftCount = invitations.filter((invitation) => invitation.status === 'draft').length;

    return (
        <main className="wim-page">
            <section className="wim-hero">
                <div>

                    <h1>Thiệp cưới của bạn</h1>
                    <span>Theo dõi, chỉnh sửa và quản lí tất cả thiệp cưới của bạn</span>
                </div>


            </section>

            <section className="wim-toolbar" aria-label="Bộ lọc thiệp cưới">
                <label className="wim-search">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Tìm kiếm thiệp..."
                    />
                    <button type="button" aria-label="Tìm kiếm">
                        <Search size={17} strokeWidth={2.4} />
                    </button>
                </label>



                <div
                    className="wim-toolbar-actions"
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                            setIsSortOpen(false);
                        }
                    }}
                >
                    <button
                        className="wim-sort-button"
                        type="button"
                        aria-expanded={isSortOpen}
                        aria-haspopup="listbox"
                        onClick={() => setIsSortOpen((current) => !current)}
                    >
                        <span>{selectedSort}</span>
                        <ChevronDown className="wim-sort-chevron" size={18} strokeWidth={2.4} />
                    </button>

                    {isSortOpen && (
                        <div className="wim-sort-menu" role="listbox" aria-label="Sắp xếp thiệp">
                            {sortOptions.map((option) => (
                                <button
                                    className={option === selectedSort ? 'is-active' : ''}
                                    key={option}
                                    type="button"
                                    role="option"
                                    aria-selected={option === selectedSort}
                                    onClick={() => {
                                        setSelectedSort(option);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="wim-card-grid" aria-label="Danh sách thiệp cưới">
                {filteredInvitations.map((invitation) => (
                    <article className="wim-card" key={invitation.id}>
                        <div className="wim-card-preview">
                            <img src={invitation.thumbnail} alt={`Thiệp cưới ${invitation.couple}`} />
                        </div>

                        <div className="wim-card-body">
                            <div className="wim-card-title">
                                <h2>{invitation.couple}</h2>
                                <p>{invitation.template}</p>
                            </div>

                            <div className="wim-card-meta">
                                <span>{invitation.date}</span>
                                <strong className={`wim-status is-${invitation.status}`}>{statusLabels[invitation.status]}</strong>
                                <span>{invitation.views} lượt xem</span>
                                <span>Cập nhật {invitation.updated}</span>
                            </div>

                            <div className="wim-feature-list">
                                {invitation.features.map((feature) => (
                                    <span key={feature}>{feature}</span>
                                ))}
                            </div>
                        </div>

                        <div className="wim-card-actions">
                            <button type="button">
                                <Pencil size={15} strokeWidth={2.3} />
                                <span>Chỉnh sửa</span>
                            </button>
                            <Link to="/CineLoveTraditionalInvitation">
                                <Eye size={15} strokeWidth={2.3} />
                                <span>Xem trước</span>
                            </Link>

                            <button type="button">
                                <LinkIcon size={15} strokeWidth={2.3} />
                                <span>Chia sẻ đường dẫn</span>
                            </button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default WeddingInvitationManager;
