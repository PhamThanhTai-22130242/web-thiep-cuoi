import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
    CalendarDays,
    Eye,
    MapPin,
    Plus,
    Save,
    Send,
    X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
    defaultInvitationTemplate,
    InvitationTemplate,
    rubyTemplatePreviewStorageKey,
    rubyTemplateStorageKey,
    savePreviewInvitationTemplate,
} from '../data/invitationTemplates';
import RubyBasicInvitation from './RubyBasicInvitation';
import './TemplateDashboard.css';

const fontOptions = ['Allura', 'Great Vibes', 'Dancing Script', 'Pacifico'];
const colorPresets = [
    { key: 'ruby-gold', primary: '#9f2c24', background: '#f6e8dc', accent: '#d8b16a' },
    { key: 'wine-blush', primary: '#7f1d2d', background: '#fff1ec', accent: '#c99255' },
    { key: 'copper-ivory', primary: '#9b4b24', background: '#fff6e8', accent: '#d6a85a' },
    { key: 'jade-red', primary: '#2f5b52', background: '#f7f2e8', accent: '#b7332b' },
];

type ImageField = 'images.cover' | 'images.kiss' | 'images.walk' | 'images.smile' | 'images.studio' | 'images.thank';
type UploadTarget = ImageField | `images.gallery.${number}`;
const mapGuideYoutubeUrl = 'https://www.youtube.com/results?search_query=c%C3%A1ch+l%E1%BA%A5y+link+nh%C3%BAng+google+map';

const defaultSampleImages = new Set([
    defaultInvitationTemplate.images.cover,
    defaultInvitationTemplate.images.kiss,
    defaultInvitationTemplate.images.walk,
    defaultInvitationTemplate.images.smile,
    defaultInvitationTemplate.images.studio,
    defaultInvitationTemplate.images.thank,
    ...(defaultInvitationTemplate.images.gallery || []),
]);

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
    template.id = 'ruby-basic-99k';
    template.name = 'Ruby Basic 99k';
    template.slug = 'thiep-moi-99k';
    template.templateUrl = '/thiep-moi-99k';
    template.publicUrl = '/thiep-moi-99k';
    template.design.primaryColor = '#9f2c24';
    template.design.backgroundColor = '#f6e8dc';
    template.design.accentColor = '#d8b16a';
    template.images.cover = '';
    template.images.kiss = '';
    template.images.walk = '';
    template.images.smile = '';
    template.images.studio = '';
    template.images.thank = '';
    template.images.gallery = [];
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
    (['smile', 'studio', 'thank'] as const).forEach((key) => {
        if (defaultSampleImages.has(next.images[key])) {
            next.images[key] = '';
        }
    });
    const gallery = (next.images.gallery || []).filter((image) => image && !defaultSampleImages.has(image));
    next.images.gallery = gallery;
    return next;
}

function loadTemplates(): InvitationTemplate[] {
    const fallback = [createEditableTemplate()];

    try {
        const stored = window.localStorage.getItem(rubyTemplateStorageKey);
        if (!stored) {
            return fallback;
        }

        const parsed = JSON.parse(stored) as InvitationTemplate[];
        return parsed.length ? parsed.map(normalizeEditableTemplate) : fallback;
    } catch {
        return fallback;
    }
}

function saveTemplates(templates: InvitationTemplate[]) {
    window.localStorage.setItem(rubyTemplateStorageKey, JSON.stringify(templates));
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

function getGallery(template: InvitationTemplate) {
    return template.images.gallery || [];
}

function TemplateDashboard99k() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const [templates, setTemplates] = useState<InvitationTemplate[]>(() => loadTemplates());
    const [selectedId] = useState(templates[0]?.id || defaultInvitationTemplate.id);
    const [saveStatus, setSaveStatus] = useState('');
    const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
    const [isMapDetailOpen, setIsMapDetailOpen] = useState(false);

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

    const persistTemplate = (values: InvitationTemplate, status: InvitationTemplate['status'], message: string) => {
        const normalized = { ...values, id: selectedId, status };
        const nextTemplates = templates.map((template) => (template.id === selectedId ? normalized : template));
        setTemplates(nextTemplates);
        saveTemplates(nextTemplates);
        setSaveStatus(message);
    };

    const handleSaveDraft = handleSubmit((values) => {
        persistTemplate(values, 'draft', 'Đã lưu bản nháp trên máy này.');
    });

    const handleOpenPreview = handleSubmit(async (values) => {
        try {
            await savePreviewInvitationTemplate({ ...values, id: selectedId, status: 'draft' }, rubyTemplatePreviewStorageKey);
            window.open('/thiep-moi-99k?preview=1', '_blank', 'noopener,noreferrer');
        } catch {
            setSaveStatus('Không thể tạo bản xem trước. Vui lòng thử lại hoặc giảm dung lượng ảnh.');
        }
    });

    const handlePublish = handleSubmit((values) => {
        persistTemplate(values, 'published', 'Đã xuất bản. Trang /thiep-moi-99k sẽ đọc thông tin mới nhất.');
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
        setValue('event.mapUrl', mapValue, { shouldDirty: true });
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
        setUploadTarget(target);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadTarget) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            if (uploadTarget.startsWith('images.gallery.')) {
                const index = Number(uploadTarget.split('.').pop());
                const nextGallery = [...(getValues('images.gallery') || [])];
                nextGallery[index] = result;
                setValue(`images.gallery.${index}` as `images.gallery.${number}`, result, { shouldDirty: true, shouldTouch: true });
                setValue('images.gallery', nextGallery, { shouldDirty: true, shouldTouch: true });
            } else {
                setValue(uploadTarget, result, { shouldDirty: true, shouldTouch: true });
            }
            setUploadTarget(null);
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    const addGalleryImage = () => {
        const gallery = getValues('images.gallery') || [];
        const emptySlotIndex = gallery.findIndex((image) => !image);
        setUploadTarget(`images.gallery.${emptySlotIndex >= 0 ? emptySlotIndex : gallery.length}`);
        fileInputRef.current?.click();
    };

    return (
        <main className="td-page">
            <input ref={fileInputRef} className="td-file-input" type="file" accept="image/*" onChange={handleFileChange} />

            <section className="td-canvas">
                <div className="td-live-preview">
                    <RubyBasicInvitation template={previewTemplate} preview onImageClick={(target) => requestImage(target as UploadTarget)} />
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
                    <button type="button" onClick={handleSaveDraft}>
                        <Save size={18} />
                        Lưu nháp
                    </button>
                    <button className="is-publish" type="button" onClick={handlePublish}>
                        <Send size={18} />
                        Xuất bản
                    </button>
                </div>

                {saveStatus && <p className="td-save-status">{saveStatus}</p>}

                <form onSubmit={handlePublish}>
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
                        <label>Vị trí Google Map</label>
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
                        <span>{galleryImages.filter(Boolean).length} ảnh album</span>
                    </div>
                    <div className="td-image-strip">
                        <button type="button" className="td-add-image" onClick={addGalleryImage}>
                            <Plus size={24} />
                            <span>Thêm ảnh</span>
                        </button>
                        {galleryImages.map((image, index) => (
                            <button key={`${image}-${index}`} type="button" onClick={() => requestImage(`images.gallery.${index}`)}>
                                {image ? <img src={image} alt={`Album ${index + 1}`} /> : <span>Chưa có ảnh</span>}
                            </button>
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
                                    <span style={{ background: `conic-gradient(from 45deg, ${preset.primary} 0 40%, ${preset.accent} 40% 68%, ${preset.background} 68% 100%)` }} />
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

        </main>
    );
}

export default TemplateDashboard99k;
