import { CSSProperties, ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react';
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
    Music2,
    Plus,
    Save,
    Upload,
    UsersRound,
    Trash2,
    Play,
    Pause,
    Maximize2,
    X,
    Users,
} from 'lucide-react';
import PinkWeddingInvitation, {
    PinkWeddingInvitationData,
    defaultPinkWeddingInvitationData,
    emptyPinkWeddingInvitationData,
    EditablePinkImageTarget,
} from './PinkWeddingInvitation';
import { savePinkPreview } from '../data/invitationTemplates';
import { MyWeddingCardResponse } from '../models/wedding-card.model';
import { authTokenService } from '../services/auth-token.service';
import { weddingCardService } from '../services/wedding-card.service';
import { previewSkeletonDocument } from '../utils/preview-skeleton';
import './PinkWeddingInvitationEditor.css';

type ImageTarget = EditablePinkImageTarget;
type FamilyMemberField = 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother';

const defaultFamilyMembers: Record<FamilyMemberField, string> = {
    groomFather: defaultPinkWeddingInvitationData.groomFather,
    groomMother: defaultPinkWeddingInvitationData.groomMother,
    brideFather: defaultPinkWeddingInvitationData.brideFather,
    brideMother: defaultPinkWeddingInvitationData.brideMother,
};

function cloneData(data: PinkWeddingInvitationData): PinkWeddingInvitationData {
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

async function resolveLocalImages(data: PinkWeddingInvitationData): Promise<PinkWeddingInvitationData> {
    const next = cloneData(data);
    const imageKeys = ['cover', 'portraitOne', 'portraitTwo', 'embrace', 'letterCenter', 'kiss', 'groomQr', 'brideQr'] as const;

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

function toSaveRequest(data: PinkWeddingInvitationData, status: 'draft' | 'active') {
    const galleryMedia = data.images.gallery
        .map((imgUrl, index) => ({ slotKey: `images.gallery.${index}`, imgUrl, number: 100 + index }))
        .filter((item) => item.imgUrl && !item.imgUrl.startsWith('blob:') && !item.imgUrl.startsWith('data:'));

    const singleMedia = [
        { slotKey: 'images.cover', imgUrl: data.images.cover, number: 1 },
        { slotKey: 'images.portraitOne', imgUrl: data.images.portraitOne, number: 2 },
        { slotKey: 'images.portraitTwo', imgUrl: data.images.portraitTwo, number: 3 },
        { slotKey: 'images.embrace', imgUrl: data.images.embrace, number: 4 },
        { slotKey: 'images.letterCenter', imgUrl: data.images.letterCenter, number: 5 },
        { slotKey: 'images.kiss', imgUrl: data.images.kiss, number: 6 },
        { slotKey: 'images.groomQr', imgUrl: data.images.groomQr, number: 10 },
        { slotKey: 'images.brideQr', imgUrl: data.images.brideQr, number: 11 },
    ].filter((item) => item.imgUrl && !item.imgUrl.startsWith('blob:') && !item.imgUrl.startsWith('data:'));

    return {
        templateCode: 'PinkWeddingInvitation' as const,
        slug: data.slug || '',
        status,
        design: { primaryColor: '#ff5c8a', dropEffect: 'none' },
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
            guestList: data.guestList || '',
        },
        musicTrack: data.musicTrack?.fileUrl ? {
            fileUrl: data.musicTrack.fileUrl,
            timeStart: Math.max(0, Number(data.musicTrack.timeStart || 0)),
        } : null,
        media: [...singleMedia, ...galleryMedia],
    };
}

function fromApiCard(card: MyWeddingCardResponse, fallback: PinkWeddingInvitationData): PinkWeddingInvitationData {
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
        groomIntroName: groom?.fullName || fallback.groomIntroName,
        brideIntroName: bride?.fullName || fallback.brideIntroName,
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
        guestList: event?.guestList || fallback.guestList || '',
        showGroomGift: Boolean(groomQr),
        showBrideGift: Boolean(brideQr),
        showGiftSection: Boolean(groomQr || brideQr),
        musicTrack: card.musicTrack?.fileUrl ? {
            fileUrl: card.musicTrack.fileUrl,
            timeStart: Math.max(0, Number(card.musicTrack.timeStart || 0)),
        } : null,
        images: {
            cover: mediaBySlot.get('images.cover') || fallback.images.cover,
            portraitOne: mediaBySlot.get('images.portraitOne') || fallback.images.portraitOne,
            portraitTwo: mediaBySlot.get('images.portraitTwo') || fallback.images.portraitTwo,
            embrace: mediaBySlot.get('images.embrace') || fallback.images.embrace,
            letterCenter: mediaBySlot.get('images.letterCenter') || fallback.images.letterCenter,
            kiss: mediaBySlot.get('images.kiss') || fallback.images.kiss,
            groomQr: groomQr,
            brideQr: brideQr,
            gallery: gallery.length ? [...gallery, ...Array(Math.max(0, 9 - gallery.length)).fill('')] : fallback.images.gallery,
        },
    };
}

