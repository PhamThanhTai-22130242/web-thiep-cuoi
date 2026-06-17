import { CSSProperties, ReactNode, useMemo, useState } from 'react';
import { Editor, Element, Frame, ROOT_NODE, useEditor, useNode } from '@craftjs/core';
import Moveable from 'react-moveable';
import {
    Copy,
    Download,
    Image,
    Layers,
    MousePointer2,
    Plus,
    Square,
    Trash2,
    Type,
} from 'lucide-react';
import './TestComponent.css';

type CraftComponent<P> = React.FC<P> & {
    craft?: {
        displayName?: string;
        props?: Partial<P>;
        rules?: Record<string, unknown>;
    };
};

type BaseLayerProps = {
    top: number;
    left: number;
    width: number;
    height: number;
    rotate: number;
    opacity: number;
    zIndex: number;
};

type ArtboardProps = {
    width: number;
    height: number;
    background: string;
    children?: ReactNode;
};

type TextLayerProps = BaseLayerProps & {
    text: string;
    color: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    textAlign: CSSProperties['textAlign'];
    lineHeight: number;
};

type ImageLayerProps = BaseLayerProps & {
    src: string;
    radius: number;
    fit: CSSProperties['objectFit'];
};

type ShapeLayerProps = BaseLayerProps & {
    fill: string;
    radius: number;
    borderColor: string;
    borderWidth: number;
};

type SelectedInfo = {
    id: string | null;
    name: string;
    props: Record<string, any>;
};

const sampleImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80',
];

