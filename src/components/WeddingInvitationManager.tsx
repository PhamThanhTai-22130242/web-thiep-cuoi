import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Copy, Eye, Headphones, LinkIcon, MessageSquareText, Pencil, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWeddingTemplateConfig } from '../data/weddingTemplateRegistry';
import {
    MyWeddingCardResponse,
    WeddingCardEvent,
    WeddingCardPerson,
    WeddingCardWishManagementResponse,
} from '../models/wedding-card.model';
import { weddingCardService } from '../services/wedding-card.service';
import './WeddingInvitationManager.css';

type InvitationStatus = 'active' | 'draft';

interface InvitationCard {
    id: number;
    couple: string;
    groomName: string;
    brideName: string;
    template: string;
    date: string;
    views: number;
    updated: string;
    status: InvitationStatus;
    thumbnail: string;
    slug: string;
    previewPath: string;
    editPath: string;
    publicUrl: string;
    updatedAt?: string;
    eventDate?: string;
}

const statusLabels: Record<InvitationStatus, string> = {
    active: 'Đang hoạt động',
    draft: 'Bản nháp',
};

const sortOptions = ['Mới cập nhật', 'Lượt xem cao', 'Ngày cưới gần nhất'];
const fallbackThumbnail = '/img/mockup-thiep-cuoi-online-1.webp';
const zaloContactUrl = 'https://zalo.me/';
const messageContactUrl = 'https://www.facebook.com/messages';
const zaloIconUrl = 'https://tse2.mm.bing.net/th/id/OIP.1q7tV2cPIRzQCa-n-KMlHwHaHa?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3';
const messageIconUrl = 'https://www.logoshape.com/wp-content/uploads/2024/09/meta-messenger-icon-vector_logoshape.png';

function getPersonName(person?: WeddingCardPerson) {
    return (person?.shortName || person?.fullName || '').trim();
}

function getCoupleName(groom?: WeddingCardPerson, bride?: WeddingCardPerson) {
    const groomName = getPersonName(groom) || 'Chú rể';
    const brideName = getPersonName(bride) || 'Cô dâu';
    return `${groomName} & ${brideName}`;
}

function formatCardDate(event?: WeddingCardEvent) {
    const value = event?.eventDate;
    const match = value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

    if (!match) {
        return '-- . -- . ----';
    }

    return `${match.slice(8, 10)} . ${match.slice(5, 7)} . ${match.slice(0, 4)}`;
}

