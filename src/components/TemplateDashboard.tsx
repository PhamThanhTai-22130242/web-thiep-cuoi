import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
    CalendarDays,
    Eye,
    MapPin,
    Plus,
    Save,
    Send,
    Trash2,
    X,
    Check,
    Loader2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
    defaultInvitationTemplate,
    defaultRubyInvitationTemplate,
    InvitationTemplate,
    savePreviewInvitationTemplate,
    templateStorageKey,
} from '../data/invitationTemplates';
import { MyWeddingCardResponse, MyWeddingCardSaveRequest, WeddingCardMedia } from '../models/wedding-card.model';
import { weddingCardService } from '../services/wedding-card.service';
import { authTokenService } from '../services/auth-token.service';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import EmeraldInvitation from './EmeraldInvitationPage';
import './TemplateDashboard.css';

const fontOptions = ['Allura', 'Great Vibes', 'Dancing Script', 'Pacifico'];
const colorPresets = [
    { key: 'emerald', primary: '#2d4b45', background: '#f8f8f1', accent: '#c2a113' },
    { key: 'rose', primary: '#7d3347', background: '#fff7f7', accent: '#c8915b' },
    { key: 'navy', primary: '#263f63', background: '#f7f8fb', accent: '#b9985b' },
    { key: 'champagne', primary: '#6a4f3c', background: '#fffaf2', accent: '#b88a3a' },
];

type ImageField = 'images.cover' | 'images.kiss' | 'images.walk' | 'images.smile' | 'images.studio' | 'images.thank';
type UploadTarget = ImageField | `images.gallery.${number}`;
const mapGuideYoutubeUrl = 'https://www.youtube.com/results?search_query=c%C3%A1ch+l%E1%BA%A5y+link+nh%C3%BAng+google+map';
const localPreviewPrefix = 'blob:';

const defaultSampleImages = new Set([
    defaultInvitationTemplate.images.cover,
    defaultInvitationTemplate.images.kiss,
    defaultInvitationTemplate.images.walk,
    defaultInvitationTemplate.images.smile,
    defaultInvitationTemplate.images.studio,
    defaultInvitationTemplate.images.thank,
    ...(defaultInvitationTemplate.images.gallery || []),
    defaultRubyInvitationTemplate.images.cover,
    defaultRubyInvitationTemplate.images.kiss,
    defaultRubyInvitationTemplate.images.walk,
    defaultRubyInvitationTemplate.images.smile,
    defaultRubyInvitationTemplate.images.studio,
    defaultRubyInvitationTemplate.images.thank,
    ...(defaultRubyInvitationTemplate.images.gallery || []),
]);

const requiredImages: Array<{ field: ImageField; label: string }> = [
    { field: 'images.cover', label: 'ảnh bìa' },
    { field: 'images.kiss', label: 'ảnh khoảnh khắc' },
    { field: 'images.walk', label: 'ảnh cô dâu chú rể' },
];