const svgIcon = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const stockIcons = [
    {
        id: 'bouquet-pink',
        name: 'Pink bouquet',
        category: 'Hoa cưới',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M78 83 C70 111 62 131 55 150" stroke="#6d8b56" stroke-width="6" stroke-linecap="round"/>
                <path d="M82 84 C88 111 96 131 104 150" stroke="#6d8b56" stroke-width="6" stroke-linecap="round"/>
                <path d="M53 103 C72 92 92 91 111 104" fill="none" stroke="#f6b6c8" stroke-width="13" stroke-linecap="round"/>
                <circle cx="57" cy="61" r="22" fill="#f7a7bd"/><circle cx="84" cy="50" r="24" fill="#ffe0ea"/>
                <circle cx="108" cy="67" r="22" fill="#f6a0b8"/><circle cx="78" cy="78" r="25" fill="#ffd1dc"/>
                <circle cx="60" cy="62" r="9" fill="#fceef3"/><circle cx="84" cy="50" r="10" fill="#f0a4b7"/>
                <circle cx="110" cy="68" r="8" fill="#fff1d6"/><circle cx="77" cy="78" r="9" fill="#e88aa4"/>
                <path d="M39 72 C23 61 25 41 47 48" fill="#8dbb74"/><path d="M123 58 C142 51 145 75 127 82" fill="#7fab70"/>
                <path d="M61 121 L99 121 L91 153 L69 153 Z" fill="#ffd6c9"/>
                <path d="M58 124 C70 138 88 139 102 124" fill="none" stroke="#e9819d" stroke-width="5" stroke-linecap="round"/>
            </svg>
        `),
    },
    {
        id: 'bouquet-yellow',
        name: 'Sun bouquet',
        category: 'Hoa cưới',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M78 78 C66 112 58 132 50 150" stroke="#6f8558" stroke-width="6" stroke-linecap="round"/>
                <path d="M84 78 C93 110 103 132 113 150" stroke="#6f8558" stroke-width="6" stroke-linecap="round"/>
                <g fill="#ffd34d" stroke="#d99018" stroke-width="3">
                    <circle cx="48" cy="63" r="18"/><circle cx="82" cy="48" r="20"/><circle cx="112" cy="70" r="18"/><circle cx="78" cy="84" r="21"/>
                </g>
                <g fill="#6b3d19"><circle cx="48" cy="63" r="7"/><circle cx="82" cy="48" r="8"/><circle cx="112" cy="70" r="7"/><circle cx="78" cy="84" r="8"/></g>
                <path d="M31 83 C18 72 29 52 48 56" fill="#78a86a"/><path d="M121 48 C145 40 147 72 124 80" fill="#7eb06e"/>
                <path d="M58 113 C72 124 92 124 106 113 L98 151 L66 151 Z" fill="#f4c49d"/>
                <path d="M64 127 C78 136 88 136 101 127" fill="none" stroke="#b97046" stroke-width="5" stroke-linecap="round"/>
            </svg>
        `),
    },
    {
        id: 'double-happiness-round',
        name: 'Round hy',
        category: 'Chữ hỷ',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <circle cx="80" cy="80" r="66" fill="#fff7f3" stroke="#df1f2d" stroke-width="7"/>
                <circle cx="80" cy="80" r="54" fill="none" stroke="#df1f2d" stroke-width="3"/>
                <text x="80" y="108" text-anchor="middle" font-family="serif" font-size="82" font-weight="700" fill="#d71726">囍</text>
                <path d="M42 43 C55 30 69 32 80 43 C91 32 106 30 119 43" fill="none" stroke="#f3a5a5" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `),
    },
    {
        id: 'double-happiness-seal',
        name: 'Seal hy',
        category: 'Chữ hỷ',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M35 27 H125 Q133 27 133 35 V125 Q133 133 125 133 H35 Q27 133 27 125 V35 Q27 27 35 27Z" fill="#e21c2b"/>
                <path d="M45 37 H115 Q123 37 123 45 V115 Q123 123 115 123 H45 Q37 123 37 115 V45 Q37 37 45 37Z" fill="none" stroke="#fff1ea" stroke-width="4"/>
                <text x="80" y="105" text-anchor="middle" font-family="serif" font-size="76" font-weight="800" fill="#fff1ea">囍</text>
            </svg>
        `),
    },
    {
        id: 'heart-balloon',
        name: 'Heart balloon',
        category: 'Trái tim',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M79 77 C44 49 62 18 80 39 C98 18 117 49 81 77Z" fill="#ff6f91"/>
                <path d="M81 77 C92 103 69 119 80 147" fill="none" stroke="#9aa3af" stroke-width="3"/>
                <path d="M66 40 C61 50 64 61 75 70" fill="none" stroke="#ffd8e2" stroke-width="5" stroke-linecap="round"/>
            </svg>
        `),
    },
    {
        id: 'heart-soft',
        name: 'Soft hearts',
        category: 'Trái tim',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M61 86 C28 59 45 30 62 49 C78 29 96 59 63 86Z" fill="#ff8fab" opacity=".9"/>
                <path d="M104 104 C70 76 88 45 105 66 C123 45 142 76 106 104Z" fill="#ffb3c7" opacity=".82"/>
                <path d="M78 122 C52 100 67 77 80 92 C93 77 108 100 82 122Z" fill="#ffd1dc" opacity=".86"/>
            </svg>
        `),
    },
    {
        id: 'wedding-couple',
        name: 'Couple',
        category: 'Nhân vật',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <circle cx="59" cy="45" r="15" fill="#f3c7a5"/><circle cx="101" cy="45" r="15" fill="#f0c2a2"/>
                <path d="M44 78 C51 62 68 62 76 78 L66 137 H35 Z" fill="#fff1f5" stroke="#d88aa3" stroke-width="3"/>
                <path d="M85 78 C91 62 110 62 117 78 L126 137 H84 Z" fill="#2d3748"/>
                <path d="M91 78 L101 95 L111 78" fill="#ffffff"/>
                <path d="M50 35 C55 23 71 29 73 43" fill="#7a3d2a"/><path d="M88 41 C95 24 116 31 115 48" fill="#2d1d16"/>
                <path d="M72 88 C79 95 84 95 91 88" fill="none" stroke="#d34b6b" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `),
    },
    {
        id: 'flower-basket',
        name: 'Basket',
        category: 'Yếu tố đám cưới',
        src: svgIcon(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
                <rect width="160" height="160" fill="none"/>
                <path d="M44 68 C50 31 110 31 116 68" fill="none" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/>
                <path d="M36 68 H124 L112 130 H48 Z" fill="#f7c56b" stroke="#9b6531" stroke-width="4"/>
                <path d="M51 84 H109 M48 100 H112 M46 116 H114" stroke="#b2763a" stroke-width="3"/>
                <circle cx="53" cy="57" r="13" fill="#ff9aae"/><circle cx="79" cy="49" r="15" fill="#ffd166"/><circle cx="105" cy="59" r="13" fill="#ff9aae"/>
                <path d="M36 57 C24 45 33 31 50 39" fill="#73a96a"/><path d="M112 40 C130 31 139 50 120 61" fill="#6fa262"/>
            </svg>
        `),
    },
];

