import { useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
    defaultInvitationTemplate,
    InvitationTemplate,
    templateStorageKey,
} from '../data/invitationTemplates';
import EmeraldInvitation from './EmeraldInvitationPage';
import './TemplateDashboard.css';

const fontOptions = ['Allura', 'Great Vibes', 'Playfair Display', 'Inter'];

function cloneTemplate(template: InvitationTemplate): InvitationTemplate {
    return JSON.parse(JSON.stringify(template));
}

function loadTemplates(): InvitationTemplate[] {
    const fallback = [cloneTemplate(defaultInvitationTemplate)];

    try {
        const stored = window.localStorage.getItem(templateStorageKey);
        if (!stored) {
            return fallback;
        }

        const parsed = JSON.parse(stored) as InvitationTemplate[];
        return parsed.length ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function saveTemplates(templates: InvitationTemplate[]) {
    window.localStorage.setItem(templateStorageKey, JSON.stringify(templates));
}

function TemplateDashboard() {
    const [templates, setTemplates] = useState<InvitationTemplate[]>(() => loadTemplates());
    const [selectedId, setSelectedId] = useState(templates[0]?.id || defaultInvitationTemplate.id);
    const [saveStatus, setSaveStatus] = useState('');
    const selectedTemplate = useMemo(
        () => templates.find((template) => template.id === selectedId) || templates[0] || defaultInvitationTemplate,
        [selectedId, templates],
    );

    const { register, handleSubmit, reset, watch, setValue } = useForm<InvitationTemplate>({
        defaultValues: selectedTemplate,
    });

    const previewTemplate = watch();

    useEffect(() => {
        reset(selectedTemplate);
    }, [reset, selectedTemplate]);

    const updateColor = (path: 'design.primaryColor' | 'design.backgroundColor' | 'design.accentColor', color: string) => {
        setValue(path, color, { shouldDirty: true, shouldTouch: true });
    };

    const handleSave = (values: InvitationTemplate) => {
        const nextTemplates = templates.map((template) => (
            template.id === selectedId ? { ...values, id: selectedId } : template
        ));
        setTemplates(nextTemplates);
        saveTemplates(nextTemplates);
        setSaveStatus('Đã lưu thay đổi trên máy này. Khi có server chỉ cần đổi hàm saveTemplates thành API.');
    };

    const handleDuplicate = () => {
        const copy = cloneTemplate(selectedTemplate);
        copy.id = `${selectedTemplate.id}-${Date.now()}`;
        copy.name = `${selectedTemplate.name} Copy`;
        copy.slug = `${selectedTemplate.slug}-copy`;
        copy.status = 'draft';
        const nextTemplates = [...templates, copy];
        setTemplates(nextTemplates);
        saveTemplates(nextTemplates);
        setSelectedId(copy.id);
        setSaveStatus('Đã nhân bản template.');
    };

    const handleReset = () => {
        const nextTemplates = [cloneTemplate(defaultInvitationTemplate)];
        setTemplates(nextTemplates);
        saveTemplates(nextTemplates);
        setSelectedId(defaultInvitationTemplate.id);
        setSaveStatus('Đã khôi phục template mặc định.');
    };

    return (
        <main className="dashboard-page">
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    <span>H</span>
                    <div>
                        <strong>Harmony</strong>
                        <small>Template dashboard</small>
                    </div>
                </div>

                <div className="dashboard-nav-actions">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/thiep-moi">Xem thiệp</Link>
                </div>

                <section>
                    <div className="dashboard-sidebar-title">
                        <p>Templates</p>
                        <button type="button" onClick={handleDuplicate}>Nhân bản</button>
                    </div>
                    <div className="template-list">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                className={template.id === selectedId ? 'is-active' : ''}
                                onClick={() => setSelectedId(template.id)}
                            >
                                <strong>{template.name}</strong>
                                <span>/{template.slug}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <button className="dashboard-reset" type="button" onClick={handleReset}>
                    Khôi phục mặc định
                </button>
            </aside>

            <form className="dashboard-editor" onSubmit={handleSubmit(handleSave)}>
                <div className="dashboard-header">
                    <div>
                        <p>Editor</p>
                        <h1>Quản lý template thiệp cưới</h1>
                    </div>
                    <button type="submit">Lưu template</button>
                </div>

                {saveStatus && <p className="dashboard-status">{saveStatus}</p>}

                <section className="editor-panel">
                    <h2>Thông tin template</h2>
                    <div className="editor-grid">
                        <label>
                            Tên template
                            <input {...register('name')} />
                        </label>
                        <label>
                            Slug URL
                            <input {...register('slug')} />
                        </label>
                        <label>
                            Public URL
                            <input {...register('publicUrl')} />
                        </label>
                        <label>
                            Template gốc
                            <input {...register('templateUrl')} />
                        </label>
                    </div>
                </section>

                <section className="editor-panel">
                    <h2>Cô dâu chú rể</h2>
                    <div className="editor-grid">
                        <label>
                            Chú rể
                            <input {...register('couple.groom')} />
                        </label>
                        <label>
                            Cô dâu
                            <input {...register('couple.bride')} />
                        </label>
                        <label className="editor-wide">
                            Dòng mở đầu
                            <textarea rows={3} {...register('couple.headline')} />
                        </label>
                        <label className="editor-wide">
                            Quote album
                            <textarea rows={3} {...register('couple.quote')} />
                        </label>
                    </div>
                </section>

                <section className="editor-panel">
                    <h2>Ngày cưới và địa điểm</h2>
                    <div className="editor-grid">
                        <label>
                            Ngày giờ ISO
                            <input {...register('event.date')} />
                        </label>
                        <label>
                            Thứ
                            <input {...register('event.dayName')} />
                        </label>
                        <label>
                            Ngày
                            <input {...register('event.day')} />
                        </label>
                        <label>
                            Tháng
                            <input {...register('event.month')} />
                        </label>
                        <label>
                            Năm
                            <input {...register('event.year')} />
                        </label>
                        <label>
                            Giờ mời
                            <input {...register('event.time')} />
                        </label>
                        <label className="editor-wide">
                            Nhà hàng
                            <input {...register('event.venue')} />
                        </label>
                        <label className="editor-wide">
                            Địa chỉ
                            <input {...register('event.address')} />
                        </label>
                        <label className="editor-wide">
                            Google Maps embed
                            <input {...register('event.mapUrl')} />
                        </label>
                    </div>
                </section>

                <section className="editor-panel">
                    <h2>Font, màu và kích thước</h2>
                    <div className="design-grid">
                        <label>
                            Font chữ cưới
                            <select {...register('design.scriptFont')}>
                                {fontOptions.map((font) => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Font tiêu đề phụ
                            <select {...register('design.serifFont')}>
                                {fontOptions.map((font) => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Size tên cô dâu chú rể
                            <input type="range" min="54" max="110" {...register('design.nameSize', { valueAsNumber: true })} />
                            <span>{previewTemplate.design?.nameSize}px</span>
                        </label>
                        <label>
                            Size heading
                            <input type="range" min="48" max="104" {...register('design.headingSize', { valueAsNumber: true })} />
                            <span>{previewTemplate.design?.headingSize}px</span>
                        </label>
                    </div>

                    <div className="color-grid">
                        <div>
                            <p>Màu chủ đạo</p>
                            <HexColorPicker color={previewTemplate.design?.primaryColor} onChange={(color) => updateColor('design.primaryColor', color)} />
                            <input {...register('design.primaryColor')} />
                        </div>
                        <div>
                            <p>Màu nền thiệp</p>
                            <HexColorPicker color={previewTemplate.design?.backgroundColor} onChange={(color) => updateColor('design.backgroundColor', color)} />
                            <input {...register('design.backgroundColor')} />
                        </div>
                        <div>
                            <p>Màu nhấn</p>
                            <HexColorPicker color={previewTemplate.design?.accentColor} onChange={(color) => updateColor('design.accentColor', color)} />
                            <input {...register('design.accentColor')} />
                        </div>
                    </div>
                </section>

                <section className="editor-panel">
                    <h2>Hình ảnh</h2>
                    <div className="editor-grid">
                        <label className="editor-wide">
                            Ảnh phong thư trái
                            <input {...register('images.cover')} />
                        </label>
                        <label className="editor-wide">
                            Ảnh phong thư phải
                            <input {...register('images.kiss')} />
                        </label>
                        <label className="editor-wide">
                            Ảnh giữa trang
                            <input {...register('images.walk')} />
                        </label>
                        <label className="editor-wide">
                            Ảnh Thank You
                            <input {...register('images.thank')} />
                        </label>
                    </div>
                </section>
            </form>

            <aside className="dashboard-preview">
                <div className="preview-toolbar">
                    <div>
                        <strong>Live preview</strong>
                        <span>{previewTemplate.name}</span>
                    </div>
                    <Link to="/thiep-moi">Mở trang thiệp</Link>
                </div>
                <div className="preview-device">
                    <EmeraldInvitation template={previewTemplate} preview />
                </div>
            </aside>
        </main>
    );
}

export default TemplateDashboard;
