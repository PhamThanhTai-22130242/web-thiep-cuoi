import { useEffect, useState } from 'react';
import {
    Archive,
    Edit3,
    Eye,
    Home,
    LayoutTemplate,
    MoreVertical,
    Search,
    Settings,
    Smartphone,
    Users,
    LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authTokenService } from '../services/auth-token.service';
import { weddingTemplateRegistry } from '../data/weddingTemplateRegistry';
import { weddingTemplateService, DbTemplate, categoryLabels } from '../services/wedding-template.service';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import './AdminDashboard.css';
import './AdminTemplateManager.css';

const navItems = [
    { label: 'Tổng quan', icon: Home, path: '/admin-dashboard' },
    { label: 'Người dùng', icon: Users, path: '/admin-users' },
    { label: 'Thiệp cưới', icon: Smartphone, path: '/admin-invitations' },
    { label: 'Mẫu thiệp', icon: LayoutTemplate, path: '/admin-templates', active: true },
];



function AdminTemplateManager() {
    const [templateStats, setTemplateStats] = useState<Record<string, number>>({});
    const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<{ code: string; name: string; price: string; promoPrice: string } | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [editPromoPrice, setEditPromoPrice] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [selectedSort, setSelectedSort] = useState('Mới nhất');

    const toggleHideTemplate = async (code: string, currentHidden: boolean) => {
        try {
            const updated = await weddingTemplateService.toggleTemplateVisibility(code, !currentHidden);
            setDbTemplates(prev => prev.map(t => t.code === code ? updated : t));
        } catch (error) {
            console.error("Failed to toggle visibility", error);
        }
    };

    const startEdit = (template: { code: string; name: string; price: string; promoPrice: string }) => {
        setEditingTemplate(template);
        setEditPrice(template.price);
        setEditPromoPrice(template.promoPrice);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        try {
            const updated = await weddingTemplateService.updateTemplate(editingTemplate.code, {
                price: editPrice,
                promoPrice: editPromoPrice,
            });
            setDbTemplates(prev => prev.map(t => t.code === editingTemplate.code ? updated : t));
            setEditingTemplate(null);
        } catch (error) {
            console.error("Failed to save template edits", error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        async function loadData() {
            try {
                const accessToken = authTokenService.getAccessToken();
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADMIN.INVITATIONS}/templates/stats`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                });
                if (response.ok) {
                    const payload = await response.json();
                    if (payload && payload.data && isMounted) {
                        setTemplateStats(payload.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch template stats", error);
            }

            try {
                const list = await weddingTemplateService.getAdminTemplates();
                if (isMounted) {
                    setDbTemplates(list);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch templates list", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    const templates = dbTemplates.map((tpl) => {
        const usesCount = templateStats[tpl.code] ?? 0;
        const registryConfig = weddingTemplateRegistry[tpl.code];
        return {
            name: tpl.name,
            code: tpl.code,
            category: categoryLabels[tpl.category] || 'Mặc định',
            price: tpl.price,
            promoPrice: tpl.promoPrice,
            status: tpl.isHidden ? 'Đã ẩn' : 'Đang hiển thị',
            uses: usesCount.toLocaleString('vi-VN'),
            image: registryConfig?.thumbnailPath || '/img/background.png',
            isHidden: tpl.isHidden,
            previewPath: registryConfig?.previewPath || '#',
        };
    });

    const filteredTemplates = templates.filter((template) => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const nameMatch = template.name.toLowerCase().includes(query);
            const codeMatch = template.code.toLowerCase().includes(query);
            if (!nameMatch && !codeMatch) return false;
        }

        if (activeTab === 'Đang hiển thị') {
            if (template.isHidden) return false;
        } else if (activeTab === 'Đã ẩn') {
            if (!template.isHidden) return false;
        } else if (activeTab === 'Bản nháp') {
            return false;
        } else if (activeTab === 'Nổi bật') {
            const usesInt = parseInt(template.uses.replace(/\./g, '')) || 0;
            if (usesInt < 700) return false;
        }

        if (selectedCategory !== 'Tất cả') {
            const dbTpl = dbTemplates.find(t => t.code === template.code);
            if (dbTpl && String(dbTpl.category) !== selectedCategory) {
                return false;
            }
        }

        return true;
    });

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        if (selectedSort === 'Lượt dùng cao') {
            const usesA = parseInt(a.uses.replace(/\./g, '')) || 0;
            const usesB = parseInt(b.uses.replace(/\./g, '')) || 0;
            return usesB - usesA;
        } else if (selectedSort === 'Giá thấp đến cao') {
            const cleanPrice = (priceStr: string) => {
                return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
            };
            return cleanPrice(a.promoPrice) - cleanPrice(b.promoPrice);
        } else {
            const dbTplA = dbTemplates.find(t => t.code === a.code);
            const dbTplB = dbTemplates.find(t => t.code === b.code);
            const idA = dbTplA ? dbTplA.id : 0;
            const idB = dbTplB ? dbTplB.id : 0;
            return idB - idA;
        }
    });

    const totalCount = dbTemplates.length;
    const hiddenCount = dbTemplates.filter(t => t.isHidden).length;
    const activeCount = totalCount - hiddenCount;

    const summaryCards = [
        { label: 'Tổng mẫu thiệp', value: String(totalCount), icon: Archive, tone: 'red' },
        { label: 'Đang hiển thị', value: String(activeCount), icon: Eye, tone: 'green' },
    ];
    if (loading) {
        return (
            <main className="admin-dashboard admin-template-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#90766d', fontFamily: 'system-ui' }}>
                <div>Đang tải danh sách mẫu thiệp...</div>
            </main>
        );
    }

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
                            <input 
                                placeholder="Tìm tên mẫu, mã mẫu..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </label>

                        <div className="admin-template-tabs">
                            {['Tất cả', 'Đang hiển thị', 'Bản nháp', 'Đã ẩn', 'Nổi bật'].map((item) => (
                                <button 
                                    className={activeTab === item ? 'is-active' : ''} 
                                    type="button" 
                                    key={item}
                                    onClick={() => setActiveTab(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <select 
                            aria-label="Danh mục" 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="Tất cả">Danh mục: Tất cả</option>
                            <option value="1">Cơ bản</option>
                            <option value="2">Chuyên nghiệp</option>
                            <option value="3">Thời thượng</option>
                        </select>

                        <select 
                            aria-label="Sắp xếp" 
                            value={selectedSort} 
                            onChange={(e) => setSelectedSort(e.target.value)}
                        >
                            <option value="Mới nhất">Sắp xếp: Mới nhất</option>
                            <option value="Lượt dùng cao">Lượt dùng cao</option>
                            <option value="Giá thấp đến cao">Giá thấp đến cao</option>
                        </select>
                    </section>

                    <section className="admin-template-grid" aria-label="Danh sách mẫu thiệp">
                        {sortedTemplates.map((template) => (
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
                                    <div className="admin-template-prices" style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                                        <strong>Giá khuyến mãi: <span style={{ color: '#24905b', fontWeight: 'bold' }}>{template.promoPrice}</span></strong>
                                        <span style={{ fontSize: '0.72rem', color: '#90766d', textDecoration: 'line-through' }}>Giá cả: {template.price}</span>
                                    </div>
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
                                    <button type="button" onClick={() => window.open(template.previewPath, '_blank')}><Eye size={14} />Xem trước</button>
                                    <button type="button" onClick={() => startEdit(template)}><Edit3 size={14} />Chỉnh sửa</button>
                                    {template.status === 'Đã ẩn' ? (
                                        <button type="button" onClick={() => toggleHideTemplate(template.code, template.isHidden)}>
                                            <Eye size={14} />Hiện mẫu
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => toggleHideTemplate(template.code, template.isHidden)}>
                                            <Archive size={14} />Ẩn mẫu
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </section>

            {editingTemplate && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-container">
                        <div className="admin-modal-header">
                            <h3>Chỉnh sửa giá - {editingTemplate.name}</h3>
                            <button className="admin-modal-close" onClick={() => setEditingTemplate(null)}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Giá cả</label>
                                <input
                                    type="text"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    placeholder="Ví dụ: 199.000đ"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Giá khuyến mãi</label>
                                <input
                                    type="text"
                                    value={editPromoPrice}
                                    onChange={(e) => setEditPromoPrice(e.target.value)}
                                    placeholder="Ví dụ: 99.000đ"
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn-cancel" onClick={() => setEditingTemplate(null)}>Hủy</button>
                            <button className="admin-btn-save" onClick={handleSave}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminTemplateManager;
