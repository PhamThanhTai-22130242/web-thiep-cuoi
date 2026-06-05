import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wish } from '../data/invitationTemplates';
import { WeddingCardWishManagementResponse } from '../models/wedding-card.model';
import { httpRequest } from '../services/http.service';
import { weddingCardService } from '../services/wedding-card.service';
import EmeraldInvitation from './EmeraldInvitationPage';
import { mapPublicCardToTemplate, PublicWeddingCardResponse } from './PublicWeddingCardPage';
import './PublicCommentManagerPage.css';

function normalizeSlug(value: string) {
    return value.trim().replace(/^\/?thiep\//, '').replace(/^\/+|\/+$/g, '');
}

function getCoupleName(card: PublicWeddingCardResponse | null) {
    const groom = card?.people.find((person) => person.role === 'groom');
    const bride = card?.people.find((person) => person.role === 'bride');
    const groomName = (groom?.shortName || groom?.fullName || 'Chú rể').trim();
    const brideName = (bride?.shortName || bride?.fullName || 'Cô dâu').trim();

    return `${groomName} & ${brideName}`;
}

function PublicCommentManagerPage() {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const [slugInput, setSlugInput] = useState(slug || '');
    const [card, setCard] = useState<PublicWeddingCardResponse | null>(null);
    const [comments, setComments] = useState<WeddingCardWishManagementResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [updatingWishId, setUpdatingWishId] = useState<number | null>(null);

    useEffect(() => {
        setSlugInput(slug || '');
    }, [slug]);

    useEffect(() => {
        if (!slug) {
            setCard(null);
            setComments([]);
            setMessage('');
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setMessage('');

        Promise.all([
            httpRequest<PublicWeddingCardResponse>(`/api/wedding-cards/${slug}`),
            weddingCardService.getPublicCardWishesForManagement(slug),
        ])
            .then(([cardResponse, wishResponse]) => {
                if (!isMounted) {
                    return;
                }
                setCard(cardResponse.data || null);
                setComments(wishResponse);
            })
            .catch((error) => {
                if (isMounted) {
                    setCard(null);
                    setComments([]);
                    setMessage(error instanceof Error ? error.message : 'Không thể tải dữ liệu thiệp.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const template = useMemo(() => (card ? mapPublicCardToTemplate(card) : null), [card]);
    const visibleWishes = useMemo<Wish[]>(
        () => comments
            .filter((wish) => wish.isApproved !== false)
            .map((wish) => ({
                name: wish.guestName,
                message: wish.message,
            })),
        [comments],
    );

    const submitSlug = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextSlug = normalizeSlug(slugInput);
        if (!nextSlug) {
            setMessage('Vui lòng nhập URL thiệp cần quản lí.');
            return;
        }
        navigate(`/quan-li-binh-luan/${nextSlug}`);
    };

    const toggleVisibility = (wish: WeddingCardWishManagementResponse) => {
        if (!slug) {
            return;
        }

        const nextApproved = wish.isApproved === false;
        setUpdatingWishId(wish.wishId);
        setMessage('');

        weddingCardService.setPublicWishVisibility(slug, wish.wishId, nextApproved)
            .then((updatedWish) => {
                setComments((current) => current.map((item) => (
                    item.wishId === updatedWish.wishId ? updatedWish : item
                )));
            })
            .catch((error) => {
                setMessage(error instanceof Error ? error.message : 'Không thể cập nhật bình luận.');
            })
            .finally(() => setUpdatingWishId(null));
    };

    return (
        <main className="pcm-page">
            <section className="pcm-toolbar">
                <div>
                    <p>Quản lí bình luận</p>
                    <h1>{card ? getCoupleName(card) : 'Chọn thiệp cần quản lí'}</h1>
                </div>
                <form onSubmit={submitSlug}>
                    <label>
                        <span>URL thiệp</span>
                        <input
                            value={slugInput}
                            onChange={(event) => setSlugInput(event.target.value)}
                            placeholder="vd: van-bach-khanh-ly"
                        />
                    </label>
                    <button type="submit">
                        <Search size={18} strokeWidth={2.4} />
                        <span>Tải thiệp</span>
                    </button>
                </form>
            </section>

            {message && <p className="pcm-message is-error">{message}</p>}

            <section className="pcm-workspace">
                <div className="pcm-preview-shell">
                    <div className="pcm-panel-head">
                        <span>Thiệp cưới</span>
                        <strong>{card?.template.name || 'Bản xem thiệp'}</strong>
                    </div>
                    <div className="pcm-preview">
                        {isLoading && <p className="pcm-empty">Đang tải thiệp...</p>}
                        {!isLoading && !template && <p className="pcm-empty">Nhập URL thiệp để xem bản thiệp ở đây.</p>}
                        {!isLoading && template && (
                            <EmeraldInvitation
                                template={template}
                                initialWishes={visibleWishes}
                                wishEndpoint={`/api/wedding-cards/${card?.slug}/wishes`}
                                wishTopic={`/topic/wedding-cards/${card?.slug}/wishes`}
                            />
                        )}
                    </div>
                </div>

                <aside className="pcm-comments">
                    <div className="pcm-panel-head">
                        <span>Bình luận</span>
                        <strong>{comments.length} lời chúc</strong>
                    </div>

                    {isLoading && <p className="pcm-empty">Đang tải bình luận...</p>}
                    {!isLoading && slug && comments.length === 0 && <p className="pcm-empty">Thiệp này chưa có bình luận.</p>}
                    {!isLoading && !slug && <p className="pcm-empty">Nhập URL thiệp để quản lí bình luận.</p>}

                    <div className="pcm-comment-list">
                        {comments.map((wish) => {
                            const isVisible = wish.isApproved !== false;
                            return (
                                <article className={`pcm-comment ${isVisible ? '' : 'is-hidden'}`} key={wish.wishId}>
                                    <div className="pcm-comment-top">
                                        <strong>{wish.guestName || 'Khách mời'}</strong>
                                        <span>{isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                                    </div>
                                    <p>{wish.message}</p>
                                    <button
                                        type="button"
                                        disabled={updatingWishId === wish.wishId}
                                        onClick={() => toggleVisibility(wish)}
                                    >
                                        {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                                        <span>{isVisible ? 'Ẩn bình luận' : 'Hiện bình luận'}</span>
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default PublicCommentManagerPage;