function formatRelativeTime(value?: string) {
    if (!value) {
        return 'vừa xong';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'vừa xong';
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) {
        return 'vừa xong';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
        return `${diffDays} ngày trước`;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
}

function formatViews(value: number) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

function getMediaUrl(card: MyWeddingCardResponse, slotKey: string) {
    return card.media.find((item) => item.slotKey === slotKey)?.imgUrl;
}

function getEventDateValue(value?: string) {
    const match = value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    return match ? new Date(`${match}T00:00:00+07:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function getUpdatedValue(value?: string) {
    const date = value ? new Date(value).getTime() : 0;
    return Number.isNaN(date) ? 0 : date;
}

function mapCard(card: MyWeddingCardResponse): InvitationCard {
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const groomName = getPersonName(groom);
    const brideName = getPersonName(bride);
    const event = card.events[0];
    const config = getWeddingTemplateConfig(card.template.code);
    const thumbnail = card.template.previewImg || getMediaUrl(card, 'images.cover') || fallbackThumbnail;
    const editPath = config?.editorPath
        ? `${config.editorPath}?weddingId=${card.weddingId}`
        : `/EmeraldInvitation/edit?weddingId=${card.weddingId}`;
    const updatedAt = card.updatedAt || card.createdAt;

    return {
        id: card.weddingId,
        couple: getCoupleName(groom, bride),
        groomName,
        brideName,
        template: card.template.name || config?.name || card.template.code,
        date: formatCardDate(event),
        views: card.viewCount || 0,
        updated: formatRelativeTime(updatedAt),
        status: card.status,
        thumbnail,
        slug: card.slug,
        previewPath: `/preview-wedding-card/${card.weddingId}`,
        editPath,
        publicUrl: `/thiep/${card.slug}`,
        updatedAt,
        eventDate: event?.eventDate,
    };
}

function WeddingInvitationManager() {
    const [query, setQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [invitations, setInvitations] = useState<InvitationCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [commentCardId, setCommentCardId] = useState<number | null>(null);
    const [activationCardId, setActivationCardId] = useState<number | null>(null);
    const [comments, setComments] = useState<WeddingCardWishManagementResponse[]>([]);
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [commentMessage, setCommentMessage] = useState('');
    const [updatingWishId, setUpdatingWishId] = useState<number | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    const showToast = (content: string) => {
        setToastMessage(content);
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = window.setTimeout(() => {
            setToastMessage('');
            toastTimerRef.current = null;
        }, 2400);
    };

    useEffect(() => {
        let isMounted = true;

        setIsLoading(true);
        setMessage('');

        weddingCardService.getMyCards()
            .then((cards) => {
                if (isMounted) {
                    setInvitations(cards.map(mapCard));
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setMessage(error instanceof Error ? error.message : 'Không thể tải danh sách thiệp cưới.');
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
    }, []);

    useEffect(() => () => {
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }
    }, []);

    const filteredInvitations = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        const nextInvitations = invitations.filter((invitation) => {
            const normalizedText = `${invitation.groomName} ${invitation.brideName} ${invitation.slug}`.toLowerCase();
            const matchesQuery = !normalizedQuery || normalizedText.includes(normalizedQuery);

            return matchesQuery;
        });

        return [...nextInvitations].sort((left, right) => {
            if (selectedSort === 'Lượt xem cao') {
                return right.views - left.views;
            }

            if (selectedSort === 'Ngày cưới gần nhất') {
                return getEventDateValue(left.eventDate) - getEventDateValue(right.eventDate);
            }

            return getUpdatedValue(right.updatedAt) - getUpdatedValue(left.updatedAt);
        });
    }, [invitations, query, selectedSort]);

    const selectedCommentCard = invitations.find((invitation) => invitation.id === commentCardId) || null;
    const selectedActivationCard = invitations.find((invitation) => invitation.id === activationCardId) || null;

    const copyText = async (text: string) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            const input = document.createElement('textarea');
            input.value = text;
            input.setAttribute('readonly', 'true');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
    };

    const copyPublicUrl = async (publicUrl: string) => {
        const url = new URL(publicUrl, window.location.origin).toString();
        await copyText(url);
        showToast('Đã sao chép đường dẫn thiệp cưới.');
    };

    const openCommentManager = (invitation: InvitationCard) => {
        showToast('Đang mở quản lí bình luận.');
        setCommentCardId(invitation.id);
        setComments([]);
        setCommentMessage('');
        setIsCommentLoading(true);

        weddingCardService.getMyCardWishes(invitation.id)
            .then(setComments)
            .catch((error) => {
                setCommentMessage(error instanceof Error ? error.message : 'Không thể tải danh sách bình luận.');
            })
            .finally(() => setIsCommentLoading(false));
    };

    const openActivationHelp = (invitation: InvitationCard) => {
        setActivationCardId(invitation.id);
    };

    const closeActivationHelp = () => {
        setActivationCardId(null);
    };

    const copyActivationSlug = async (slug: string) => {
        await copyText(slug);
        showToast('Đã sao chép slug thiệp.');
    };

    const closeCommentManager = () => {
        setCommentCardId(null);
        setComments([]);
        setCommentMessage('');
        setUpdatingWishId(null);
    };

    const toggleCommentVisibility = (wish: WeddingCardWishManagementResponse) => {
        const nextApproved = wish.isApproved === false;
        setUpdatingWishId(wish.wishId);
        setCommentMessage('');

        weddingCardService.setWishVisibility(commentCardId!, wish.wishId, nextApproved)
            .then((updatedWish) => {
                setComments((current) => current.map((item) => (
                    item.wishId === updatedWish.wishId ? updatedWish : item
                )));
            })
            .catch((error) => {
                setCommentMessage(error instanceof Error ? error.message : 'Không thể cập nhật bình luận.');
            })
            .finally(() => setUpdatingWishId(null));
    };

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
                        placeholder="Tìm cô dâu, chú rể hoặc slug..."
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
                {isLoading && <p className="wim-message">Đang tải danh sách thiệp cưới...</p>}
                {!isLoading && message && <p className="wim-message is-error">{message}</p>}
                {!isLoading && !message && filteredInvitations.length === 0 && (
                    <p className="wim-message">Chưa có thiệp cưới nào phù hợp.</p>
                )}
                {filteredInvitations.map((invitation) => (
                    <article className="wim-card" key={invitation.id}>
                        <div className="wim-card-preview">
                            <img src={invitation.thumbnail} alt={`Thiệp cưới ${invitation.couple}`} />
                        </div>

                        <div className="wim-card-body">
                            <div className="wim-card-title">
                                <h2>{invitation.couple}</h2>
                                <p>{invitation.template}</p>
                                <span className="wim-card-slug">/{invitation.slug}</span>
                            </div>

                            <div className="wim-card-meta">
                                <span>{invitation.date}</span>
                                <strong className={`wim-status is-${invitation.status}`}>{statusLabels[invitation.status]}</strong>
                                {invitation.views > 0 && <span>{formatViews(invitation.views)} lượt xem</span>}
                                <span>Cập nhật {invitation.updated}</span>
                            </div>

                            {invitation.status === 'draft' && (
                                <div className="wim-unlock-card">
                                    <div>
                                        <Headphones size={17} strokeWidth={2.4} />
                                        <span>Kích hoạt mẫu này</span>
                                    </div>
                                    <button type="button" onClick={() => openActivationHelp(invitation)}>
                                        Nhắn với shop nha
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="wim-card-actions">
                            <Link to={invitation.editPath}>
                                <Pencil size={15} strokeWidth={2.3} />
                                <span>Chỉnh sửa</span>
                            </Link>
                            <Link to={invitation.previewPath}>
                                <Eye size={15} strokeWidth={2.3} />
                                <span>Xem trước</span>
                            </Link>

                            <button type="button" onClick={() => copyPublicUrl(invitation.publicUrl)}>
                                <LinkIcon size={15} strokeWidth={2.3} />
                                <span>Chia sẻ đường dẫn</span>
                            </button>
                            <button type="button" onClick={() => openCommentManager(invitation)}>
                                <MessageSquareText size={15} strokeWidth={2.3} />
                                <span>Quản lí bình luận</span>
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {selectedCommentCard && (
                <div className="wim-comment-modal" role="dialog" aria-modal="true" aria-labelledby="wim-comment-title">
                    <div className="wim-comment-panel">
                        <div className="wim-comment-head">
                            <div>
                                <p>Quản lí bình luận</p>
                                <h2 id="wim-comment-title">{selectedCommentCard.couple}</h2>
                                <span>/{selectedCommentCard.slug}</span>
                            </div>
                            <button type="button" aria-label="Đóng quản lí bình luận" onClick={closeCommentManager}>
                                <X size={20} strokeWidth={2.4} />
                            </button>
                        </div>

                        {isCommentLoading && <p className="wim-comment-state">Đang tải bình luận...</p>}
                        {!isCommentLoading && commentMessage && <p className="wim-comment-state is-error">{commentMessage}</p>}
                        {!isCommentLoading && !commentMessage && comments.length === 0 && (
                            <p className="wim-comment-state">Thiệp này chưa có bình luận nào.</p>
                        )}
                        {!isCommentLoading && comments.length > 0 && (
                            <div className="wim-comment-list">
                                {comments.map((wish) => {
                                    const isVisible = wish.isApproved !== false;
                                    return (
                                        <article className={`wim-comment-item ${isVisible ? '' : 'is-hidden'}`} key={wish.wishId}>
                                            <div>
                                                <div className="wim-comment-meta">
                                                    <strong>{wish.guestName || 'Khách mời'}</strong>
                                                    <span>{isVisible ? 'Đang hiển thị trên thiệp' : 'Đang ẩn khỏi thiệp'}</span>
                                                </div>
                                                <p>{wish.message}</p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={updatingWishId === wish.wishId}
                                                onClick={() => toggleCommentVisibility(wish)}
                                            >
                                                {isVisible ? 'Ẩn' : 'Hiện'}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedActivationCard && (
                <div className="wim-activation-modal" role="dialog" aria-modal="true" aria-labelledby="wim-activation-title">
                    <div className="wim-activation-panel">
                        <button
                            className="wim-activation-close"
                            type="button"
                            aria-label="Đóng hướng dẫn kích hoạt"
                            onClick={closeActivationHelp}
                        >
                            <X size={20} strokeWidth={2.4} />
                        </button>

                        <h2 id="wim-activation-title">NHẮN CHO TIỂU NHỊ ĐỂ KÍCH HOẠT</h2>

                        <div className="wim-activation-copy">
                            <span>Slug thiệp</span>
                            <strong>/{selectedActivationCard.slug}</strong>
                            <button type="button" aria-label="Sao chép slug" onClick={() => copyActivationSlug(selectedActivationCard.slug)}>
                                <Copy size={16} strokeWidth={2.4} />
                            </button>
                        </div>

                        <div className="wim-activation-note">
                            <p>Khách Quan ơi, thiệp hỷ đã được chuẩn bị gần xong!</p>
                            <p>Hiện tại cổng thanh toán online của Tiểu Nhị vẫn chưa khai mở, nên Khách Quan vui lòng nhắn Zalo hoặc Messenger cho Tiểu Nhị để hoàn tất lễ phí và khai mở thiệp hỷ nha.</p>
                            <p>Khi nhắn, nhớ gửi kèm slug thiệp đang hiển thị trên màn hình này nha. Không có slug, Tiểu Nhị phải lật sổ nhân duyên tìm mỏi mắt luôn.</p>
                        </div>

                        <div className="wim-activation-actions">
                            <a href={zaloContactUrl} target="_blank" rel="noreferrer">
                                <img src={zaloIconUrl} alt="" />
                                Nhắn qua Zalo
                            </a>
                            <a href={messageContactUrl} target="_blank" rel="noreferrer">
                                <img src={messageIconUrl} alt="" />
                                Nhắn qua Message
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="wim-toast" role="status" aria-live="polite">
                    {toastMessage}
                </div>
            )}
        </main>
    );
}

export default WeddingInvitationManager;
