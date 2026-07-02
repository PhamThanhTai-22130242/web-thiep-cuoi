import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { WeddingTemplateCode, weddingTemplateRegistry } from '../data/weddingTemplateRegistry';
import { weddingTemplateService, DbTemplate, packageKeys } from '../services/wedding-template.service';
import './TemplateSelectorPage.css';

type PackageKey = 'co-ban' | 'chuyen-nghiep' | 'thoi-thuong';

type TemplateSample = {
    templateCode: WeddingTemplateCode;
};

type TemplatePackage = {
    label: string;
    price: string;
    originalPrice?: string;
    title: string;
    description: string;
    accent: string;
    samples: TemplateSample[];
};

const packageTabs: Array<{ key: PackageKey; label: string }> = [
    { key: 'co-ban', label: 'Cơ bản' },
    { key: 'chuyen-nghiep', label: 'Chuyên nghiệp' },
    { key: 'thoi-thuong', label: 'Thời thượng' },
];

const templatePackages: Record<PackageKey, TemplatePackage> = {
    'co-ban': {
        label: 'Gói Cơ Bản',
        price: '99.000đ',
        originalPrice: '199.000đ',
        title: 'Chọn mẫu thiệp cưới phù hợp với câu chuyện của bạn',
        description: 'Các mẫu trong gói này tập trung vào bố cục sáng, dễ đọc, tải nhanh và đủ đầy những phần quan trọng cho một thiệp cưới online.',
        accent: '#b96a2c',
        samples: [
            {
                templateCode: 'EmeraldInvitation',
            },
            {
                templateCode: 'RubyBasicInvitation',
            },
        ],
    },
    'chuyen-nghiep': {
        label: 'Gói Chuyên Nghiệp',
        price: '199.000đ',
        originalPrice: '299.000đ',
        title: 'Mẫu thiệp chuyên nghiệp đa dạng phong cách',
        description: 'Các mẫu thiệp chuyên nghiệp nổi bật với đầy đủ tính năng hiện đại, sổ lưu bút chúc mừng, hộp quà mừng cưới và cổng xác nhận tham dự.',
        accent: '#1f756d',
        samples: [
            {
                templateCode: 'CineLoveTraditionalInvitation',
            },
            {
                templateCode: 'ElegantInvitation',
            },
            {
                templateCode: 'PinkWeddingInvitation',
            },
        ],
    },
    'thoi-thuong': {
        label: 'Gói Thời Thượng',
        price: '299.000đ',
        originalPrice: '399.000đ',
        title: 'Không gian cho những mẫu thiệp cao cấp',
        description: 'Gói Thời Thượng sẽ dành cho các mẫu có chuyển động đặc biệt, phối cảnh ảnh lớn và các chi tiết thiết kế riêng theo cặp đôi.',
        accent: '#7a3fb2',
        samples: [],
    },
};