async function uploadLocalImages(data: PinkWeddingInvitationData, onProgress: (msg: string) => void): Promise<PinkWeddingInvitationData> {
    const next = cloneData(data);
    const singleKeys = ['cover', 'portraitOne', 'portraitTwo', 'embrace', 'letterCenter', 'kiss', 'groomQr', 'brideQr'] as const;
    const allEntries: Array<{ key: string; url: string; isGallery: boolean; index?: number }> = [
        ...singleKeys
            .filter((k) => next.images[k]?.startsWith('blob:'))
            .map((k) => ({ key: k, url: next.images[k], isGallery: false })),
        ...next.images.gallery
            .map((url, i) => ({ key: String(i), url, isGallery: true, index: i }))
            .filter((entry) => entry.url?.startsWith('blob:')),
    ];

    if (allEntries.length > 0) {
        onProgress('Đang lưu ảnh...');
    }

    const uploaded = await Promise.all(
        allEntries.map(async (entry) => ({
            ...entry,
            uploadedUrl: await weddingCardService.uploadImage(await fetchBlob(entry.url)),
        })),
    );

    if (next.musicTrack?.fileUrl?.startsWith('blob:')) {
        onProgress('Đang tải nhạc...');
        const uploadedUrl = await weddingCardService.uploadFile(await fetchBlob(next.musicTrack.fileUrl, 'music.mp3'));
        next.musicTrack = {
            ...next.musicTrack,
            fileUrl: uploadedUrl,
        };
    }

    uploaded.forEach(({ key, isGallery, index, uploadedUrl }) => {
        if (isGallery && index !== undefined) {
            next.images.gallery[index] = uploadedUrl;
        } else {
            (next.images as unknown as Record<string, string>)[key] = uploadedUrl;
        }
    });

    return next;
}

async function fetchBlob(url: string, fallbackName = 'upload.jpg'): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fallbackName, { type: blob.type || 'application/octet-stream' });
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