const stockCategories = ['Tất cả', 'Yếu tố đám cưới', 'Nhân vật', 'Hoa cưới', 'Chữ hỷ', 'Trái tim'];

const templates = [
    {
        id: 'cinelove-red',
        name: 'Red Cinema',
        image: sampleImages[0],
    },
    {
        id: 'classic-paper',
        name: 'Classic Paper',
        image: sampleImages[2],
    },
];

function layerStyle(props: BaseLayerProps): CSSProperties {
    return {
        position: 'absolute',
        top: props.top,
        left: props.left,
        width: props.width,
        height: props.height,
        opacity: props.opacity,
        zIndex: props.zIndex,
        transform: `rotate(${props.rotate}deg)`,
        transformOrigin: '50% 50%',
    };
}

function useConnectableLayer<T extends BaseLayerProps>(props: T) {
    const {
        connectors: { connect },
        id,
        selected,
    } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return {
        id,
        selected,
        ref: (element: HTMLDivElement | null) => {
            if (element) {
                connect(element);
            }
        },
        style: layerStyle(props),
    };
}

const Artboard: CraftComponent<ArtboardProps> = ({ width, height, background, children }) => {
    const {
        connectors: { connect },
    } = useNode();

    return (
        <div
            ref={(element) => {
                if (element) {
                    connect(element);
                }
            }}
            className="te-artboard"
            id="te-artboard"
            style={{ width, height, background }}
        >
            {children}
        </div>
    );
};

Artboard.craft = {
    displayName: 'Artboard',
    props: {
        width: 500,
        height: 750,
        background: '#fff7ef',
    },
};

const TextLayer: CraftComponent<TextLayerProps> = (props) => {
    const { id, ref, selected, style } = useConnectableLayer(props);
    const { actions } = useNode();

    return (
        <div
            ref={ref}
            className={`te-layer te-text-layer${selected ? ' is-selected' : ''}`}
            data-craft-id={id}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={(event) => actions.setProp((draft: TextLayerProps) => {
                draft.text = event.currentTarget.innerText;
            })}
            style={{
                ...style,
                color: props.color,
                fontFamily: props.fontFamily,
                fontSize: props.fontSize,
                fontWeight: props.fontWeight,
                textAlign: props.textAlign,
                lineHeight: props.lineHeight,
            }}
        >
            {props.text}
        </div>
    );
};

TextLayer.craft = {
    displayName: 'Text',
    props: {
        top: 120,
        left: 80,
        width: 340,
        height: 80,
        rotate: 0,
        opacity: 1,
        zIndex: 2,
        text: 'Thanh Huy & Phuong Thuy',
        color: '#6e2f2a',
        fontSize: 34,
        fontFamily: 'Georgia',
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: 1.15,
    },
};

