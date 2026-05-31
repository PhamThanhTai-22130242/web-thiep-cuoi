import { useEffect, useRef } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { WeddingTemplateCode, weddingTemplateRegistry } from '../data/weddingTemplateRegistry';
import './TemplateSelectorPage.css';

type PackageKey = 'co-ban' | 'chuyen-nghiep' | 'thoi-thuong';

type TemplateSample = {
    templateCode: WeddingTemplateCode;
    name: string;
    note: string;
    image: string;
};

type TemplatePackage = {
    label: string;
    price: string;
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
        price: '99.000 đ',
        title: 'Chọn mẫu thiệp cưới phù hợp với câu chuyện của bạn',
        description: 'Các mẫu trong gói này tập trung vào bố cục sáng, dễ đọc, tải nhanh và đủ đầy những phần quan trọng cho một thiệp cưới online.',
        accent: '#b96a2c',
        samples: [
            {
                templateCode: 'EmeraldInvitation',
                name: 'Emerald Classic',
                note: 'Tông xanh sang, ảnh nổi bật, hợp với phong cách nhẹ nhàng và tinh tế.',
                image: '/img/mockup-thiep-cuoi-online-1.webp',
            },
            {
                templateCode: 'RubyBasicInvitation',
                name: 'Song Long Đỏ',
                note: 'Sắc đỏ truyền thống, bố cục rực rỡ và đậm chất ngày cưới Việt.',
                image: '/img/double-dragon.webp',
            },
        ],
    },
    'chuyen-nghiep': {
        label: 'Gói Chuyên Nghiệp',
        price: '199.000 đ',
        title: 'Bộ mẫu nâng cấp đang được hoàn thiện',
        description: 'Khu vực này đã sẵn sàng để gắn thêm các mẫu nhiều hiệu ứng, nhiều section và trải nghiệm cá nhân hóa hơn.',
        accent: '#1f756d',
        samples: [
            {
                templateCode: 'CineLoveTraditionalInvitation',
                name: 'Hỷ Sự Truyền Thống',
                note: 'Sắc đỏ trang trọng, bố cục điện ảnh và chi tiết song hỷ dành cho lễ cưới truyền thống.',
                image: '/img/double-dragon.webp',
            },
        ],
    },
    'thoi-thuong': {
        label: 'Gói Thời Thượng',
        price: '299.000 đ',
        title: 'Không gian cho những mẫu thiệp cao cấp',
        description: 'Gói Thời Thượng sẽ dành cho các mẫu có chuyển động đặc biệt, phối cảnh ảnh lớn và các chi tiết thiết kế riêng theo cặp đôi.',
        accent: '#7a3fb2',
        samples: [],
    },
};

function TemplateSelectorPage() {
    const { packageKey } = useParams<{ packageKey: string }>();
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
        animationRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
        animationRefs.current = [];
        frameRefs.current = frameRefs.current.slice(0, selectedPackage.samples.length);

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

            {selectedPackage.samples.length > 0 ? (
                <section className="selector-grid" aria-label="Danh sách mẫu thiệp cưới">
                    {selectedPackage.samples.map((sample, index) => {
                        const templateConfig = weddingTemplateRegistry[sample.templateCode];

                        return (
                        <article key={sample.templateCode} className="selector-card">
                            <div className="selector-preview-wrap">
                                <div className="selector-preview-glow" />
                                <div className="selector-phone" aria-hidden="true">
                                    <iframe
                                        ref={(node) => {
                                            frameRefs.current[index] = node;
                                        }}
                                        src={templateConfig.previewPath}
                                        title={`Preview ${sample.name}`}
                                        loading="lazy"
                                        scrolling="no"
                                        tabIndex={-1}
                                    />
                                </div>
                            </div>

                            <div className="selector-card-copy">
                                <div>
                                    <h2>{sample.name}</h2>
                                    <p>{sample.note}</p>
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
                    <Link to="/chon-mau/co-ban">Xem mẫu đang có <ArrowRight size={17} /></Link>
                </section>
            )}
        </main>
    );
}

export default TemplateSelectorPage;