const previewSkeletonDocument = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Đang tạo bản xem trước</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f8f8f1;color:#2d4b45}
.preview-skeleton{min-height:100vh;padding:clamp(28px,5vw,72px) 18px;background:radial-gradient(circle at 50% 0,rgba(194,161,19,.12),transparent 32vh),linear-gradient(90deg,rgba(45,75,69,.04) 1px,transparent 1px),#f8f8f1;background-size:auto,32px 32px,auto}
.preview-skeleton__hero,.preview-skeleton__card{width:min(100%,960px);margin:0 auto}
.preview-skeleton__hero{display:grid;grid-template-columns:minmax(120px,220px) minmax(220px,1fr) minmax(120px,220px);align-items:center;gap:clamp(18px,4vw,42px);min-height:360px}
.skel{position:relative;overflow:hidden;background:rgba(45,75,69,.1);border-radius:18px}
.skel:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:shimmer 1.35s ease-in-out infinite}
.photo{aspect-ratio:3/4;box-shadow:0 18px 48px rgba(32,59,54,.12)}
.photo:first-child{transform:rotate(-5deg)}.photo:last-child{transform:rotate(5deg)}
.content{display:grid;justify-items:center;gap:16px}.pill{width:min(54%,220px);height:18px;border-radius:999px}.title{width:min(82%,420px);height:clamp(56px,8vw,92px);border-radius:28px}.line{width:min(72%,360px);height:16px;border-radius:999px}.line.is-short{width:min(58%,280px)}
.preview-skeleton__card{display:grid;justify-items:center;gap:18px;margin-top:clamp(16px,4vw,48px);padding:clamp(28px,5vw,48px);border:1px solid rgba(45,75,69,.12);border-radius:28px;background:rgba(255,255,255,.48);box-shadow:0 24px 60px rgba(32,59,54,.1)}
.card-line{width:min(72%,520px);height:18px;border-radius:999px}.card-line.is-title{width:min(46%,300px);height:42px;border-radius:20px}.date{display:grid;grid-template-columns:110px 92px 110px;align-items:center;gap:18px}.date .skel{height:36px}.date strong.skel{display:block;height:88px;border-radius:24px}
@keyframes shimmer{100%{transform:translateX(100%)}}
@media(max-width:760px){.preview-skeleton__hero{grid-template-columns:1fr;min-height:auto}.photo{width:min(62vw,220px);margin:0 auto}.photo:last-child{display:none}.date{grid-template-columns:1fr;width:min(100%,240px)}}
</style>
</head>
<body>
<main class="preview-skeleton" aria-busy="true">
<section class="preview-skeleton__hero" role="status" aria-label="Đang tạo bản xem trước">
<div class="skel photo"></div><div class="content"><div class="skel pill"></div><div class="skel title"></div><div class="skel line"></div><div class="skel line is-short"></div></div><div class="skel photo"></div>
</section>
<section class="preview-skeleton__card"><div class="skel card-line"></div><div class="skel card-line is-title"></div><div class="date"><span class="skel"></span><strong class="skel"></strong><span class="skel"></span></div><div class="skel card-line"></div></section>
</main>
</body>
</html>`;

function cloneTemplate(template: InvitationTemplate): InvitationTemplate {
    return JSON.parse(JSON.stringify(template));
}

function getTodayDateInput() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getDayName(dateValue: string) {
    const date = new Date(`${dateValue}T00:00:00+07:00`);

    if (Number.isNaN(date.getTime())) {
        return defaultInvitationTemplate.event.dayName;
    }

    return new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
}

function createEditableTemplate(): InvitationTemplate {
    const template = cloneTemplate(defaultInvitationTemplate);
    const today = getTodayDateInput();
    template.images.cover = '';
    template.images.kiss = '';
    template.images.walk = '';
    template.event.date = toEventDate(today, '00:00');
    template.event.dayName = getDayName(today);
    template.event.day = today.slice(8, 10);
    template.event.month = today.slice(5, 7);
    template.event.year = today.slice(0, 4);
    template.event.time = '00 gi\u1EDD 00';
    return template;
}

function normalizeEditableTemplate(template: InvitationTemplate): InvitationTemplate {
    const next = cloneTemplate(template);
    if (next.event.date === defaultInvitationTemplate.event.date && next.event.time === defaultInvitationTemplate.event.time) {
        const today = getTodayDateInput();
        next.event.date = toEventDate(today, '00:00');
        next.event.dayName = getDayName(today);
        next.event.day = today.slice(8, 10);
        next.event.month = today.slice(5, 7);
        next.event.year = today.slice(0, 4);
        next.event.time = '00 gi\u1EDD 00';
    }
    (['cover', 'kiss', 'walk'] as const).forEach((key) => {
        if (defaultSampleImages.has(next.images[key])) {
            next.images[key] = '';
        }
    });
    next.images.gallery = (next.images.gallery || []).map((image) => (defaultSampleImages.has(image) ? '' : image));
    return next;
}

function loadTemplates(): InvitationTemplate[] {
    const fallback = [createEditableTemplate()];

    try {
        const stored = window.localStorage.getItem(templateStorageKey);
        if (!stored) {
            return fallback;
        }

        const parsed = JSON.parse(stored) as InvitationTemplate[];
        return parsed.length ? parsed.map(normalizeEditableTemplate) : fallback;
    } catch {
        return fallback;
    }
}

function formatDateInput(dateValue: string) {
    const datePart = dateValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
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

function formatTimeInput(dateValue: string) {
    const timePart = dateValue.match(/T(\d{2}:\d{2})/)?.[1];
    if (timePart) {
        return timePart;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toTimeString().slice(0, 5);
}

function toEventDate(dateValue: string, timeValue: string) {
    return `${dateValue || getTodayDateInput()}T${timeValue || '00:00'}:00+07:00`;
}

function toGoogleMapEmbedUrl(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return '';
    }

    if (trimmedValue.toLowerCase().includes('<iframe')) {
        return trimmedValue.match(/src=["']([^"']+)["']/i)?.[1]?.trim() || '';
    }

    try {
        const url = new URL(trimmedValue);

        if (url.hostname.includes('google.') || url.hostname.includes('goo.gl')) {
            url.searchParams.set('output', 'embed');
            return url.toString();
        }
    } catch {
        return `https://www.google.com/maps?q=${encodeURIComponent(trimmedValue)}&output=embed`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(trimmedValue)}&output=embed`;
}

