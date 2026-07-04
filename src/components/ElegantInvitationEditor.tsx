import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
    CalendarDays,
    Check,
    Eye,
    Gift,
    Image,
    Link as LinkIcon,
    Loader2,
    MapPin,
    Plus,
    Upload,
    UserRound,
    UsersRound,
} from 'lucide-react';
import ElegantInvitation, {
    ElegantInvitationData,
    defaultElegantInvitationData,
    emptyElegantInvitationData,
    EditableElegantImageTarget,
} from './ElegantInvitation';
import { saveElegantPreview } from '../data/invitationTemplates';
import { MyWeddingCardResponse } from '../models/wedding-card.model';
import { authTokenService } from '../services/auth-token.service';
import { weddingCardService } from '../services/wedding-card.service';
import { previewSkeletonDocument } from '../utils/preview-skeleton';
import './ElegantInvitationEditor.css';

type ImageTarget = EditableElegantImageTarget;

function cloneData(data: ElegantInvitationData): ElegantInvitationData {
    return {
        ...data,
        images: {
            ...data.images,
            gallery: [...data.images.gallery],
        },
    };
}

function isLocalUrl(url: string) {
    return url.startsWith('blob:') || url.startsWith('data:');
}

function readFileAsDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            })
            .catch(reject);
    });
}

async function resolveLocalImages(data: ElegantInvitationData): Promise<ElegantInvitationData> {
    const next = cloneData(data);
    const imageKeys = ['cover', 'hero', 'portraitOne', 'portraitTwo', 'groomQr', 'brideQr'] as const;

    await Promise.all(
        imageKeys.map(async (key) => {
            const url = next.images[key];
            if (url && isLocalUrl(url)) {
                next.images[key] = await readFileAsDataUrl(url);
            }
        }),
    );

    next.images.gallery = await Promise.all(
        next.images.gallery.map(async (url) => {
            if (url && isLocalUrl(url)) {
                return readFileAsDataUrl(url);
            }
            return url;
        }),
    );

    return next;
}

function toSaveRequest(data: ElegantInvitationData, status: 'draft' | 'active') {
    const galleryMedia = data.images.gallery
        .map((imgUrl, index) => ({ slotKey: `images.gallery.${index}`, imgUrl, number: 100 + index }))
        .filter((item) => item.imgUrl && !item.imgUrl.startsWith('blob:') && !item.imgUrl.startsWith('data:'));

    const singleMedia = [
        { slotKey: 'images.cover', imgUrl: data.images.cover, number: 1 },
        { slotKey: 'images.hero', imgUrl: data.images.hero, number: 2 },
        { slotKey: 'images.portraitOne', imgUrl: data.images.portraitOne, number: 3 },
        { slotKey: 'images.portraitTwo', imgUrl: data.images.portraitTwo, number: 4 },
        { slotKey: 'images.groomQr', imgUrl: data.images.groomQr, number: 10 },
        { slotKey: 'images.brideQr', imgUrl: data.images.brideQr, number: 11 },
    ].filter((item) => item.imgUrl && !item.imgUrl.startsWith('blob:') && !item.imgUrl.startsWith('data:'));

    return {
        templateCode: 'ElegantInvitation' as const,
        slug: data.slug || '',
        status,
        design: { primaryColor: '#8d5f25', dropEffect: 'none' },
        couple: {
            groom: data.groomName,
            bride: data.brideName,
            groomRole: data.groomFamilyLabel,
            brideRole: data.brideFamilyLabel,
            groomFather: data.groomFather,
            groomMother: data.groomMother,
            brideFather: data.brideFather,
            brideMother: data.brideMother,
        },
        event: {
            inviteText: data.inviteText,
            eventDate: data.eventDate,
            eventTime: data.eventTime.length === 5 ? `${data.eventTime}:00` : data.eventTime,
            venueName: data.venueName,
            address: data.address,
            linkMap: data.mapUrl,
        },
        media: [...singleMedia, ...galleryMedia],
    };
}

