import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import './TemplateSelectorPage.css';

type PackageKey = '99k' | '199k' | '299k';

const templatePackages: Record<
    PackageKey,
    {
        samples: Array<{
            name: string;
            path: string;
            note: string;
        }>;
    }
> = {
    '99k': {
        samples: [
            {
                name: 'Emerald Classic',
                path: '/thiep-moi',
                note: 'Tông xanh sang, layout mềm và lãng mạn.',
            },
            {
                name: 'Song Long Đỏ',
                path: '/thiep-moi-99k',
                note: 'Phong cách đỏ truyền thống, nổi bật và đậm chất cưới hỏi.',
            },
        ],
    },
    '199k': {
        samples: [],
    },
    '299k': {
        samples: [],
    },
};

function TemplateSelectorPage() {
    const { packageKey } = useParams<{ packageKey: PackageKey }>();
    const selectedPackage = templatePackages[(packageKey || '99k') as PackageKey] || templatePackages['99k'];
    const frameRefs = useRef<Array<HTMLIFrameElement | null>>([]);
    const animationRefs = useRef<number[]>([]);

    useEffect(() => {
        animationRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
        animationRefs.current = [];

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
                    root.style.setProperty('scrollbar-width', 'none');
                    root.style.setProperty('-ms-overflow-style', 'none');
                    body.style.overflow = 'hidden';
                    body.style.pointerEvents = 'none';
                    body.style.setProperty('scrollbar-width', 'none');
                    body.style.setProperty('-ms-overflow-style', 'none');

                    const maxScroll = Math.max(root.scrollHeight, body.scrollHeight) - frameWindow.innerHeight;
                    if (maxScroll <= 0) {
                        frameWindow.scrollTo(0, 0);
                        return;
                    }

                    const duration = 24000;
                    const delayOffset = index * 1200;

                    const animate = (now: number) => {
                        const elapsed = (now + delayOffset) % duration;
                        const progress = elapsed / duration;
                        const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
                        const nextScroll = maxScroll * eased;
                        frameWindow.scrollTo(0, nextScroll);
                        animationRefs.current[index] = window.requestAnimationFrame(animate);
                    };

                    frameWindow.scrollTo(0, 0);
                    animationRefs.current[index] = window.requestAnimationFrame(animate);
                } catch {
                    // Ignore iframe access issues and keep static preview.
                }
            };

            if (frame.contentDocument?.readyState === 'complete') {
                startAutoScroll();
                return;
            }

            frame.onload = () => {
                startAutoScroll();
            };
        });

        return () => {
            animationRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
            animationRefs.current = [];
        };
    }, [selectedPackage]);

    return (
        <main className="selector-page">
            <div className="selector-shell">
                <section className="selector-grid">
                    {selectedPackage.samples.length > 0 ? (
                        selectedPackage.samples.map((sample, index) => (
                            <article key={sample.path} className="selector-card">
                                <div className="selector-card-preview" aria-hidden="true">
                                    <div className="selector-card-preview-shell">
                                        <iframe
                                            ref={(node) => {
                                                frameRefs.current[index] = node;
                                            }}
                                            src={sample.path}
                                            title={`Preview ${sample.name}`}
                                            loading="lazy"
                                            scrolling="no"
                                            tabIndex={-1}
                                        />
                                    </div>
                                </div>
                                <div className="selector-card-copy">
                                    <h2>{sample.name}</h2>
                                    <p>{sample.note}</p>
                                    <Link to={sample.path}>Xem mẫu này</Link>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="selector-empty">
                            <h2>Đang cập nhật mẫu</h2>
                            <p>Hiện tại gói này chưa có mẫu hiển thị. Khi bạn thêm mẫu mới, trang này sẽ tự dùng được luôn.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default TemplateSelectorPage;