function normalizeMapInput(value: string) {
    const trimmedValue = value.trim();
    return trimmedValue.toLowerCase().includes('<iframe')
        ? trimmedValue.match(/src=["']([^"']+)["']/i)?.[1]?.trim() || ''
        : value;
}

function getGallery(template: InvitationTemplate) {
    return template.images.gallery?.filter((image) => image && !defaultSampleImages.has(image)) || [];
}

function getImageValue(template: InvitationTemplate, field: ImageField) {
    const key = field.replace('images.', '') as keyof InvitationTemplate['images'];
    const value = template.images[key];
    return typeof value === 'string' ? value : '';
}

function getMissingRequiredImages(template: InvitationTemplate) {
    return requiredImages
        .filter((item) => {
            const image = getImageValue(template, item.field).trim();
            return !image || defaultSampleImages.has(image);
        })
        .map((item) => item.label);
}

function isLocalPreviewImage(value: string) {
    return value.startsWith(localPreviewPrefix) || value.startsWith('data:');
}

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function toApiTime(timeValue: string) {
    const match = timeValue.match(/(\d{1,2})(?:\D+(\d{1,2}))?/);
    const hour = (match?.[1] || '00').padStart(2, '0');
    const minute = (match?.[2] || '00').padStart(2, '0');

    return `${hour}:${minute}`;
}

function toSaveRequest(template: InvitationTemplate, status: 'draft' | 'active'): MyWeddingCardSaveRequest {
    const media: WeddingCardMedia[] = [
        { slotKey: 'images.cover', imgUrl: template.images.cover, number: 1 },
        { slotKey: 'images.kiss', imgUrl: template.images.kiss, number: 2 },
        { slotKey: 'images.walk', imgUrl: template.images.walk, number: 3 },
        { slotKey: 'images.smile', imgUrl: template.images.smile, number: 4 },
        { slotKey: 'images.studio', imgUrl: template.images.studio, number: 5 },
        { slotKey: 'images.thank', imgUrl: template.images.thank, number: 6 },
        ...getGallery(template).map((imgUrl, index) => ({
            slotKey: `images.gallery.${index}`,
            imgUrl,
            number: 100 + index,
        })),
    ].filter((item) => item.imgUrl && !defaultSampleImages.has(item.imgUrl) && !isLocalPreviewImage(item.imgUrl));

    return {
        templateCode: 'EmeraldInvitation',
        slug: template.slug,
        status,
        design: {
            primaryColor: template.design.primaryColor,
            dropEffect: 'none',
        },
        couple: {
            groom: template.couple.groom,
            bride: template.couple.bride,
            groomRole: template.couple.groomRole,
            brideRole: template.couple.brideRole,
        },
        event: {
            inviteText: template.couple.headline,
            eventDate: formatDateInput(template.event.date),
            eventTime: toApiTime(template.event.time),
            venueName: template.event.venue,
            address: template.event.address,
            linkMap: template.event.mapUrl,
        },
        media,
    };
}

function fromApiCard(card: MyWeddingCardResponse): InvitationTemplate {
    const template = createEditableTemplate();
    const groom = card.people.find((person) => person.role === 'groom');
    const bride = card.people.find((person) => person.role === 'bride');
    const event = card.events[0];
    const mediaBySlot = new Map(card.media.map((item) => [item.slotKey, item.imgUrl]));
    const eventDate = event?.eventDate || getTodayDateInput();
    const eventTime = (event?.eventTime || '00:00').slice(0, 5);
    const gallery = card.media
        .filter((item) => item.slotKey?.startsWith('images.gallery.'))
        .sort((left, right) => (left.number || 0) - (right.number || 0))
        .map((item) => item.imgUrl);

    template.id = String(card.weddingId);
    template.slug = card.slug;
    template.status = card.status === 'active' ? 'published' : 'draft';
    template.publicUrl = `/thiep/${card.slug}`;
    template.couple.groom = groom?.shortName || groom?.fullName || template.couple.groom;
    template.couple.bride = bride?.shortName || bride?.fullName || template.couple.bride;
    template.couple.groomRole = groom?.familyLable || template.couple.groomRole;
    template.couple.brideRole = bride?.familyLable || template.couple.brideRole;
    template.couple.headline = event?.inviteText || template.couple.headline;
    template.event.date = toEventDate(eventDate, eventTime);
    template.event.dayName = getDayName(eventDate);
    template.event.day = eventDate.slice(8, 10);
    template.event.month = eventDate.slice(5, 7);
    template.event.year = eventDate.slice(0, 4);
    template.event.time = eventTime.replace(':', ' giờ ');
    template.event.venue = event?.venueName || '';
    template.event.address = event?.address || '';
    template.event.mapUrl = event?.linkMap || '';
    template.design.primaryColor = card.themeColor || template.design.primaryColor;
    template.images.cover = mediaBySlot.get('images.cover') || '';
    template.images.kiss = mediaBySlot.get('images.kiss') || '';
    template.images.walk = mediaBySlot.get('images.walk') || '';
    template.images.smile = mediaBySlot.get('images.smile') || '';
    template.images.studio = mediaBySlot.get('images.studio') || '';
    template.images.thank = mediaBySlot.get('images.thank') || '';
    template.images.gallery = gallery;

    return template;
}

function TemplateDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const pendingImageFilesRef = useRef<Map<UploadTarget, File>>(new Map());
    const previewUrlsRef = useRef<Set<string>>(new Set());
    const hasLoadedRef = useRef(false);
    const [templates, setTemplates] = useState<InvitationTemplate[]>(() => loadTemplates());
    const [selectedId] = useState(templates[0]?.id || defaultInvitationTemplate.id);

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

    const [currentWeddingId, setCurrentWeddingId] = useState<number | undefined>(() => getWeddingId());
    const [saveStatus, setSaveStatus] = useState('');
    const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isMapDetailOpen, setIsMapDetailOpen] = useState(false);
    const [slugError, setSlugError] = useState('');
    const [imageError, setImageError] = useState('');
    const [validationErrorModal, setValidationErrorModal] = useState('');
    const [cardStatus, setCardStatus] = useState<'draft' | 'active'>('draft');

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.id === selectedId) || templates[0] || defaultInvitationTemplate,
        [selectedId, templates],
    );

    const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<InvitationTemplate>({
        defaultValues: selectedTemplate,
    });
    const previewTemplate = watch();
    const eventDate = formatDateInput(previewTemplate.event?.date);
    const eventTime = formatTimeInput(previewTemplate.event?.date);
    const [eventDateText, setEventDateText] = useState(() => formatDateDisplay(selectedTemplate.event.date));
    const isVenueEnabled = true;
    const galleryImages = getGallery(previewTemplate);
    const mapDetailUrl = toGoogleMapEmbedUrl(previewTemplate.event?.mapUrl || previewTemplate.event?.address || previewTemplate.event?.venue || '');

    useEffect(() => {
        reset(selectedTemplate);
        setEventDateText(formatDateDisplay(selectedTemplate.event.date));
    }, [reset, selectedTemplate]);

    useEffect(() => {
        setEventDateText(formatDateDisplay(previewTemplate.event?.date || ''));
    }, [previewTemplate.event?.date]);

    useEffect(() => {
        const previewUrls = previewUrlsRef.current;
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
            previewUrls.clear();
        };
    }, []);

    const prepareTemplateForSave = async (values: InvitationTemplate) => {
        const next = cloneTemplate(values);
        const pendingEntries = Array.from(pendingImageFilesRef.current.entries());

        if (!pendingEntries.length) {
            return next;
        }

        setSaveStatus('Đang lưu...');
        const uploadedItems = await Promise.all(
            pendingEntries.map(async ([target, file]) => ({
                target,
                uploadedUrl: await weddingCardService.uploadImage(file),
            })),
        );

        uploadedItems.forEach(({ target, uploadedUrl }) => {
            if (target.startsWith('images.gallery.')) {
                const index = Number(target.split('.').pop());
                const nextGallery = [...getGallery(next)];
                nextGallery[index] = uploadedUrl;
                next.images.gallery = nextGallery;
            } else {
                const imageKey = target.replace('images.', '') as keyof InvitationTemplate['images'];
                if (imageKey !== 'gallery') {
                    next.images[imageKey] = uploadedUrl;
                }
            }
        });

        pendingImageFilesRef.current.clear();
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        previewUrlsRef.current.clear();

        return next;
    };

    const prepareTemplateForPreview = async (values: InvitationTemplate) => {
        const next = cloneTemplate(values);
        const pendingEntries = Array.from(pendingImageFilesRef.current.entries());

        if (!pendingEntries.length) {
            return next;
        }

        for (let index = 0; index < pendingEntries.length; index += 1) {
            const [target, file] = pendingEntries[index];
            const dataUrl = await readFileAsDataUrl(file);

            if (target.startsWith('images.gallery.')) {
                const galleryIndex = Number(target.split('.').pop());
                const nextGallery = [...getGallery(next)];
                nextGallery[galleryIndex] = dataUrl;
                next.images.gallery = nextGallery;
            } else {
                const imageKey = target.replace('images.', '') as keyof InvitationTemplate['images'];
                if (imageKey !== 'gallery') {
                    next.images[imageKey] = dataUrl;
                }
            }
        }

        return next;
    };

    useEffect(() => {
        const value = getWeddingId();
        if (!value || hasLoadedRef.current) {
            return;
        }

        let isActive = true;
        setSaveStatus('Đang tải thiệp đã lưu...');
        weddingCardService.getMyCard(value)
            .then((card) => {
                if (!isActive) {
                    return;
                }
                const loadedTemplate = fromApiCard(card);
                setCurrentWeddingId(card.weddingId);
                setTemplates([loadedTemplate]);
                reset(loadedTemplate);
                setEventDateText(formatDateDisplay(loadedTemplate.event.date));
                setCardStatus(card.status);
                setSaveStatus('Đã tải bản chỉnh sửa.');
                hasLoadedRef.current = true;
            })
            .catch((error) => {
                if (isActive) {
                    setSaveStatus(error instanceof Error ? error.message : 'Không thể tải thiệp đã lưu.');
                }
            });

        return () => {
            isActive = false;
        };
    }, [reset]);

    const persistTemplate = async (values: InvitationTemplate, status: 'draft' | 'active', message: string, isPublishing = false) => {
        if (!authTokenService.isAuthenticated()) {
            window.dispatchEvent(new CustomEvent('open-auth-modal'));
            return;
        }

        try {
            const requestedSlug = values.slug?.trim();
            if (!requestedSlug) {
                const nextMessage = 'Vui lòng nhập đường dẫn ngắn (slug) trước khi lưu nháp hoặc xuất bản thiệp.';
                setSlugError(nextMessage);
                setSaveStatus(nextMessage);
                return;
            }

            setSaveStatus('Đang kiểm tra URL...');
            await weddingCardService.checkSlugAvailability(requestedSlug, currentWeddingId);
            setSlugError('');

            const missingImages = getMissingRequiredImages(values);
            if (missingImages.length) {
                setValidationErrorModal(`Vui lòng chọn đầy đủ các ảnh bắt buộc trước khi lưu/xuất bản thiệp: ${missingImages.join(', ')}.`);
                return;
            }

            const galleryCount = getGallery(values).length;
            if (galleryCount < 4) {
                setValidationErrorModal('Vui lòng chọn ít nhất 4 ảnh album trước khi lưu nháp hoặc xuất bản thiệp.');
                return;
            }
            setImageError('');

            setIsSaving(true);
            setSaveStatus('Đang lưu thiệp...');
            const uploadReadyValues = await prepareTemplateForSave(values);
            setSaveStatus((status === 'active' || isPublishing) ? 'Đang xuất bản thiệp...' : 'Đang lưu bản nháp...');
            const card = await weddingCardService.saveMyCard(toSaveRequest(uploadReadyValues, isPublishing ? 'draft' : status), currentWeddingId);
            const normalized = fromApiCard(card);
            setCurrentWeddingId(card.weddingId);

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
            setTemplates([normalized]);
            reset(normalized);
            setEventDateText(formatDateDisplay(normalized.event.date));
            setCardStatus(card.status);
            setSaveStatus(message);
        } catch (error) {
            const nextMessage = error instanceof Error ? error.message : 'Không thể lưu thiệp. Vui lòng thử lại.';
            if (nextMessage.includes('URL đã tồn tại')) {
                setSlugError(nextMessage);
            }
            setSaveStatus(nextMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = handleSubmit((values) => {
        persistTemplate(values, 'draft', 'Đã lưu bản nháp vào hệ thống.');
    });

    const handleOpenPreview = handleSubmit(async (values) => {
        const missingImages = getMissingRequiredImages(values);
        if (missingImages.length) {
            setValidationErrorModal(`Vui lòng chọn đầy đủ các ảnh bắt buộc trước khi xem trước: ${missingImages.join(', ')}.`);
            return;
        }

        const galleryCount = getGallery(values).length;
        if (galleryCount < 4) {
            setValidationErrorModal('Vui lòng chọn ít nhất 4 ảnh album trước khi xem trước.');
            return;
        }

        const previewWindow = window.open('about:blank', '_blank');
        if (previewWindow) {
            previewWindow.document.write(previewSkeletonDocument);
            previewWindow.document.close();
        }

        try {
            const previewValues = await prepareTemplateForPreview(values);
            await savePreviewInvitationTemplate({ ...previewValues, id: selectedId, status: 'draft' });
            if (previewWindow) {
                previewWindow.opener = null;
                previewWindow.location.href = '/hy-sac-vu-qui?preview=1';
                return;
            }

            setSaveStatus('Đã tạo bản xem trước. Trình duyệt đang chặn tab mới, vui lòng cho phép popup rồi bấm lại.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tạo bản xem trước.';
            if (previewWindow) {
                previewWindow.document.body.innerHTML = `<main style="font-family:system-ui;padding:32px;line-height:1.5"><h1 style="font-size:20px">Không thể tạo bản xem trước</h1><p>${message}</p></main>`;
            }
            setSaveStatus(`${message} Vui lòng thử lại hoặc giảm dung lượng ảnh.`);
        }
    });

    const handlePublish = handleSubmit((values) => {
        persistTemplate(values, 'draft', 'Đã xuất bản.', true);
    });

    const handleFinish = handleSubmit((values) => {
        if (cardStatus === 'active') {
            persistTemplate(values, 'active', 'Đã hoàn tất chỉnh sửa thiệp!');
            return;
        }

        persistTemplate(values, 'draft', 'Đã lưu bản nháp thành công!', true);
    });

    const handleEventDateChange = (dateValue: string) => {
        const nextDate = dateValue || getTodayDateInput();
        setValue('event.date', toEventDate(nextDate, eventTime), { shouldDirty: true });
        setValue('event.dayName', getDayName(nextDate), { shouldDirty: true });
        setValue('event.day', nextDate.slice(8, 10), { shouldDirty: true });
        setValue('event.month', nextDate.slice(5, 7), { shouldDirty: true });
        setValue('event.year', nextDate.slice(0, 4), { shouldDirty: true });
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

        const fallbackDate = eventDate || getTodayDateInput();
        setEventDateText(formatDateDisplay(fallbackDate));
        handleEventDateChange(fallbackDate);
    };

    const handleDatePickerClick = () => {
        const input = dateInputRef.current;

        if (!input) {
            return;
        }

        const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
        if (pickerInput.showPicker) {
            pickerInput.showPicker();
            return;
        }

        input.focus();
        input.click();
    };

    const handleEventTimeChange = (timeValue: string) => {
        const nextTime = timeValue || '00:00';
        setValue('event.date', toEventDate(eventDate, nextTime), { shouldDirty: true });
        setValue('event.time', nextTime.replace(':', ' gi\u1EDD '), { shouldDirty: true });
    };

    const handleMapUrlChange = (mapValue: string) => {
        setValue('event.mapUrl', normalizeMapInput(mapValue), { shouldDirty: true });
    };

    const handleMapUrlBlur = (mapValue: string) => {
        setValue('event.mapUrl', toGoogleMapEmbedUrl(mapValue), { shouldDirty: true, shouldTouch: true });
    };

    const handleVenueToggle = (_checked: boolean) => undefined;

    const handlePresetColor = (preset: typeof colorPresets[number]) => {
        setValue('design.primaryColor', preset.primary, { shouldDirty: true });
        setValue('design.backgroundColor', preset.background, { shouldDirty: true });
        setValue('design.accentColor', preset.accent, { shouldDirty: true });
    };

    const requestImage = (target: UploadTarget) => {
        setImageError('');
        if (saveStatus.includes('Vui lòng chọn')) {
            setSaveStatus('');
        }
        setUploadTarget(target);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadTarget) {
            return;
        }

        const existingPreview = getValues(uploadTarget as ImageField);
        if (typeof existingPreview === 'string' && isLocalPreviewImage(existingPreview)) {
            URL.revokeObjectURL(existingPreview);
            previewUrlsRef.current.delete(existingPreview);
        }
        const result = URL.createObjectURL(file);
        previewUrlsRef.current.add(result);
        pendingImageFilesRef.current.set(uploadTarget, file);

        if (uploadTarget.startsWith('images.gallery.')) {
            const index = Number(uploadTarget.split('.').pop());
            const nextGallery = [...getGallery(getValues())];
            const oldGalleryPreview = nextGallery[index];
            if (oldGalleryPreview && isLocalPreviewImage(oldGalleryPreview)) {
                URL.revokeObjectURL(oldGalleryPreview);
                previewUrlsRef.current.delete(oldGalleryPreview);
            }
            nextGallery[index] = result;
            setValue(`images.gallery.${index}` as `images.gallery.${number}`, result, { shouldDirty: true, shouldTouch: true });
            setValue('images.gallery', nextGallery, { shouldDirty: true, shouldTouch: true });
        } else {
            setValue(uploadTarget, result, { shouldDirty: true, shouldTouch: true });
        }

        setSaveStatus('');
        setImageError('');
        setUploadTarget(null);
        event.target.value = '';
    };

    const addGalleryImage = () => {
        const gallery = getGallery(getValues());
        setUploadTarget(`images.gallery.${gallery.length}`);
        fileInputRef.current?.click();
    };

    const deleteGalleryImage = (index: number) => {
        const gallery = getGallery(getValues());
        const nextGallery = [...gallery];
        nextGallery.splice(index, 1);
        setValue('images.gallery', nextGallery, { shouldDirty: true, shouldTouch: true });
    };

    return (
        <main className="td-page">
            <input ref={fileInputRef} className="td-file-input" type="file" accept="image/*" onChange={handleFileChange} />
            {isSaving && (
                <div className="td-saving-overlay" role="status" aria-live="polite" aria-busy="true">
                    <div className="td-saving-dialog">
                        <span className="td-saving-spinner" aria-hidden="true" />
                        <strong>{saveStatus || 'Đang xử lý thiệp...'}</strong>
                        <p>Vui lòng giữ nguyên trang cho đến khi hoàn tất.</p>
                    </div>
                </div>
            )}

            <section className="td-canvas">
                <div className="td-live-preview">
                    <EmeraldInvitation template={previewTemplate} preview onImageClick={(target) => requestImage(target as UploadTarget)} />
                </div>

                <div className="td-floating-colors" aria-label="Chọn màu nhanh">
                </div>

                <p className="td-helper">Cuộn trong khung thiệp để xem toàn bộ nội dung. Bấm trực tiếp vào ảnh để thay ảnh.</p>
            </section>

            <aside className="td-editor-panel">
                {/* <div className="td-panel-head">
                    <div>

                        <h1>Chỉnh sửa thông tin</h1>
                    </div>
                    <ChevronDown size={18} />
                </div> */}

                <div className="td-panel-actions">
                    <button type="button" onClick={handleOpenPreview}>
                        <Eye size={18} />
                        Xem trước
                    </button>
                    <button className="is-publish" type="button" disabled={isSaving} onClick={handleFinish}>
                        {isSaving ? <Loader2 size={18} className="td-spin" /> : <Check size={18} />}
                        Hoàn tất
                    </button>
                </div>

                {saveStatus && (
                    <p className={`td-save-status ${saveStatus.includes('tồn tại') || saveStatus.startsWith('Không thể') || saveStatus.startsWith('Vui lòng') ? 'is-error' : ''}`}>
                        {saveStatus}
                    </p>
                )}

                <form onSubmit={handlePublish}>
                    <div className="td-field">
                        <label>Đường dẫn ngắn</label>
                        <small>Dùng để truy cập đến URL của thiệp của bạn.</small>
                        <input
                            {...register('slug', {
                                onChange: () => {
                                    setSlugError('');
                                    if (saveStatus.includes('URL đã tồn tại')) {
                                        setSaveStatus('');
                                    }
                                },
                            })}
                            className={slugError ? 'is-error' : ''}
                            aria-invalid={Boolean(slugError)}
                            aria-describedby={slugError ? 'td-slug-error' : undefined}
                            placeholder="van-bach-khanh-ly"
                        />
                        {slugError && <strong className="td-field-error" id="td-slug-error">{slugError}</strong>}
                    </div>
                    <div className="td-field">
                        <label>Tên chú rể</label>
                        <input {...register('couple.groom')} />
                    </div>
                    <div className="td-field">
                        <label>Tên cô dâu</label>
                        <input {...register('couple.bride')} />
                    </div>
                    <div className="td-field-grid">
                        <div className="td-field">
                            <label>Ngày cưới</label>
                            <div className="td-date-input-row">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="dd/mm/yyyy"
                                    value={eventDateText}
                                    onChange={(event) => handleEventDateTextChange(event.target.value)}
                                    onBlur={handleEventDateTextBlur}
                                />
                                <button className="td-date-picker-button" type="button" aria-label="Chọn ngày cưới" onClick={handleDatePickerClick}>
                                    <CalendarDays size={18} />
                                </button>
                                <input
                                    ref={dateInputRef}
                                    className="td-native-date-input"
                                    type="date"
                                    value={eventDate}
                                    onChange={(event) => handleEventDateChange(event.target.value)}
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                        <div className="td-field">
                            <label>Giờ tổ chức</label>
                            <input type="time" value={eventTime} onChange={(event) => handleEventTimeChange(event.target.value)} />
                        </div>
                    </div>
                    <div className="td-field">
                        <label className="td-check-label">
                            Địa điểm
                            <input
                                type="checkbox"
                                checked={isVenueEnabled}
                                onChange={(event) => handleVenueToggle(event.target.checked)}
                                aria-label="Hiển thị địa điểm"
                            />
                        </label>
                        <input
                            value={previewTemplate.event?.venue || ''}
                            disabled={!isVenueEnabled}
                            placeholder={isVenueEnabled ? '' : 'Đã ẩn địa điểm'}
                            onChange={(event) => setValue('event.venue', event.target.value, { shouldDirty: true, shouldTouch: true })}
                        />
                    </div>
                    <div className="td-field">
                        <label>Địa chỉ</label>
                        <input {...register('event.address')} />
                    </div>
                    <div className="td-field td-map-field">
                        <label>Bản đồ (iframe)</label>
                        <div className="td-map-input-row">
                            <input
                                value={previewTemplate.event?.mapUrl || ''}
                                onChange={(event) => handleMapUrlChange(event.target.value)}
                                onBlur={(event) => handleMapUrlBlur(event.target.value)}
                                placeholder="Dán link Google Maps hoặc nhập địa chỉ"
                            />
                            <button type="button" aria-label="Xem chi tiết địa điểm" onClick={() => setIsMapDetailOpen(true)} disabled={!mapDetailUrl}>
                                <Eye size={18} />
                            </button>
                        </div>
                        <a className="td-map-guide-link" href={mapGuideYoutubeUrl} target="_blank" rel="noreferrer">
                            Xem hướng dẫn
                        </a>
                    </div>


                    <div className="td-image-row-head">
                        <label>Ảnh</label>
                        <span>{galleryImages.length} ảnh album</span>
                    </div>
                    {imageError && <strong className="td-field-error td-image-error">{imageError}</strong>}
                    <div className={`td-image-strip ${imageError ? 'is-error' : ''}`}>
                        <button type="button" className="td-add-image" onClick={addGalleryImage}>
                            <Plus size={24} />
                            <span>Thêm ảnh</span>
                        </button>
                        {galleryImages.map((image, index) => (
                            <div key={`${image}-${index}`} className="td-gallery-thumbnail-container" style={{ position: 'relative', width: '88px', height: '76px' }}>
                                <button type="button" onClick={() => requestImage(`images.gallery.${index}`)} style={{ width: '100%', height: '100%', display: 'block' }}>
                                    <img src={image} alt={`Album ${index + 1}`} />
                                </button>
                                {index >= 4 && (
                                    <button
                                        type="button"
                                        className="td-delete-gallery-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteGalleryImage(index);
                                        }}
                                        aria-label="Xóa ảnh"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="td-field td-font-field">
                        <label>Chọn font tên cô dâu chú rể</label>
                        <select
                            {...register('design.scriptFont')}
                            style={{ '--td-selected-font': `'${previewTemplate.design?.scriptFont || 'Allura'}', cursive` } as React.CSSProperties}
                        >
                            {fontOptions.map((font) => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>

                    <div className="td-color-field">
                        <label>Chọn màu chủ đạo</label>
                        <div>
                            {colorPresets.map((preset) => (
                                <button key={preset.key} type="button" onClick={() => handlePresetColor(preset)}>
                                    <span style={{ background: `linear-gradient(135deg, ${preset.primary} 0 58%, ${preset.accent} 59%)` }} />
                                </button>
                            ))}
                        </div>
                    </div>

                </form>
            </aside>

            {isMapDetailOpen && (
                <div className="td-map-detail-backdrop" role="presentation" onClick={() => setIsMapDetailOpen(false)}>
                    <section
                        className="td-map-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="td-map-detail-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="td-map-detail-head">
                            <div>
                                <MapPin size={20} />
                                <h2 id="td-map-detail-title">Chi tiết địa điểm</h2>
                            </div>
                            <button type="button" aria-label="Đóng bản đồ" onClick={() => setIsMapDetailOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <iframe title="Chi tiết địa điểm Google Map" src={mapDetailUrl} loading="lazy" />
                    </section>
                </div>
            )}

            {validationErrorModal && (
                <div className="td-map-detail-backdrop" role="presentation" onClick={() => setValidationErrorModal('')}>
                    <section
                        className="td-map-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="td-validation-error-title"
                        onClick={(event) => event.stopPropagation()}
                        style={{ maxWidth: '440px', background: '#fffdf8' }}
                    >
                        <div className="td-map-detail-head">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <X size={20} style={{ color: '#d32f2f' }} />
                                <h2 id="td-validation-error-title" style={{ color: '#d32f2f', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Lưu ý</h2>
                            </div>
                            <button type="button" aria-label="Đóng thông báo" onClick={() => setValidationErrorModal('')}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '22px 24px', lineHeight: '1.6', fontSize: '15px', color: '#2d4b45' }}>
                            <p style={{ margin: '0 0 24px 0' }}>{validationErrorModal}</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setValidationErrorModal('')}
                                    style={{
                                        padding: '8px 24px',
                                        backgroundColor: '#2d4b45',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

        </main>
    );
}

export default TemplateDashboard;