function fromApiCard(card: MyWeddingCardResponse, fallback: ElegantInvitationData): ElegantInvitationData {
    const groom = card.people.find((p) => p.role === 'groom');
    const bride = card.people.find((p) => p.role === 'bride');
    const event = card.events[0];
    const mediaBySlot = new Map(card.media.map((m) => [m.slotKey, m.imgUrl]));
    const gallery = card.media
        .filter((m) => m.slotKey?.startsWith('images.gallery.'))
        .sort((a, b) => (a.number || 0) - (b.number || 0))
        .map((m) => m.imgUrl)
        .filter(Boolean);

    const groomQr = mediaBySlot.get('images.groomQr') || '';
    const brideQr = mediaBySlot.get('images.brideQr') || '';

    return {
        ...fallback,
        slug: card.slug || '',
        groomName: groom?.shortName || groom?.fullName || fallback.groomName,
        brideName: bride?.shortName || bride?.fullName || fallback.brideName,
        groomIntroName: groom?.shortName || groom?.fullName || fallback.groomIntroName,
        brideIntroName: bride?.shortName || bride?.fullName || fallback.brideIntroName,
        groomFamilyLabel: groom?.familyLable || fallback.groomFamilyLabel,
        brideFamilyLabel: bride?.familyLable || fallback.brideFamilyLabel,
        groomFather: groom?.fatherName || fallback.groomFather,
        groomMother: groom?.motherName || fallback.groomMother,
        brideFather: bride?.fatherName || fallback.brideFather,
        brideMother: bride?.motherName || fallback.brideMother,
        inviteText: event?.inviteText || fallback.inviteText,
        eventDate: event?.eventDate || fallback.eventDate,
        eventTime: (event?.eventTime || fallback.eventTime).slice(0, 5),
        venueName: event?.venueName || fallback.venueName,
        address: event?.address || fallback.address,
        mapUrl: event?.linkMap || fallback.mapUrl,
        showGroomGift: Boolean(groomQr),
        showBrideGift: Boolean(brideQr),
        showGiftSection: Boolean(groomQr || brideQr),
        images: {
            cover: mediaBySlot.get('images.cover') || fallback.images.cover,
            hero: mediaBySlot.get('images.hero') || fallback.images.hero,
            portraitOne: mediaBySlot.get('images.portraitOne') || fallback.images.portraitOne,
            portraitTwo: mediaBySlot.get('images.portraitTwo') || fallback.images.portraitTwo,
            groomQr: groomQr,
            brideQr: brideQr,
            gallery: gallery.length ? [...gallery, ...Array(Math.max(0, 8 - gallery.length)).fill('')] : fallback.images.gallery,
        },
    };
}

async function uploadLocalImages(data: ElegantInvitationData, onProgress: (msg: string) => void): Promise<ElegantInvitationData> {
    const next = cloneData(data);
    const singleKeys = ['cover', 'hero', 'portraitOne', 'portraitTwo', 'groomQr', 'brideQr'] as const;
    const allEntries: Array<{ key: string; url: string; isGallery: boolean; index?: number }> = [
        ...singleKeys
            .filter((k) => next.images[k]?.startsWith('blob:'))
            .map((k) => ({ key: k, url: next.images[k], isGallery: false })),
        ...next.images.gallery
            .map((url, i) => ({ key: String(i), url, isGallery: true, index: i }))
            .filter((entry) => entry.url?.startsWith('blob:')),
    ];

    if (allEntries.length === 0) return next;
    onProgress('Đang lưu...');

    const uploaded = await Promise.all(
        allEntries.map(async (entry) => ({
            ...entry,
            uploadedUrl: await weddingCardService.uploadImage(await fetchBlob(entry.url)),
        })),
    );

    uploaded.forEach(({ key, isGallery, index, uploadedUrl }) => {
        if (isGallery && index !== undefined) {
            next.images.gallery[index] = uploadedUrl;
        } else {
            (next.images as unknown as Record<string, string>)[key] = uploadedUrl;
        }
    });

    return next;
}

async function fetchBlob(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'upload.jpg', { type: blob.type || 'image/jpeg' });
}

function formatDateInput(dateValue: string) {
    const datePart = dateValue?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (datePart) {
        return datePart;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateValue: string) {
    const normalizedDate = formatDateInput(dateValue);

    if (!normalizedDate) {
        return '';
    }

    return `${normalizedDate.slice(8, 10)}/${normalizedDate.slice(5, 7)}/${normalizedDate.slice(0, 4)}`;
}

function parseDateDisplay(value: string) {
    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!match) {
        return '';
    }

    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    const date = new Date(`${year}-${month}-${day}T00:00:00+07:00`);

    if (Number.isNaN(date.getTime()) || date.getDate() !== Number(day) || date.getMonth() + 1 !== Number(month) || date.getFullYear() !== Number(year)) {
        return '';
    }

    return `${year}-${month}-${day}`;
}