function formatAudioTime(totalSeconds: number) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = String(safeSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function extractMapIframeSrc(value: string) {
    const match = value.match(/src=["']([^"']+)["']/i);
    return match?.[1]?.trim() || value;
}

function normalizeMapInput(value: string) {
    const trimmedValue = value.trim();
    return trimmedValue.toLowerCase().includes('<iframe') ? extractMapIframeSrc(trimmedValue) : value;
}

function PinkWeddingInvitationEditor() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [draft, setDraft] = useState<PinkWeddingInvitationData>(() => cloneData(emptyPinkWeddingInvitationData));
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [validationAlert, setValidationAlert] = useState<{ title: string; message: string; missingImages?: Array<'cover' | 'portraitOne' | 'portraitTwo' | 'embrace' | 'letterCenter' | 'kiss' | 'gallery'> } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [slugError, setSlugError] = useState('');
    const [cardStatus, setCardStatus] = useState<'draft' | 'active'>('draft');
    const [hasPersistedCard, setHasPersistedCard] = useState(false);
    const [musicDuration, setMusicDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
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
    const musicInputRef = useRef<HTMLInputElement | null>(null);
    const galleryStripRef = useRef<HTMLDivElement | null>(null);
    const uploadTargetRef = useRef<ImageTarget>('images.cover');
    const shouldInsertGalleryImageRef = useRef(false);
    const shouldScrollGalleryEndRef = useRef(false);
    const objectUrlsRef = useRef<string[]>([]);
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const familyMemberBackupRef = useRef<Record<FamilyMemberField, string>>({ ...defaultFamilyMembers });
    const isFamilyMemberEnabled = (field: FamilyMemberField) => draft[field].trim().length > 0;
    const selectedMusicStart = Math.max(0, Number(draft.musicTrack?.timeStart || 0));
    const musicTimelineMax = Math.max(musicDuration, selectedMusicStart, 1);
    const musicTimelineProgress = `${Math.min(100, (selectedMusicStart / musicTimelineMax) * 100)}%`;

    const handleFamilyMemberEnabledChange = (field: FamilyMemberField, checked: boolean) => {
        setDraft((current) => {
            if (!checked) {
                familyMemberBackupRef.current[field] = current[field] || familyMemberBackupRef.current[field];
                return { ...current, [field]: '' };
            }

            return {
                ...current,
                [field]: current[field] || familyMemberBackupRef.current[field] || defaultFamilyMembers[field],
            };
        });
    };
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
                const loaded = fromApiCard(card, defaultPinkWeddingInvitationData);
                setDraft(loaded);
                setEventDateText(formatDateDisplay(loaded.eventDate));
                setWeddingId(card.weddingId);
                setCardStatus(card.status);
                setHasPersistedCard(true);
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

    const updateField = (field: keyof PinkWeddingInvitationData, value: string) => {
        setDraft((current) => {
            const next = { ...current, [field]: value };
            if (field === 'groomName' && current.groomIntroName === current.groomName) {
                next.groomIntroName = value;
            }
            if (field === 'brideName' && current.brideIntroName === current.brideName) {
                next.brideIntroName = value;
            }
            return next;
        });
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

    const deleteGalleryImage = (index: number) => {
        setDraft((current) => {
            const nextGallery = [...current.images.gallery];
            nextGallery.splice(index, 1);
            while (nextGallery.length < 9) {
                nextGallery.push('');
            }
            return {
                ...current,
                images: {
                    ...current.images,
                    gallery: nextGallery,
                },
            };
        });
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

            const key = target.replace('images.', '') as Exclude<keyof PinkWeddingInvitationData['images'], 'gallery'>;
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

    const handleMusicFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        setDraft((current) => ({
            ...current,
            musicTrack: {
                fileUrl: url,
                timeStart: Math.max(0, Number(current.musicTrack?.timeStart || 0)),
            },
        }));
        event.target.value = '';
    };

    const updateMusicStart = (value: number) => {
        const maxStart = musicDuration > 0 ? musicDuration : Number.MAX_SAFE_INTEGER;
        const timeStart = Math.min(maxStart, Math.max(0, Math.floor(Number(value) || 0)));
        setDraft((current) => ({
            ...current,
            musicTrack: current.musicTrack?.fileUrl
                ? { ...current.musicTrack, timeStart }
                : { fileUrl: '', timeStart },
        }));
        if (audioRef.current) {
            audioRef.current.currentTime = timeStart;
        }
    };

    const toggleMusicPreview = async () => {
        const audio = audioRef.current;
        if (!audio || !draft.musicTrack?.fileUrl) {
            return;
        }

        if (audio.paused) {
            const timeStart = Math.max(0, Number(draft.musicTrack.timeStart || 0));
            audio.currentTime = timeStart;
            try {
                await audio.play();
                setIsMusicPlaying(true);
            } catch (error) {
                console.error('Failed to play audio preview:', error);
                setIsMusicPlaying(false);
            }
        } else {
            audio.pause();
            setIsMusicPlaying(false);
        }
    };

    useEffect(() => {
        setIsMusicPlaying(false);
    }, [draft.musicTrack?.fileUrl]);

    const handleMusicMetadataLoaded = (event: SyntheticEvent<HTMLAudioElement>) => {
        const duration = Number.isFinite(event.currentTarget.duration)
            ? Math.floor(event.currentTarget.duration)
            : 0;
        setMusicDuration(duration);
        if (duration <= 0) {
            return;
        }

        setDraft((current) => {
            if (!current.musicTrack?.fileUrl || Number(current.musicTrack.timeStart || 0) <= duration) {
                return current;
            }

            return {
                ...current,
                musicTrack: {
                    ...current.musicTrack,
                    timeStart: duration,
                },
            };
        });
    };

    const validateRequiredImages = (): boolean => {
        const requiredImages: Array<{ key: 'cover' | 'portraitOne' | 'portraitTwo' | 'embrace' | 'letterCenter' | 'kiss'; label: string }> = [
            { key: 'cover', label: 'Ảnh bìa sổ lưu niệm' },
            { key: 'portraitOne', label: 'Ảnh chú rể' },
            { key: 'portraitTwo', label: 'Ảnh cô dâu' },
            { key: 'embrace', label: 'Ảnh thư mời 1' },
            { key: 'letterCenter', label: 'Anh thu moi 2' },
            { key: 'kiss', label: 'Ảnh thư mời 3' },
        ];

        const missingRequiredImages = requiredImages.filter(({ key }) => !draft.images[key]);
        const galleryCount = draft.images.gallery.filter(Boolean).length;
        const missingGallery = galleryCount < 4;

        const missingKeys: Array<'cover' | 'portraitOne' | 'portraitTwo' | 'embrace' | 'letterCenter' | 'kiss' | 'gallery'> = [
            ...missingRequiredImages.map(({ key }) => key),
            ...(missingGallery ? (['gallery'] as const) : []),
        ];

        if (missingKeys.length > 0) {
            setValidationAlert({
                title: 'Thiếu ảnh bắt buộc',
                message: '',
                missingImages: missingKeys as any,
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
                .then((previewData) => savePinkPreview(previewData))
                .then(() => {
                    if (previewWindow) {
                        previewWindow.opener = null;
                        previewWindow.location.href = '/hoa-hao-nguyet-vien?preview=1';
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
            setHasPersistedCard(true);

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
        <main className="pwie-page">
            <input ref={fileInputRef} className="pwie-file-input" type="file" accept="image/*" onChange={handleFileChange} />
            <input ref={musicInputRef} className="pwie-file-input" type="file" accept="audio/*" onChange={handleMusicFileChange} />

            <section className="pwie-preview">
                <div className="pwie-phone-frame">
                    <PinkWeddingInvitation
                        data={draft}
                        editable
                        onImageClick={requestImage}
                        onImageDelete={(index) => {
                            setDraft((current) => {
                                const nextGallery = [...current.images.gallery];
                                nextGallery.splice(index, 1);
                                while (nextGallery.length < 9) {
                                    nextGallery.push('');
                                }
                                return {
                                    ...current,
                                    images: {
                                        ...current.images,
                                        gallery: nextGallery,
                                    },
                                };
                            });
                        }}
                    />
                </div>
            </section>

            <aside className="pwie-editor">
                <div className={`pwie-actions${!hasPersistedCard ? ' has-save-draft' : ''}`}>
                    {!hasPersistedCard ? (
                        <>
                            <button type="button" disabled={isSaving} onClick={() => handleValidateAndAction('Xem trước')}>
                                <Eye size={17} />
                                Xem trước
                            </button>
                            <button type="button" disabled={isSaving} onClick={() => persistDraft('draft')}>
                                {isSaving ? <Loader2 size={17} className="pwie-spin" /> : <Save size={17} />}
                                Bản nháp
                            </button>
                            <button className="is-primary" type="button" disabled={isSaving} onClick={handleFinish}>
                                {isSaving ? <Loader2 size={17} className="pwie-spin" /> : <Check size={17} />}
                                Xuất bản
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" disabled={isSaving} onClick={() => handleValidateAndAction('Xem trước')}>
                                <Eye size={17} />
                                Xem trước
                            </button>
                            <button className="is-primary" type="button" disabled={isSaving} onClick={handleFinish}>
                                {isSaving ? <Loader2 size={17} className="clve-spin" /> : <Check size={17} />}
                                Hoàn tất
                            </button>
                        </>
                    )}
                </div>

                {saveStatus && (
                    <div className={`pwie-save-status${isSaving ? ' is-loading' : ''}`}>
                        {isSaving && (
                            <div role="status">
                                <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                        {saveStatus}
                    </div>
                )}

                <header className="pwie-header">
                    <span>Chỉnh sửa thiệp</span>
                    <h1>Hoa Hảo Nguyệt Viên</h1>
                    <p>Thay đổi nội dung bên dưới sẽ cập nhật trực tiếp trên khung preview.</p>
                </header>

                <form className="pwie-form">
                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <LinkIcon size={18} />
                            <h2>Đường dẫn ngắn</h2>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 12px' }}>
                            Dùng để truy cập đến URL của thiệp của bạn.
                        </p>
                        <div className="pwie-field">
                            <input
                                value={draft.slug}
                                placeholder="vi-du-nguyen-van-a"
                                onChange={(event) => updateField('slug', event.target.value)}
                            />
                            {slugError && <span className="pwie-field__error">{slugError}</span>}
                        </div>
                    </section>
                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <Users size={18} />
                            <h2>Danh sách khách mời</h2>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 12px' }}>
                            Nhập danh sách khách mời của bạn, mỗi dòng tương ứng với một người. Hệ thống sẽ tự tạo link riêng gửi cho từng người.
                        </p>
                        <div className="pwie-field">
                            <textarea
                                value={draft.guestList || ''}
                                rows={5}
                                placeholder={"Ví dụ:\nAnh Tài Phạm\nChị Khánh Vy\nAnh Dũng"}
                                onChange={(event) => updateField('guestList', event.target.value)}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', width: '100%', fontFamily: 'system-ui' }}
                            />
                        </div>
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <UsersRound size={18} />
                            <h2>Thông tin Cô Dâu & Chú Rể</h2>
                        </div>

                        <div className="pwie-grid-2">
                            <label className="pwie-field">
                                <span>Tên chú rể đầu thiệp</span>
                                <input
                                    value={draft.groomName}
                                    placeholder="Tên Chú rể"
                                    onChange={(event) => updateField('groomName', event.target.value)}
                                />
                            </label>
                            <label className="pwie-field">
                                <span>Tên cô dâu đầu thiệp</span>
                                <input
                                    value={draft.brideName}
                                    placeholder="Tên Cô dâu"
                                    onChange={(event) => updateField('brideName', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="pwie-grid-2">
                            <label className="pwie-field">
                                <span>Tên Chú rể (giữa thiệp)</span>
                                <input
                                    value={draft.groomIntroName}
                                    placeholder="Họ tên chú rể"
                                    onChange={(event) => updateField('groomIntroName', event.target.value)}
                                />
                            </label>
                            <label className="pwie-field">
                                <span>Tên Cô dâu (giữa thiệp)</span>
                                <input
                                    value={draft.brideIntroName}
                                    placeholder="Họ tên cô dâu"
                                    onChange={(event) => updateField('brideIntroName', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="pwie-grid-2">
                            <label className="pwie-field">
                                <span className="pwie-field-check-head">
                                    <input
                                        type="checkbox"
                                        checked={isFamilyMemberEnabled('groomFather')}
                                        onChange={(event) => handleFamilyMemberEnabledChange('groomFather', event.target.checked)}
                                    />
                                    Họ tên bố chú rể
                                </span>
                                <input
                                    value={draft.groomFather}
                                    placeholder="Ví dụ: Ông Trần Quốc Tuấn"
                                    disabled={!isFamilyMemberEnabled('groomFather')}
                                    onChange={(event) => updateField('groomFather', event.target.value)}
                                />
                            </label>
                            <label className="pwie-field">
                                <span className="pwie-field-check-head">
                                    <input
                                        type="checkbox"
                                        checked={isFamilyMemberEnabled('groomMother')}
                                        onChange={(event) => handleFamilyMemberEnabledChange('groomMother', event.target.checked)}
                                    />
                                    Họ tên mẹ chú rể
                                </span>
                                <input
                                    value={draft.groomMother}
                                    placeholder="Ví dụ: Bà Lê Thị Mỹ Duyên"
                                    disabled={!isFamilyMemberEnabled('groomMother')}
                                    onChange={(event) => updateField('groomMother', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="pwie-grid-2">
                            <label className="pwie-field">
                                <span className="pwie-field-check-head">
                                    <input
                                        type="checkbox"
                                        checked={isFamilyMemberEnabled('brideFather')}
                                        onChange={(event) => handleFamilyMemberEnabledChange('brideFather', event.target.checked)}
                                    />
                                    Họ tên bố cô dâu
                                </span>
                                <input
                                    value={draft.brideFather}
                                    placeholder="Ví dụ: Ông Phạm Gia Long"
                                    disabled={!isFamilyMemberEnabled('brideFather')}
                                    onChange={(event) => updateField('brideFather', event.target.value)}
                                />
                            </label>
                            <label className="pwie-field">
                                <span className="pwie-field-check-head">
                                    <input
                                        type="checkbox"
                                        checked={isFamilyMemberEnabled('brideMother')}
                                        onChange={(event) => handleFamilyMemberEnabledChange('brideMother', event.target.checked)}
                                    />
                                    Họ tên mẹ cô dâu
                                </span>
                                <input
                                    value={draft.brideMother}
                                    placeholder="Ví dụ: Bà Nguyễn Thị Ngọc Hạnh"
                                    disabled={!isFamilyMemberEnabled('brideMother')}
                                    onChange={(event) => updateField('brideMother', event.target.value)}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <CalendarDays size={18} />
                            <h2>Ngày giờ & Địa điểm tổ chức</h2>
                        </div>

                        <div className="pwie-grid-2">
                            <label className="pwie-field">
                                <span>Ngày tổ chức</span>
                                <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
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
                                        aria-label="Chọn ngày tổ chức"
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
                            <label className="pwie-field">
                                <span>Giờ tổ chức</span>
                                <input
                                    type="time"
                                    value={draft.eventTime}
                                    onChange={(event) => updateField('eventTime', event.target.value)}
                                />
                            </label>
                        </div>

                        <label className="pwie-field">
                            <span>Tại địa điểm</span>
                            <input
                                value={draft.venueName}
                                placeholder="Ví dụ: Adora Center - Phú Nhuận"
                                onChange={(event) => updateField('venueName', event.target.value)}
                            />
                        </label>

                        <label className="pwie-field">
                            <span>Địa chỉ cụ thể</span>
                            <input
                                value={draft.address}
                                placeholder="Số nhà, tên đường, quận, thành phố"
                                onChange={(event) => updateField('address', event.target.value)}
                            />
                        </label>
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <Music2 size={18} />
                            <h2>Nhạc nền</h2>
                        </div>

                        <div className="pwie-music-picker">
                            <button type="button" onClick={() => musicInputRef.current?.click()}>
                                <Music2 size={18} />
                                <span>{draft.musicTrack?.fileUrl ? 'Đổi nhạc' : 'Chọn nhạc'}</span>
                            </button>

                        </div>

                        {draft.musicTrack?.fileUrl && (
                            <>
                                <audio
                                    ref={audioRef}
                                    src={draft.musicTrack.fileUrl}
                                    preload="metadata"
                                    onLoadedMetadata={handleMusicMetadataLoaded}
                                    onDurationChange={handleMusicMetadataLoaded}
                                    onEnded={() => setIsMusicPlaying(false)}
                                />
                                <div className="pwie-music-timeline-wrapper">
                                    <div className="pwie-music-timeline">
                                        <span>{formatAudioTime(selectedMusicStart)}</span>
                                        <label
                                            className="pwie-music-range"
                                            style={{ '--pwie-music-progress': musicTimelineProgress } as CSSProperties}
                                        >
                                            <span className="sr-only">Chọn vị trí bắt đầu phát nhạc</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max={musicTimelineMax}
                                                step="1"
                                                value={Math.min(selectedMusicStart, musicTimelineMax)}
                                                onChange={(event) => updateMusicStart(Number(event.target.value))}
                                            />
                                        </label>
                                        <strong>{formatAudioTime(musicDuration || musicTimelineMax)}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="pwie-music-expand-btn"
                                        onClick={() => setIsMusicModalOpen(true)}
                                        title="Phóng to"
                                        aria-label="Phóng to trình cắt nhạc"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                </div>
                                <div className="pwie-music-controls">
                                    <button
                                        type="button"
                                        className={`pwie-music-play-circle${isMusicPlaying ? ' is-playing' : ''}`}
                                        onClick={toggleMusicPreview}
                                        aria-label={isMusicPlaying ? 'Tạm dừng nghe thử' : 'Phát nghe thử'}
                                    >
                                        {isMusicPlaying ? (
                                            <Pause size={18} fill="currentColor" />
                                        ) : (
                                            <Play size={18} fill="currentColor" style={{ transform: 'translateX(1px)' }} />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="pwie-music-remove"
                                        onClick={() => {
                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                            }
                                            setIsMusicPlaying(false);
                                            setMusicDuration(0);
                                            setDraft((current) => ({ ...current, musicTrack: null }));
                                        }}
                                    >
                                        Bỏ nhạc nền
                                    </button>
                                </div>
                            </>
                        )}

                        {!draft.musicTrack?.fileUrl && (
                            <div className="pwie-music-empty">
                                <input
                                    readOnly
                                    tabIndex={-1}
                                    value="Chưa chọn nhạc"
                                    aria-label="Trạng thái nhạc nền"
                                />
                            </div>
                        )}
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <MapPin size={18} />
                            <h2>Bản đồ chỉ đường</h2>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 12px' }}>
                            Dán liên kết từ Google Maps hoặc mã nhúng bản đồ vào ô dưới.
                        </p>
                        <label className="pwie-field">
                            <span>Bản đồ (iframe)</span>
                            <textarea
                                value={draft.mapUrl}
                                rows={3}
                                placeholder="Ví dụ: https://maps.app.goo.gl/... hoặc dán mã nhúng bản đồ"
                                onChange={(event) => updateField('mapUrl', normalizeMapInput(event.target.value))}
                            />
                        </label>
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title">
                            <Image size={18} />
                            <h2>Hình ảnh album & ảnh đôi</h2>
                        </div>

                        <div className="pwie-image-row-head">
                            <label>Album (Tối đa 20 ảnh)</label>
                            <span>{draft.images.gallery.filter(Boolean).length}/20 ảnh</span>
                        </div>

                        <div className="pwie-image-strip" ref={galleryStripRef}>
                            <button className="pwie-add-image" type="button" onClick={addGalleryImage}>
                                <Plus size={24} />
                                <span>Thêm ảnh</span>
                            </button>
                            {draft.images.gallery.map((image, index) => (
                                image && (
                                    <div key={`album-strip-btn-${index}`} className="pwie-gallery-thumbnail-container" style={{ position: 'relative', width: '88px', height: '76px', display: 'inline-block' }}>
                                        <button type="button" onClick={() => requestImage(`images.gallery.${index}`)} style={{ width: '100%', height: '100%', display: 'block' }}>
                                            <img src={image} alt={`Album ${index + 1}`} />
                                        </button>
                                        {index >= 4 && (
                                            <button
                                                type="button"
                                                className="pwie-delete-gallery-btn"
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
                                )
                            ))}
                        </div>

                        <div className="pwie-upload-grid is-primary-images">
                            <button className={`pwie-upload-tile${draft.images.cover ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.cover')}>
                                <Upload size={18} />
                                <span>{draft.images.cover ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
                            </button>
                            <button className={`pwie-upload-tile${draft.images.portraitOne ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.portraitOne')}>
                                <Upload size={18} />
                                <span>{draft.images.portraitOne ? 'Đổi ảnh chú rể' : 'Thêm ảnh chú rể'}</span>
                            </button>
                            <button className={`pwie-upload-tile${draft.images.portraitTwo ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.portraitTwo')}>
                                <Upload size={18} />
                                <span>{draft.images.portraitTwo ? 'Đổi ảnh cô dâu' : 'Thêm ảnh cô dâu'}</span>
                            </button>
                            <button className={`pwie-upload-tile${draft.images.embrace ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.embrace')}>
                                <Upload size={18} />
                                <span>{draft.images.embrace ? 'Đổi ảnh thư mời 1' : 'Thêm ảnh thư mời 1'}</span>
                            </button>
                            <button className={`pwie-upload-tile${draft.images.letterCenter ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.letterCenter')}>
                                <Upload size={18} />
                                <span>{draft.images.letterCenter ? 'Đổi ảnh thư mời 2' : 'Thêm ảnh thư mời 2'}</span>
                            </button>
                            <button className={`pwie-upload-tile${draft.images.kiss ? ' has-image' : ''}`} type="button" onClick={() => requestImage('images.kiss')}>
                                <Upload size={18} />
                                <span>{draft.images.kiss ? 'Đổi ảnh thư mời 3' : 'Thêm ảnh thư mời 3'}</span>
                            </button>
                        </div>
                    </section>

                    <section className="pwie-card">
                        <div className="pwie-card__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                <div className="pwie-qr-toggle-grid">
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

                                <div className="pwie-upload-grid">
                                    <button
                                        className={`pwie-upload-tile${draft.images.groomQr ? ' has-image' : ''}`}
                                        type="button"
                                        disabled={draft.showGroomGift === false}
                                        onClick={() => requestImage('images.groomQr')}
                                    >
                                        <Upload size={18} />
                                        <span>{draft.images.groomQr ? 'Đổi QR chú rể' : 'Thêm QR chú rể'}</span>
                                    </button>
                                    <button
                                        className={`pwie-upload-tile${draft.images.brideQr ? ' has-image' : ''}`}
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
                <div className="pwie-map-modal" role="dialog" aria-modal="true">
                    <button className="pwie-map-backdrop" type="button" onClick={() => setValidationAlert(null)} />
                    <div className="pwie-alert-dialog has-list">
                        <div className="pwie-map-dialog__head">
                            <strong>{validationAlert.title}</strong>
                            <button type="button" onClick={() => setValidationAlert(null)}>Đóng</button>
                        </div>
                        <div className="pwie-alert-dialog__content">
                            {validationAlert.missingImages ? (
                                <>
                                    <p className="pwie-alert-dialog__intro">Vui lòng bổ sung các hình ảnh bắt buộc sau:</p>
                                    <ul className="pwie-alert-dialog__list">
                                        {validationAlert.missingImages.map((key) => {
                                            const labels: Record<string, string> = {
                                                cover: 'Ảnh bìa sổ lưu niệm',
                                                portraitOne: 'Ảnh chú rể',
                                                portraitTwo: 'Ảnh cô dâu',
                                                embrace: 'Ảnh thư mời 1',
                                                letterCenter: 'Anh thu moi 2',
                                                kiss: 'Ảnh thư mời 3',
                                                gallery: 'Ảnh album cưới (cần ít nhất 4 ảnh)',
                                            };
                                            return (
                                                <li key={key}>
                                                    <span>{labels[key]}</span>
                                                    <button
                                                        type="button"
                                                        className="pwie-alert-dialog__quick-upload"
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
                        <div className="pwie-alert-dialog__actions">
                            <button type="button" onClick={() => setValidationAlert(null)}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}

            {showSaveSuccess && (
                <div className="pwie-map-modal" role="dialog" aria-modal="true">
                    <button className="pwie-map-backdrop" type="button" onClick={() => setShowSaveSuccess(false)} />
                    <div className="pwie-alert-dialog pwie-success-dialog">
                        <div className="pwie-success-dialog__icon">
                            <Check size={36} />
                        </div>
                        <h2 className="pwie-success-dialog__title">Lưu thiệp thành công!</h2>
                        <p className="pwie-success-dialog__desc">
                            Thiệp cưới đã được lưu vào hệ thống. Bạn có muốn quay lại trang quản lý không?
                        </p>
                        <div className="pwie-success-dialog__actions">
                            <button type="button" className="pwie-success-dialog__btn is-secondary" onClick={() => setShowSaveSuccess(false)}>
                                Tiếp tục chỉnh sửa
                            </button>
                            <button type="button" className="pwie-success-dialog__btn is-primary" onClick={() => navigate('/dashboard')}>
                                Quản lý thiệp cưới
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isMusicModalOpen && draft.musicTrack?.fileUrl && (
                <div className="pwie-music-modal-overlay" role="dialog" aria-modal="true">
                    <div className="pwie-music-modal-content">
                        <button
                            type="button"
                            className="pwie-music-modal-close"
                            onClick={() => setIsMusicModalOpen(false)}
                            aria-label="Đóng"
                        >
                            <X size={20} />
                        </button>

                        <div className="pwie-music-modal-header">
                            <h3>Cắt đoạn nhạc nền</h3>
                            <p>Kéo thanh trượt để chọn thời điểm bắt đầu phát nhạc khi khách mở thiệp.</p>
                        </div>

                        <div className="pwie-music-modal-body">
                            <div className="pwie-music-timeline pwie-modal-timeline">
                                <span>{formatAudioTime(selectedMusicStart)}</span>
                                <label
                                    className="pwie-music-range"
                                    style={{ '--pwie-music-progress': musicTimelineProgress } as CSSProperties}
                                >
                                    <span className="sr-only">Chọn vị trí bắt đầu phát nhạc</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={musicTimelineMax}
                                        step="1"
                                        value={Math.min(selectedMusicStart, musicTimelineMax)}
                                        onChange={(event) => updateMusicStart(Number(event.target.value))}
                                    />
                                </label>
                                <strong>{formatAudioTime(musicDuration || musicTimelineMax)}</strong>
                            </div>

                            <div className="pwie-music-modal-controls">
                                <button
                                    type="button"
                                    className={`pwie-music-play-circle large${isMusicPlaying ? ' is-playing' : ''}`}
                                    onClick={toggleMusicPreview}
                                    aria-label={isMusicPlaying ? 'Tạm dừng nghe thử' : 'Phát nghe thử'}
                                >
                                    {isMusicPlaying ? (
                                        <Pause size={24} fill="currentColor" />
                                    ) : (
                                        <Play size={24} fill="currentColor" style={{ transform: 'translateX(1px)' }} />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="pwie-music-modal-confirm-btn"
                                    onClick={() => setIsMusicModalOpen(false)}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default PinkWeddingInvitationEditor;