function TemplateSelectorPage() {
    const { packageKey } = useParams<{ packageKey: string }>();
    const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const legacyPackageKeys: Record<string, PackageKey> = {
        '99k': 'co-ban',
        '199k': 'chuyen-nghiep',
        '299k': 'thoi-thuong',
    };
    const normalizedPackageKey = packageKey ? legacyPackageKeys[packageKey] || packageKey : 'co-ban';
    const currentPackageKey = (normalizedPackageKey in templatePackages ? normalizedPackageKey : 'co-ban') as PackageKey;
    const selectedPackage = templatePackages[currentPackageKey];
    const frameRefs = useRef<Array<HTMLIFrameElement | null>>([]);
    const animationRefs = useRef<number[]>([]);

    useEffect(() => {
        let isMounted = true;
        async function fetchTemplates() {
            try {
                const data = await weddingTemplateService.getPublicTemplates();
                if (isMounted) {
                    setDbTemplates(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load templates", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchTemplates();
        return () => {
            isMounted = false;
        };
    }, []);

    const currentPackageTemplates = dbTemplates.filter(
        (t) => packageKeys[t.category] === currentPackageKey
    );

    useEffect(() => {
        animationRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
        animationRefs.current = [];
        frameRefs.current = frameRefs.current.slice(0, currentPackageTemplates.length);

        frameRefs.current.forEach((frame, index) => {
            if (!frame) {
                return;
            }

            const startAutoScroll = () => {
                try {
                    const frameWindow = frame.contentWindow;
                    const frameDocument = frameWindow?.document;

                    if (!frameWindow || !frameDocument) {
                        return;
                    }

                    const root = frameDocument.documentElement;
                    const body = frameDocument.body;

                    root.style.overflow = 'hidden';
                    body.style.overflow = 'hidden';
                    body.style.pointerEvents = 'none';

                    const maxScroll = Math.max(root.scrollHeight, body.scrollHeight) - frameWindow.innerHeight;
                    if (maxScroll <= 0) {
                        frameWindow.scrollTo(0, 0);
                        return;
                    }

                    const duration = 26000;
                    const delayOffset = index * 1500;

                    const animate = (now: number) => {
                        const elapsed = (now + delayOffset) % duration;
                        const progress = elapsed / duration;
                        const eased = 0.5 - Math.cos(progress * Math.PI * 2) / 2;

                        frameWindow.scrollTo(0, maxScroll * eased);
                        animationRefs.current[index] = window.requestAnimationFrame(animate);
                    };

                    frameWindow.scrollTo(0, 0);
                    animationRefs.current[index] = window.requestAnimationFrame(animate);
                } catch {
                    // Preview still works as a static iframe if the browser blocks frame access.
                }
            };

            if (frame.contentDocument?.readyState === 'complete') {
                startAutoScroll();
                return;
            }

            frame.onload = startAutoScroll;
        });

        return () => {
            animationRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
            animationRefs.current = [];
        };
    }, [selectedPackage]);

    return (
        <main className="selector-page" style={{ '--selector-accent': selectedPackage.accent } as React.CSSProperties}>
            <nav className="selector-tabs" aria-label="Lọc mẫu thiệp theo gói">
                {packageTabs.map((tab) => (
                    <Link
                        key={tab.key}
                        className={tab.key === currentPackageKey ? 'is-active' : ''}
                        to={`/chon-mau/${tab.key}`}
                    >
                        <span>{tab.label}</span>
                    </Link>
                ))}
            </nav>

            {loading ? (
                <section className="selector-grid" aria-label="Đang tải danh sách mẫu thiệp cưới">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="selector-card selector-skeleton-card">
                            <div className="selector-preview-wrap selector-skeleton-preview-wrap">
                                <div className="selector-skeleton-image selector-skeleton" />
                            </div>
                            <div className="selector-card-copy">
                                <div>
                                    <div className="selector-skeleton-price selector-skeleton" />
                                    <div className="selector-skeleton-title selector-skeleton" />
                                    <div className="selector-skeleton-desc selector-skeleton" />
                                    <div className="selector-skeleton-desc selector-skeleton" style={{ width: '80%' }} />
                                </div>
                                <div className="selector-actions">
                                    <div className="selector-skeleton-button selector-skeleton-btn-primary selector-skeleton" />
                                    <div className="selector-skeleton-button selector-skeleton-btn-secondary selector-skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            ) : currentPackageTemplates.length > 0 ? (
                <section className="selector-grid" aria-label="Danh sách mẫu thiệp cưới">
                    {currentPackageTemplates.map((dbTpl, index) => {
                        const templateConfig = weddingTemplateRegistry[dbTpl.code];
                        if (!templateConfig) return null;
                        const price = dbTpl.price;
                        const promoPrice = dbTpl.promoPrice;
                        const name = dbTpl.name;
                        const description = dbTpl.description;

                        return (
                        <article key={dbTpl.code} className="selector-card">
                            <div
                                className={`selector-preview-wrap${templateConfig.thumbnailPath ? ' has-thumbnail' : ''}`}
                                style={templateConfig.previewBgColor ? { background: templateConfig.previewBgColor } : undefined}
                            >
                                <div className="selector-preview-glow" />
                                {templateConfig.thumbnailPath ? (
                                    <img
                                        className="selector-template-image"
                                        src={templateConfig.thumbnailPath}
                                        alt={name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="selector-phone" aria-hidden="true">
                                        <iframe
                                            ref={(node) => {
                                                frameRefs.current[index] = node;
                                            }}
                                            src={templateConfig.previewPath}
                                            title={`Preview ${name}`}
                                            loading="lazy"
                                            scrolling="no"
                                            tabIndex={-1}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="selector-card-copy">
                                <div>
                                    <div className="selector-card-price">
                                        {price && <del>{price}</del>}
                                        <strong>{promoPrice}</strong>
                                    </div>
                                    <h2>{name}</h2>
                                    <p>{description}</p>
                                </div>

                                <div className="selector-actions">
                                    <Link className="selector-primary-action" to={templateConfig.previewPath}>
                                        <Eye size={18} />
                                        Xem mẫu này
                                    </Link>
                                    {templateConfig.editorComponent && (
                                        <Link className="selector-secondary-action" to={templateConfig.editorPath}>
                                            Tùy chỉnh <ArrowRight size={17} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </article>
                    )})}
                </section>
            ) : (
                <section className="selector-empty">
                    <h2>Mẫu của {selectedPackage.label} đang được cập nhật</h2>
                    <p>Sắp cập nhập</p>
                    <Link to="/chon-mau/chuyen-nghiep">Xem mẫu đang có <ArrowRight size={17} /></Link>
                </section>
            )}
        </main>
    );
}

export default TemplateSelectorPage;