function ElegantInvitationEditor() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [draft, setDraft] = useState<ElegantInvitationData>(() => cloneData(emptyElegantInvitationData));
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [validationAlert, setValidationAlert] = useState<{ title: string; message: string; missingImages?: Array<'cover' | 'hero' | 'portraitOne' | 'portraitTwo' | 'gallery'> } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [slugError, setSlugError] = useState('');
    const [cardStatus, setCardStatus] = useState<'draft' | 'active'>('draft');
    const hasLoadedRef = useRef(false);

    const getWeddingId = () => {
        const stateId = location.state?.weddingId;
        if (stateId && Number.isFinite(stateId) && stateId > 0) {
            sessionStorage.setItem('edit_wedding_id_' + location.pathname, String(stateId));
            return stateId;
        }

        const queryId = Number(searchParams.get('weddingId'));
        if (queryId && Number.isFinite(queryId) && queryId > 0) {
            sessionStorage.setItem('edit_wedding_id_' + location.pathname, String(queryId));
            return queryId;
        }

        const storedId = Number(sessionStorage.getItem('edit_wedding_id_' + location.pathname));
        if (storedId && Number.isFinite(storedId) && storedId > 0) {
            return storedId;
        }

        return undefined;
    };

    const [weddingId, setWeddingId] = useState<number | undefined>(() => getWeddingId());
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const galleryStripRef = useRef<HTMLDivElement | null>(null);
    const uploadTargetRef = useRef<ImageTarget>('images.cover');
    const shouldInsertGalleryImageRef = useRef(false);
    const shouldScrollGalleryEndRef = useRef(false);
    const objectUrlsRef = useRef<string[]>([]);
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const [eventDateText, setEventDateText] = useState(() => formatDateDisplay(draft.eventDate || ''));

    useEffect(() => {
        setEventDateText(formatDateDisplay(draft.eventDate || ''));
    }, [draft.eventDate]);

    const handleEventDateChange = (dateValue: string) => {
        const nextDate = dateValue || '';
        updateField('eventDate', nextDate);
    };

    const handleEventDateTextChange = (dateValue: string) => {
        setEventDateText(dateValue);
        const parsedDate = parseDateDisplay(dateValue);
        if (parsedDate) {
            handleEventDateChange(parsedDate);
        }
    };

    const handleEventDateTextBlur = () => {
        const parsedDate = parseDateDisplay(eventDateText);
        if (parsedDate) {
            setEventDateText(formatDateDisplay(parsedDate));
            return;
        }

        const fallbackDate = draft.eventDate || '';
        setEventDateText(formatDateDisplay(fallbackDate));
        handleEventDateChange(fallbackDate);
    };

    const handleDatePickerClick = () => {
        const input = dateInputRef.current;
        if (!input) return;

        const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
        if (pickerInput.showPicker) {
            pickerInput.showPicker();
            return;
        }

        input.focus();
        input.click();
    };

    useEffect(() => {
        const value = getWeddingId();
        if (!value || hasLoadedRef.current) return;
 
        let active = true;
        setSaveStatus('Đang tải bản đã lưu...');
        weddingCardService
            .getMyCard(value)
            .then((card) => {
                if (!active) return;
                const loaded = fromApiCard(card, defaultElegantInvitationData);
                setDraft(loaded);
                setEventDateText(formatDateDisplay(loaded.eventDate));
                setWeddingId(card.weddingId);
                setCardStatus(card.status);
                setSaveStatus('Đã tải bản chỉnh sửa.');
                hasLoadedRef.current = true;
            })
            .catch((error) => {
                if (active) setSaveStatus(error instanceof Error ? error.message : 'Không thể tải thiệp.');
            });
 
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const urls = objectUrlsRef.current;
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const updateField = (field: keyof ElegantInvitationData, value: string) => {
        setDraft((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const requestImage = (target: ImageTarget, mode: 'replace' | 'insert' = 'replace') => {
        uploadTargetRef.current = target;
        shouldInsertGalleryImageRef.current = mode === 'insert';
        fileInputRef.current?.click();
    };

    const addGalleryImage = () => {
        const firstEmptyIndex = draft.images.gallery.findIndex((image) => !image);

        if (firstEmptyIndex >= 0) {
            requestImage(`images.gallery.${firstEmptyIndex}`, 'replace');
            return;
        }

        if (draft.images.gallery.length < 20) {
            requestImage(`images.gallery.${draft.images.gallery.length}`, 'replace');
        } else {
            alert('Album chỉ giới hạn tối đa 20 ảnh!');
        }
    };

    const applyImage = (target: ImageTarget, url: string) => {
        setDraft((current) => {
            const next = cloneData(current);

            if (target.startsWith('images.gallery.')) {
                if (shouldInsertGalleryImageRef.current) {
                    next.images.gallery = [url, ...current.images.gallery.filter(Boolean)].slice(0, 20);
                    return next;
                }

                const index = Number(target.split('.').at(-1));
                next.images.gallery[index] = url;
                return next;
            }

            const key = target.replace('images.', '') as Exclude<keyof ElegantInvitationData['images'], 'gallery'>;
            next.images[key] = url;
            return next;
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            shouldInsertGalleryImageRef.current = false;
            shouldScrollGalleryEndRef.current = false;
            return;
        }

        const url = URL.createObjectURL(file);
        const target = uploadTargetRef.current;
        const shouldRevealNewestGalleryImage = shouldInsertGalleryImageRef.current && target.startsWith('images.gallery.');
        const shouldRevealAppendedGalleryImage = shouldScrollGalleryEndRef.current && target.startsWith('images.gallery.');
        objectUrlsRef.current.push(url);
        applyImage(target, url);
        shouldInsertGalleryImageRef.current = false;
        shouldScrollGalleryEndRef.current = false;

        if (shouldRevealNewestGalleryImage) {
            window.requestAnimationFrame(() => {
                const strip = galleryStripRef.current;
                strip?.scrollTo({ left: 0, behavior: 'smooth' });
            });
        }

        if (shouldRevealAppendedGalleryImage) {
            window.requestAnimationFrame(() => {
                const strip = galleryStripRef.current;
                strip?.scrollTo({ left: strip.scrollWidth, behavior: 'smooth' });
            });
        }

        event.target.value = '';
    };

    const validateRequiredImages = (): boolean => {
        const requiredImages: Array<{ key: 'cover' | 'portraitOne' | 'portraitTwo'; label: string }> = [
            { key: 'cover', label: 'Ảnh bìa (ảnh đôi lớn phía trên)' },
            { key: 'portraitOne', label: 'Ảnh chân dung chú rể' },
            { key: 'portraitTwo', label: 'Ảnh chân dung cô dâu' },
        ];

        const missingRequiredImages = requiredImages.filter(({ key }) => !draft.images[key]);
        const galleryCount = draft.images.gallery.filter(Boolean).length;
        const missingGallery = galleryCount < 4;

        const missingKeys: Array<'cover' | 'hero' | 'portraitOne' | 'portraitTwo' | 'gallery'> = [
            ...missingRequiredImages.map(({ key }) => key),
            ...(missingGallery ? (['gallery'] as const) : []),
        ];

        if (missingKeys.length > 0) {
            setValidationAlert({
                title: 'Thiếu ảnh bắt buộc',
                message: '',
                missingImages: missingKeys,
            });
            return false;
        }
        return true;
    };

    const handleValidateAndAction = (actionName: string) => {
        if (draft.showGiftSection !== false) {
            const missingGroom = draft.showGroomGift && !draft.images.groomQr;
            const missingBride = draft.showBrideGift && !draft.images.brideQr;

            if (missingGroom || missingBride) {
                const missing = [];
                if (missingGroom) missing.push('QR chú rể');
                if (missingBride) missing.push('QR cô dâu');

                setValidationAlert({
                    title: 'Thiếu thông tin mã QR',
                    message: `Bạn đã chọn hiển thị nhưng chưa tải lên ${missing.join(' và ')}. Vui lòng bổ sung ảnh hoặc tắt tùy chọn hiển thị trước khi ${actionName.toLowerCase()}!`,
                });
                return;
            }
        }

        if (actionName === 'Xem trước') {
            if (!validateRequiredImages()) {
                return;
            }

            const previewWindow = window.open('about:blank', '_blank');
            if (previewWindow) {
                previewWindow.document.write(previewSkeletonDocument);
                previewWindow.document.close();
            } else {
                setValidationAlert({
                    title: 'Trình duyệt chặn mở trang',
                    message: 'Trình duyệt của bạn đang chặn mở tab mới. Vui lòng cấp quyền (allow popups) để xem trước!',
                });
                return;
            }

            resolveLocalImages(draft)
                .then((previewData) => saveElegantPreview(previewData))
                .then(() => {
                    if (previewWindow) {
                        previewWindow.opener = null;
                        previewWindow.location.href = '/tram-nam-ben-doi?preview=1';
                    }
                })
                .catch((error) => {
                    const message = error instanceof Error ? error.message : 'Không thể tạo bản xem trước.';
                    if (previewWindow) {
                        previewWindow.document.body.innerHTML = `<main style="font-family:system-ui;padding:32px;line-height:1.5"><h1 style="font-size:20px">Không thể tạo bản xem trước</h1><p>${message}</p></main>`;
                    }
                    setValidationAlert({
                        title: 'Lỗi tạo bản xem trước',
                        message: `${message} Vui lòng thử lại hoặc giảm dung lượng ảnh.`,
                    });
                });
            return;
        }
    };

    const persistDraft = async (status: 'draft' | 'active', isPublishing = false) => {
        if (isSaving) return;

        if (!authTokenService.isAuthenticated()) {
            window.dispatchEvent(new CustomEvent('open-auth-modal'));
            return;
        }

        const requestedSlug = draft.slug?.trim();
        if (!requestedSlug) {
            setSlugError('Vui lòng nhập đường dẫn ngắn!');
            setValidationAlert({
                title: 'Thiếu đường dẫn ngắn',
                message: 'Vui lòng nhập đường dẫn ngắn (slug) cho thiệp cưới trước khi lưu!',
            });
            return;
        }

        setIsSaving(true);
        setSaveStatus('');
        try {
            setSaveStatus('Đang kiểm tra URL...');
            await weddingCardService.checkSlugAvailability(requestedSlug, weddingId);
            setSlugError('');

            if (!validateRequiredImages()) {
                return;
            }

            if ((status === 'active' || isPublishing) && draft.showGiftSection !== false) {
                const missingGroom = draft.showGroomGift && !draft.images.groomQr;
                const missingBride = draft.showBrideGift && !draft.images.brideQr;
                if (missingGroom || missingBride) {
                    const missing = [];
                    if (missingGroom) missing.push('QR chú rể');
                    if (missingBride) missing.push('QR cô dâu');
                    setValidationAlert({
                        title: 'Thiếu thông tin mã QR',
                        message: `Bạn đã chọn hiển thị nhưng chưa tải lên ${missing.join(' và ')}. Vui lòng bổ sung ảnh hoặc tắt tùy chọn trước khi lưu!`,
                    });
                    return;
                }
            }

            const uploadReady = await uploadLocalImages(draft, setSaveStatus);
            setSaveStatus((status === 'active' || isPublishing) ? 'Đang xuất bản thiệp...' : 'Đang lưu bản nháp...');
            const payload = toSaveRequest(uploadReady, isPublishing ? 'draft' : status);
            const card = await weddingCardService.saveMyCard(payload, weddingId);
            const normalized = fromApiCard(card, draft);
            setDraft(normalized);
            setWeddingId(card.weddingId);
            setCardStatus(card.status);

            if (isPublishing) {
                navigate(`/dashboard?activate=${card.weddingId}`);
                return;
            }

            if (status === 'active') {
                navigate('/dashboard');
                return;
            }

            sessionStorage.setItem('edit_wedding_id_' + location.pathname, String(card.weddingId));
            navigate(location.pathname, { replace: true, state: { weddingId: card.weddingId } });
            setSaveStatus('Đã lưu bản nháp thành công!');
            setShowSaveSuccess(true);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Không thể lưu thiệp. Vui lòng thử lại.';
            if (msg.includes('URL đã tồn tại')) {
                setSlugError(msg);
            }
            setSaveStatus(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinish = () => {
        if (cardStatus === 'active') {
            persistDraft('active');
            return;
        }

        persistDraft('draft', true);
    };

    return (
        <main className="clve-page">
            <input ref={fileInputRef} className="clve-file-input" type="file" accept="image/*" onChange={handleFileChange} />

            <section className="clve-preview">
                <div className="clve-phone-frame">
                    <ElegantInvitation data={draft} editable onImageClick={requestImage} />
                </div>
            </section>

            <aside className="clve-editor">
                <div className="clve-actions">
                    <button type="button" disabled={isSaving} onClick={() => handleValidateAndAction('Xem trước')}>
                        <Eye size={17} />
                        Xem trước
                    </button>
                    <button className="is-primary" type="button" disabled={isSaving} onClick={handleFinish}>
                        {isSaving ? <Loader2 size={17} className="clve-spin" /> : <Check size={17} />}
                        Hoàn tất
                    </button>
                </div>

                {saveStatus && (
                    <div className={`clve-save-status${isSaving ? ' is-loading' : ''}`}>
                        {isSaving && (
                            <div role="status">
                                <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                        {saveStatus}
                    </div>
                )}

                <header className="clve-header">
                    <span>Chỉnh sửa thiệp</span>
                    <h1>Trăm Năm Bến Đợi</h1>
                    <p>Thay đổi nội dung bên dưới sẽ cập nhật trực tiếp trên khung preview.</p>
                </header>

                <form className="clve-form">
                    <section className="clve-card">
                        <div className="clve-card__title">
                            <LinkIcon size={18} />
                            <h2>Đường dẫn ngắn</h2>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 12px' }}>
                            Dùng để truy cập đến URL của thiệp của bạn.
                        </p>
                        <div className="clve-field">
                            <input
                                value={draft.slug || ''}
                                type="text"
                                className={slugError ? 'is-error' : ''}
                                placeholder="tram-nam-ben-doi-slug"
                                onChange={(event) => {
                                    setSlugError('');
                                    if (saveStatus.includes('URL đã tồn tại')) {
                                        setSaveStatus('');
                                    }
                                    updateField('slug', event.target.value);
                                }}
                            />
                            {slugError && <strong className="clve-field-error" style={{ color: '#b72d31', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{slugError}</strong>}
                        </div>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title">
                            <UserRound size={18} />
                            <h2>Thông tin mở đầu</h2>
                        </div>

                        <div className="clve-grid-2">
                            <label className="clve-field">
                                <span>Tên chú rể đầu thiệp</span>
                                <input value={draft.groomName} type="text" onChange={(event) => updateField('groomName', event.target.value)} />
                            </label>
                            <label className="clve-field">
                                <span>Tên cô dâu đầu thiệp</span>
                                <input value={draft.brideName} type="text" onChange={(event) => updateField('brideName', event.target.value)} />
                            </label>
                        </div>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title">
                            <UsersRound size={18} />
                            <h2>Thông tin nhà trai nhà gái</h2>
                        </div>

                        <div className="clve-grid-2">
                            <label className="clve-field">
                                <span>Cha chú rể</span>
                                <input value={draft.groomFather} type="text" onChange={(event) => updateField('groomFather', event.target.value)} />
                            </label>
                            <label className="clve-field">
                                <span>Cha cô dâu</span>
                                <input value={draft.brideFather} type="text" onChange={(event) => updateField('brideFather', event.target.value)} />
                            </label>
                            <label className="clve-field">
                                <span>Mẹ chú rể</span>
                                <input value={draft.groomMother} type="text" onChange={(event) => updateField('groomMother', event.target.value)} />
                            </label>
                            <label className="clve-field">
                                <span>Mẹ cô dâu</span>
                                <input value={draft.brideMother} type="text" onChange={(event) => updateField('brideMother', event.target.value)} />
                            </label>
                        </div>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title">
                            <CalendarDays size={18} />
                            <h2>Lễ cưới</h2>
                        </div>

                        <div className="clve-grid-2">
                            <label className="clve-field">
                                <span>Ngày cưới</span>
                                <div className="clve-date-input-row" style={{ display: 'flex', gap: '0', position: 'relative' }}>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="dd/mm/yyyy"
                                        value={eventDateText}
                                        style={{ borderRight: '0', borderRadius: '10px 0 0 10px', flex: '1' }}
                                        onChange={(event) => handleEventDateTextChange(event.target.value)}
                                        onBlur={handleEventDateTextBlur}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Chọn ngày cưới"
                                        onClick={handleDatePickerClick}
                                        style={{
                                            width: '44px',
                                            minHeight: '44px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            border: '1px solid rgba(141, 95, 37, 0.16)',
                                            borderRadius: '0 10px 10px 0',
                                            background: '#ffffff',
                                            color: '#8d5f25',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CalendarDays size={18} />
                                    </button>
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        value={draft.eventDate}
                                        onChange={(event) => handleEventDateChange(event.target.value)}
                                        style={{
                                            position: 'absolute',
                                            right: '0',
                                            bottom: '0',
                                            width: '1px',
                                            height: '1px',
                                            padding: '0',
                                            opacity: '0',
                                            pointerEvents: 'none'
                                        }}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    />
                                </div>
                            </label>
                            <label className="clve-field">
                                <span>Giờ cưới</span>
                                <input value={draft.eventTime} type="time" onChange={(event) => updateField('eventTime', event.target.value)} />
                            </label>
                        </div>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title">
                            <MapPin size={18} />
                            <h2>Địa điểm tổ chức</h2>
                        </div>

                        <label className="clve-field">
                            <span>Tên địa điểm</span>
                            <input value={draft.venueName} type="text" onChange={(event) => updateField('venueName', event.target.value)} />
                        </label>

                        <label className="clve-field">
                            <span>Địa chỉ</span>
                            <textarea value={draft.address} rows={3} onChange={(event) => updateField('address', event.target.value)} />
                        </label>

                        <label className="clve-field">
                            <span className="clve-field-head">
                                Bản đồ
                                <button type="button" onClick={() => window.open(draft.mapUrl, '_blank')} disabled={!draft.mapUrl.trim()}>
                                    <Eye size={15} />
                                    Xem bản đồ
                                </button>
                            </span>
                            <textarea
                                value={draft.mapUrl}
                                rows={3}
                                placeholder="Ví dụ: https://maps.app.goo.gl/... hoặc dán mã nhúng bản đồ"
                                onChange={(event) => {
                                    const value = event.target.value;
                                    let cleanValue = value;
                                    if (value.toLowerCase().includes('<iframe')) {
                                        const match = value.match(/src=["']([^"']+)["']/i);
                                        if (match && match[1]) {
                                            cleanValue = match[1];
                                        }
                                    }
                                    updateField('mapUrl', cleanValue);
                                }}
                            />
                        </label>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title">
                            <Image size={18} />
                            <h2>Hình ảnh album & ảnh đôi</h2>
                        </div>

                        <div className="clve-image-row-head">
                            <label>Album (Tối đa 20 ảnh)</label>
                            <span>{draft.images.gallery.filter(Boolean).length}/20 ảnh</span>
                        </div>

                        <div className="clve-image-strip" ref={galleryStripRef}>
                            <button className="clve-add-image" type="button" onClick={addGalleryImage}>
                                <Plus size={24} />
                                <span>Thêm ảnh</span>
                            </button>
                            {draft.images.gallery.map((image, index) => (
                                image && (
                                    <button key={`album-strip-btn-${index}`} type="button" onClick={() => requestImage(`images.gallery.${index}`)}>
                                        <img src={image} alt={`Album ${index + 1}`} />
                                    </button>
                                )
                            ))}
                        </div>

                        <div className="clve-upload-grid is-primary-images">
                            <button className={`clve-upload-tile${draft.images.cover ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.cover')}>
                                <Upload size={18} />
                                <span>{draft.images.cover ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
                            </button>
                            <button className={`clve-upload-tile${draft.images.hero ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.hero')}>
                                <Upload size={18} />
                                <span>{draft.images.hero ? 'Đổi ảnh đôi lớn' : 'Thêm ảnh đôi lớn'}</span>
                            </button>
                            <button className={`clve-upload-tile${draft.images.portraitOne ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.portraitOne')}>
                                <Upload size={18} />
                                <span>{draft.images.portraitOne ? 'Đổi ảnh chú rể' : 'Thêm ảnh chú rể'}</span>
                            </button>
                            <button className={`clve-upload-tile${draft.images.portraitTwo ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.portraitTwo')}>
                                <Upload size={18} />
                                <span>{draft.images.portraitTwo ? 'Đổi ảnh cô dâu' : 'Thêm ảnh cô dâu'}</span>
                            </button>
                        </div>
                    </section>

                    <section className="clve-card">
                        <div className="clve-card__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Gift size={18} />
                                <h2 style={{ margin: 0 }}>Hộp quà cưới mừng tuổi</h2>
                            </div>
                            <input
                                checked={draft.showGiftSection !== false}
                                type="checkbox"
                                style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                                onChange={(event) => setDraft((current) => ({ ...current, showGiftSection: event.target.checked }))}
                            />
                        </div>

                        {draft.showGiftSection !== false && (
                            <>
                                <div className="clve-qr-toggle-grid">
                                    <label>
                                        <input
                                            checked={draft.showGroomGift !== false}
                                            type="checkbox"
                                            onChange={(event) => setDraft((current) => ({ ...current, showGroomGift: event.target.checked }))}
                                        />
                                        <span>QR mừng chú rể</span>
                                    </label>
                                    <label>
                                        <input
                                            checked={draft.showBrideGift !== false}
                                            type="checkbox"
                                            onChange={(event) => setDraft((current) => ({ ...current, showBrideGift: event.target.checked }))}
                                        />
                                        <span>QR mừng cô dâu</span>
                                    </label>
                                </div>

                                <div className="clve-upload-grid">
                                    <button
                                        className={`clve-upload-tile${draft.images.groomQr ? ' has-image' : ''}`}
                                        type="button"
                                        disabled={draft.showGroomGift === false}
                                        onClick={() => requestImage('images.groomQr')}
                                    >
                                        <Upload size={18} />
                                        <span>{draft.images.groomQr ? 'Đổi QR chú rể' : 'Thêm QR chú rể'}</span>
                                    </button>
                                    <button
                                        className={`clve-upload-tile${draft.images.brideQr ? ' has-image' : ''}`}
                                        type="button"
                                        disabled={draft.showBrideGift === false}
                                        onClick={() => requestImage('images.brideQr')}
                                    >
                                        <Upload size={18} />
                                        <span>{draft.images.brideQr ? 'Đổi QR cô dâu' : 'Thêm QR cô dâu'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </form>
            </aside>

            {validationAlert && (
                <div className="clve-map-modal" role="dialog" aria-modal="true">
                    <button className="clve-map-backdrop" type="button" onClick={() => setValidationAlert(null)} />
                    <div className="clve-alert-dialog has-list">
                        <div className="clve-map-dialog__head">
                            <strong>{validationAlert.title}</strong>
                            <button type="button" onClick={() => setValidationAlert(null)}>Đóng</button>
                        </div>
                        <div className="clve-alert-dialog__content">
                            {validationAlert.missingImages ? (
                                <>
                                    <p className="clve-alert-dialog__intro">Vui lòng bổ sung các hình ảnh bắt buộc sau:</p>
                                    <ul className="clve-alert-dialog__list">
                                        {validationAlert.missingImages.map((key) => {
                                            const labels: Record<string, string> = {
                                                cover: 'Ảnh bìa (ảnh đôi lớn phía trên)',
                                                hero: 'Ảnh đôi lớn mở đầu',
                                                portraitOne: 'Ảnh chân dung chú rể',
                                                portraitTwo: 'Ảnh chân dung cô dâu',
                                                gallery: 'Ảnh album cưới (cần ít nhất 4 ảnh)',
                                            };
                                            return (
                                                <li key={key}>
                                                    <span>{labels[key]}</span>
                                                    <button
                                                        type="button"
                                                        className="clve-alert-dialog__quick-upload"
                                                        onClick={() => {
                                                            setValidationAlert(null);
                                                            if (key === 'gallery') {
                                                                addGalleryImage();
                                                            } else {
                                                                requestImage(`images.${key}` as ImageTarget);
                                                            }
                                                        }}
                                                    >
                                                        Thêm ảnh
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
							) : (
								<p>{validationAlert.message}</p>
							)}
                        </div>
                        <div className="clve-alert-dialog__actions">
                            <button type="button" onClick={() => setValidationAlert(null)}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}

            {showSaveSuccess && (
                <div className="clve-map-modal" role="dialog" aria-modal="true">
                    <button className="clve-map-backdrop" type="button" onClick={() => setShowSaveSuccess(false)} />
                    <div className="clve-alert-dialog clve-success-dialog">
                        <div className="clve-success-dialog__icon">
                            <Check size={36} />
                        </div>
                        <h2 className="clve-success-dialog__title">Lưu thiệp thành công!</h2>
                        <p className="clve-success-dialog__desc">
                            Thiệp cưới đã được lưu vào hệ thống. Bạn có muốn quay lại trang quản lý không?
                        </p>
                        <div className="clve-success-dialog__actions">
                            <button type="button" className="clve-success-dialog__btn is-secondary" onClick={() => setShowSaveSuccess(false)}>
                                Tiếp tục chỉnh sửa
                            </button>
                            <button type="button" className="clve-success-dialog__btn is-primary" onClick={() => navigate('/dashboard')}>
                                Quản lý thiệp cưới
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default ElegantInvitationEditor;