const ImageLayer: CraftComponent<ImageLayerProps> = (props) => {
    const { id, ref, selected, style } = useConnectableLayer(props);

    return (
        <div
            ref={ref}
            className={`te-layer te-image-layer${selected ? ' is-selected' : ''}`}
            data-craft-id={id}
            style={{
                ...style,
                borderRadius: props.radius,
                backgroundImage: `url(${props.src})`,
                backgroundPosition: 'center',
                backgroundSize: props.fit === 'contain' ? 'contain' : 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        />
    );
};

ImageLayer.craft = {
    displayName: 'Image',
    props: {
        top: 48,
        left: 48,
        width: 404,
        height: 520,
        rotate: 0,
        opacity: 1,
        zIndex: 1,
        src: sampleImages[0],
        radius: 26,
        fit: 'cover',
    },
};

const ShapeLayer: CraftComponent<ShapeLayerProps> = (props) => {
    const { id, ref, selected, style } = useConnectableLayer(props);

    return (
        <div
            ref={ref}
            className={`te-layer te-shape-layer${selected ? ' is-selected' : ''}`}
            data-craft-id={id}
            style={{
                ...style,
                background: props.fill,
                borderRadius: props.radius,
                border: `${props.borderWidth}px solid ${props.borderColor}`,
            }}
        />
    );
};

ShapeLayer.craft = {
    displayName: 'Shape',
    props: {
        top: 560,
        left: 70,
        width: 360,
        height: 1,
        rotate: 0,
        opacity: 1,
        zIndex: 3,
        fill: '#2c1713',
        radius: 0,
        borderColor: '#2c1713',
        borderWidth: 1,
    },
};

function RedCinemaTemplate() {
    return (
        <Element is={Artboard} canvas width={500} height={750} background="#fff7ef">
            <ImageLayer src={sampleImages[0]} top={38} left={38} width={424} height={565} rotate={0} opacity={1} zIndex={1} radius={28} fit="cover" />
            <TextLayer
                text={'Save The Date'}
                top={86}
                left={72}
                width={356}
                height={52}
                rotate={0}
                opacity={1}
                zIndex={2}
                color="#fff2d8"
                fontSize={38}
                fontFamily="Georgia"
                fontWeight={500}
                textAlign="center"
                lineHeight={1.08}
            />
            <TextLayer
                text={'Thanh Huy\n&\nPhuong Thuy'}
                top={505}
                left={72}
                width={356}
                height={132}
                rotate={0}
                opacity={1}
                zIndex={3}
                color="#1b1515"
                fontSize={38}
                fontFamily="Georgia"
                fontWeight={600}
                textAlign="center"
                lineHeight={1.08}
            />
            <ShapeLayer top={650} left={92} width={316} height={1} rotate={0} opacity={1} zIndex={4} fill="#1b1515" radius={0} borderColor="#1b1515" borderWidth={1} />
            <TextLayer
                text={'16.11.2026 | Diamond Palace'}
                top={670}
                left={86}
                width={328}
                height={34}
                rotate={0}
                opacity={1}
                zIndex={5}
                color="#45302a"
                fontSize={22}
                fontFamily="Arial"
                fontWeight={500}
                textAlign="center"
                lineHeight={1.2}
            />
        </Element>
    );
}

function ClassicPaperTemplate() {
    return (
        <Element is={Artboard} canvas width={500} height={750} background="#f8f0e7">
            <ShapeLayer top={28} left={28} width={444} height={694} rotate={0} opacity={1} zIndex={1} fill="transparent" radius={30} borderColor="#c8a676" borderWidth={2} />
            <ImageLayer src={sampleImages[2]} top={84} left={118} width={264} height={330} rotate={0} opacity={1} zIndex={2} radius={132} fit="cover" />
            <TextLayer
                text={'Wedding Invitation'}
                top={446}
                left={78}
                width={344}
                height={44}
                rotate={0}
                opacity={1}
                zIndex={3}
                color="#8d6942"
                fontSize={28}
                fontFamily="Times New Roman"
                fontWeight={500}
                textAlign="center"
                lineHeight={1.1}
            />
            <TextLayer
                text={'Huy & Thuy'}
                top={504}
                left={80}
                width={340}
                height={64}
                rotate={0}
                opacity={1}
                zIndex={4}
                color="#453025"
                fontSize={48}
                fontFamily="Georgia"
                fontWeight={600}
                textAlign="center"
                lineHeight={1}
            />
            <TextLayer
                text={'Tron ven ngay chung doi'}
                top={604}
                left={92}
                width={316}
                height={36}
                rotate={0}
                opacity={1}
                zIndex={5}
                color="#7a6253"
                fontSize={22}
                fontFamily="Arial"
                fontWeight={400}
                textAlign="center"
                lineHeight={1.2}
            />
        </Element>
    );
}

function ActiveMoveable() {
    const { selectedId, target, props } = useEditor((state) => {
        const id = Array.from(state.events.selected)[0] ?? null;
        const node = id ? state.nodes[id] : null;

        return {
            selectedId: id,
            target: id && id !== ROOT_NODE ? node?.dom ?? null : null,
            props: node?.data.props ?? {},
        };
    });
    const { actions } = useEditor();

    if (!selectedId || selectedId === ROOT_NODE || !target) {
        return null;
    }

    const updateLayer = (patch: Partial<BaseLayerProps>) => {
        actions.setProp(selectedId, (draft: BaseLayerProps) => {
            Object.assign(draft, patch);
        });
    };

    return (
        <Moveable
            target={target}
            container={document.body}
            draggable
            resizable
            rotatable
            snappable
            throttleDrag={1}
            throttleResize={1}
            throttleRotate={1}
            keepRatio={false}
            checkInput
            origin={false}
            edge={false}
            verticalGuidelines={[0, 250, 500]}
            horizontalGuidelines={[0, 375, 750]}
            onDragStart={(event: any) => {
                event.datas.left = Number(props.left) || 0;
                event.datas.top = Number(props.top) || 0;
            }}
            onDrag={(event: any) => {
                const [x, y] = event.beforeTranslate;
                updateLayer({
                    left: Math.round(event.datas.left + x),
                    top: Math.round(event.datas.top + y),
                });
            }}
            onResizeStart={(event: any) => {
                event.datas.left = Number(props.left) || 0;
                event.datas.top = Number(props.top) || 0;
            }}
            onResize={(event: any) => {
                const [x, y] = event.drag.beforeTranslate;
                updateLayer({
                    width: Math.round(event.width),
                    height: Math.round(event.height),
                    left: Math.round(event.datas.left + x),
                    top: Math.round(event.datas.top + y),
                });
            }}
            onRotate={(event: any) => {
                updateLayer({ rotate: Math.round(event.beforeRotate) });
            }}
        />
    );
}

function ToolbarButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
    return (
        <button className="te-toolbar-button" type="button" onClick={onClick}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function LeftPanel({ onTemplateChange }: { onTemplateChange: (id: string) => void }) {
    const { actions, query } = useEditor();
    const [activeStockCategory, setActiveStockCategory] = useState(stockCategories[0]);

    const visibleStockIcons = useMemo(
        () => stockIcons.filter((icon) => activeStockCategory === 'Tất cả' || icon.category === activeStockCategory),
        [activeStockCategory],
    );

    const addText = () => {
        const tree = query.parseReactElement(
            <TextLayer
                text="Nhap noi dung"
                top={330}
                left={96}
                width={308}
                height={54}
                rotate={0}
                opacity={1}
                zIndex={8}
                color="#111111"
                fontSize={32}
                fontFamily="Arial"
                fontWeight={600}
                textAlign="center"
                lineHeight={1.15}
            />,
        ).toNodeTree();
        actions.addNodeTree(tree, ROOT_NODE);
        actions.selectNode(tree.rootNodeId);
    };

    const addImage = (src: string) => {
        const tree = query.parseReactElement(
            <ImageLayer src={src} top={188} left={92} width={316} height={260} rotate={0} opacity={1} zIndex={7} radius={18} fit="cover" />,
        ).toNodeTree();
        actions.addNodeTree(tree, ROOT_NODE);
        actions.selectNode(tree.rootNodeId);
    };

    const addStockIcon = (src: string) => {
        const tree = query.parseReactElement(
            <ImageLayer src={src} top={260} left={170} width={160} height={160} rotate={0} opacity={1} zIndex={10} radius={0} fit="contain" />,
        ).toNodeTree();
        actions.addNodeTree(tree, ROOT_NODE);
        actions.selectNode(tree.rootNodeId);
    };

    const addShape = () => {
        const tree = query.parseReactElement(
            <ShapeLayer top={360} left={100} width={300} height={72} rotate={0} opacity={1} zIndex={6} fill="rgba(255,255,255,0.72)" radius={16} borderColor="#e1c7aa" borderWidth={1} />,
        ).toNodeTree();
        actions.addNodeTree(tree, ROOT_NODE);
        actions.selectNode(tree.rootNodeId);
    };

    return (
        <aside className="te-left-panel">
            <div className="te-rail">
                <button className="is-active" type="button" title="Images">
                    <Image size={22} />
                    <span>Images</span>
                </button>
                <button type="button" title="Text">
                    <Type size={22} />
                    <span>Text</span>
                </button>
                <button type="button" title="Shapes">
                    <Square size={22} />
                    <span>Shapes</span>
                </button>
                <button type="button" title="Layers">
                    <Layers size={22} />
                    <span>Layers</span>
                </button>
            </div>

            <div className="te-assets">
                <h2>Chon mau thiet ke</h2>
                <p>Template dang JSON tree, render bang React DOM.</p>

                <div className="te-template-grid">
                    {templates.map((template) => (
                        <button key={template.id} type="button" onClick={() => onTemplateChange(template.id)}>
                            <img src={template.image} alt={template.name} />
                            <span>{template.name}</span>
                        </button>
                    ))}
                </div>

                <div className="te-section-title">Them layer</div>
                <div className="te-action-grid">
                    <ToolbarButton icon={<Type size={18} />} label="Text" onClick={addText} />
                    <ToolbarButton icon={<Square size={18} />} label="Shape" onClick={addShape} />
                </div>

                <div className="te-section-title">Icon trang tri</div>
                <div className="te-chip-row">
                    {stockCategories.map((category) => (
                        <button
                            key={category}
                            className={activeStockCategory === category ? 'is-active' : ''}
                            type="button"
                            onClick={() => setActiveStockCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="te-icon-grid">
                    {visibleStockIcons.map((icon) => (
                        <button key={icon.id} type="button" title={icon.name} onClick={() => addStockIcon(icon.src)}>
                            <img src={icon.src} alt={icon.name} />
                        </button>
                    ))}
                </div>

                <div className="te-section-title">Anh nhanh</div>
                <div className="te-stock-grid">
                    {sampleImages.map((src) => (
                        <button key={src} type="button" onClick={() => addImage(src)}>
                            <img src={src} alt="Stock" />
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}

function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) {
    return (
        <label className="te-field">
            <span>{label}</span>
            <input type="number" value={Number.isFinite(value) ? value : 0} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
        </label>
    );
}

function Inspector() {
    const selected = useEditor((state): SelectedInfo => {
        const id = Array.from(state.events.selected)[0] ?? null;
        const node = id ? state.nodes[id] : null;

        return {
            id,
            name: node?.data.displayName || node?.data.name || 'Layer',
            props: node?.data.props ?? {},
        };
    });
    const { actions, query } = useEditor();

    const updateProps = (patch: Record<string, unknown>) => {
        if (!selected.id || selected.id === ROOT_NODE) {
            return;
        }

        actions.setProp(selected.id, (draft: Record<string, unknown>) => {
            Object.assign(draft, patch);
        });
    };

    const deleteSelected = () => {
        if (selected.id && selected.id !== ROOT_NODE && query.node(selected.id).isDeletable()) {
            actions.delete(selected.id);
        }
    };

    return (
        <aside className="te-inspector">
            <div className="te-inspector-head">
                <MousePointer2 size={20} />
                <div>
                    <h2>Tuy chinh</h2>
                    <p>{selected.id && selected.id !== ROOT_NODE ? selected.name : 'Chon 1 layer de sua'}</p>
                </div>
            </div>

            {selected.id && selected.id !== ROOT_NODE ? (
                <>
                    <div className="te-panel-group">
                        <h3>Vi tri</h3>
                        <div className="te-two-col">
                            <NumberField label="X" value={selected.props.left} onChange={(value) => updateProps({ left: value })} />
                            <NumberField label="Y" value={selected.props.top} onChange={(value) => updateProps({ top: value })} />
                            <NumberField label="W" value={selected.props.width} onChange={(value) => updateProps({ width: value })} min={8} />
                            <NumberField label="H" value={selected.props.height} onChange={(value) => updateProps({ height: value })} min={8} />
                            <NumberField label="Rotate" value={selected.props.rotate} onChange={(value) => updateProps({ rotate: value })} />
                            <NumberField label="Z" value={selected.props.zIndex} onChange={(value) => updateProps({ zIndex: value })} />
                        </div>
                    </div>

                    <div className="te-panel-group">
                        <h3>Hien thi</h3>
                        <label className="te-field">
                            <span>Opacity</span>
                            <input type="range" min={0.1} max={1} step={0.05} value={selected.props.opacity ?? 1} onChange={(event) => updateProps({ opacity: Number(event.target.value) })} />
                        </label>
                        {'color' in selected.props && (
                            <label className="te-field">
                                <span>Mau chu</span>
                                <input type="color" value={selected.props.color} onChange={(event) => updateProps({ color: event.target.value })} />
                            </label>
                        )}
                        {'fill' in selected.props && (
                            <label className="te-field">
                                <span>Mau nen</span>
                                <input type="color" value={selected.props.fill === 'transparent' ? '#ffffff' : selected.props.fill} onChange={(event) => updateProps({ fill: event.target.value })} />
                            </label>
                        )}
                    </div>

                    {'fontSize' in selected.props && (
                        <div className="te-panel-group">
                            <h3>Kieu chu</h3>
                            <NumberField label="Font size" value={selected.props.fontSize} min={8} max={120} onChange={(value) => updateProps({ fontSize: value })} />
                            <label className="te-field">
                                <span>Font</span>
                                <select value={selected.props.fontFamily} onChange={(event) => updateProps({ fontFamily: event.target.value })}>
                                    <option value="Arial">Arial</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                </select>
                            </label>
                        </div>
                    )}

                    {'src' in selected.props && (
                        <div className="te-panel-group">
                            <h3>Thay anh nhanh</h3>
                            <div className="te-strip">
                                {sampleImages.map((src) => (
                                    <button key={src} type="button" onClick={() => updateProps({ src })}>
                                        <img src={src} alt="Replace" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="te-danger-button" type="button" onClick={deleteSelected}>
                        <Trash2 size={18} />
                        Xoa layer
                    </button>
                </>
            ) : (
                <div className="te-empty-state">Chon chu, anh hoac shape tren thiep de hien bang thuoc tinh.</div>
            )}
        </aside>
    );
}

function LayerList() {
    const { layers, selectedId } = useEditor((state) => {
        const root = state.nodes[ROOT_NODE];
        const selected = Array.from(state.events.selected)[0] ?? null;

        return {
            selectedId: selected,
            layers: (root?.data.nodes ?? []).map((id) => ({
                id,
                name: state.nodes[id]?.data.displayName || state.nodes[id]?.data.name || id,
            })),
        };
    });
    const { actions } = useEditor();

    return (
        <div className="te-layers-pop">
            <div className="te-section-title">Layers</div>
            {layers.map((layer) => (
                <button key={layer.id} className={selectedId === layer.id ? 'is-selected' : ''} type="button" onClick={() => actions.selectNode(layer.id)}>
                    <Layers size={14} />
                    {layer.name}
                </button>
            ))}
        </div>
    );
}

function TopBar() {
    const { query } = useEditor();

    const downloadJson = () => {
        const blob = new Blob([query.serialize()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wedding-template.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const copyJson = async () => {
        await navigator.clipboard.writeText(query.serialize());
    };

    return (
        <header className="te-topbar">
            <div>
                <strong>Craft DOM Wedding Editor</strong>
                <span>Prototype theo huong Cinelove: React DOM + Craft.js + Moveable</span>
            </div>
            <div className="te-topbar-actions">
                <button type="button" onClick={copyJson}>
                    <Copy size={17} />
                    Copy JSON
                </button>
                <button type="button" onClick={downloadJson}>
                    <Download size={17} />
                    Download JSON
                </button>
            </div>
        </header>
    );
}

function Workspace({ activeTemplate, onTemplateChange }: { activeTemplate: string; onTemplateChange: (id: string) => void }) {
    const initialTemplate = useMemo(
        () => (activeTemplate === 'classic-paper' ? ClassicPaperTemplate() : RedCinemaTemplate()),
        [activeTemplate],
    );

    return (
        <Editor resolver={{ Artboard, TextLayer, ImageLayer, ShapeLayer }} enabled>
            <TopBar />
            <div className="te-shell">
                <LeftPanel onTemplateChange={onTemplateChange} />
                <main className="te-stage-wrap">
                    <div className="te-stage-scroll">
                        <Frame key={activeTemplate}>{initialTemplate}</Frame>
                        <ActiveMoveable />
                    </div>
                    <LayerList />
                    <div className="te-bottom-strip">
                        <span>Quick images</span>
                        {sampleImages.map((src) => (
                            <img key={src} src={src} alt="Thumb" />
                        ))}
                        <button type="button">
                            <Plus size={22} />
                        </button>
                    </div>
                </main>
                <Inspector />
            </div>
        </Editor>
    );
}

export default function TestComponent() {
    const [activeTemplate, setActiveTemplate] = useState(templates[0].id);

    return <Workspace key={activeTemplate} activeTemplate={activeTemplate} onTemplateChange={setActiveTemplate} />;
}
