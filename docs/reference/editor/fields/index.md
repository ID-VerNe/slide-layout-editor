# 编辑器字段控件参考

本文档列出了编辑器中所有可用的字段编辑控件 (`src/components/editor/fields/`)。每个控件对应一种数据类型，在右侧编辑面板中动态渲染。

---

## 通用契约

所有 Field 组件遵循统一接口 (`FieldProps`)：

```typescript
interface FieldProps {
  page: PageData;                       // 当前页面数据
  onUpdate: (page: PageData) => void;   // 更新回调 (不可变)
  customFonts?: CustomFont[];           // 自定义字体列表 (可选)
  label?: string;                       // 自定义标签 (可选)
  pages?: PageData[];                   // 项目全部页面 (可选，用于项目级资产历史复用)
}
```

**关键规则**:
- `onUpdate` 必须返回新的 `PageData` 对象 (浅拷贝)
- 所有字段通过 Zustand Store 的 `updatePage` 流转
- 活跃字段高亮 (蓝色左边框)
- **`pages` 透传规则**: 编辑面板从 `EditorPage` 层将 `pages` 透传给 `Editor` → `FieldRenderer` → 具体字段；使用 `IconPicker` 的字段可借此开启 `history` Tab，快速复用项目内的已有图片

---

## 编辑器约束系统

### PresetSelect - 受控预设选择器

从 v3.0 开始，字号、行高、字距等设计属性采用**受控预设**而非自由输入，确保设计一致性。

**组件**: `src/components/ui/PresetSelect.tsx`  
**预设定义**: `src/constants/editorPresets.ts`

#### 可用预设

**字号预设** (12 档)
```
6pt (Micro) | 7pt (Caption) | 10pt (Body) | 12pt (Body+) 
14pt (Lead) | 18pt (Subhead) | 24pt (H3) | 32pt (H2)
48pt (H1) | 64pt (Display) | 80pt (Hero) | 120pt (Art)
```

**行高预设** (7 档)
```
1.0 (Tight) | 1.1 (Display) | 1.2 (Compact) | 1.4 (Normal)
1.6 (Relaxed) | 1.8 (Loose) | 2.0 (Double)
```

**字距预设** (7 档)
```
-0.05em (Tight) | 0 (Normal) | 0.05em (Wide) | 0.1em (Airy)
0.15em (Tracking) | 0.2em (Caps) | 0.3em (Display)
```

#### 使用方式

```tsx
import { PresetSelect } from '../../ui/PresetSelect';
import { FONT_SIZE_PRESETS } from '../../../constants/editorPresets';

<PresetSelect
  value={page.styleOverrides?.field?.fontSize || 14}
  options={FONT_SIZE_PRESETS}
  onChange={(val) => updateFontSize('field', val)}
  label="Size"
/>
```

#### 特性
- ✅ 自动值映射：非预设值自动映射到最接近的档位
- ✅ 类型安全：泛型类型 `<T extends string | number>` 确保类型正确
- ✅ 向后兼容：旧项目数据自动适配

---

## 8. 完整字段映射表

| fieldKey | 组件 | 绑定字段 | 类型 |
| :--- | :--- | :--- | :--- |
| `title` | `TitleField` | `page.title` | string |
| `subtitle` | `SubtitleField` | `page.subtitle` | string |
| `paragraph` | `ParagraphField` | `page.paragraph` | string |
| `actionText` | `ActionTextField` | `page.actionText` | string |
| `signature` | `SignatureField` | `page.signature` | string |
| `partnersTitle` | `PartnersTitleField` | `page.partnersTitle` | string |
| `footer` | `FooterField` | `page.footer` | string |
| `imageLabel` | `ImageLabelField` | `page.imageLabel` | string |
| `imageSubLabel` | `ImageSubLabelField` | `page.imageSubLabel` | string |
| `image` | `ImageField` | `page.image` | asset |
| `logo` | `LogoField` | `page.logo` | asset |
| `features` | `FeaturesField` | `page.features` | array |
| `agenda` | `AgendaField` | `page.agenda` | array |
| `metrics` | `MetricsField` | `page.metrics` | array |
| `testimonials` | `TestimonialsField` | `page.testimonials` | array |
| `bullets` | `BulletsField` | `page.bullets` | array |
| `bentoItems` | `BentoField` | `page.bentoItems` | array |
| `gallery` | `GalleryField` | `page.gallery` | array |
| `mosaic` | `MosaicField` | `page.mosaic` | array |
| `partners` | `PartnersField` | `page.partners` | array |
| `resumeSections` | `ResumeSectionsField` | `page.resumeSections` | structured |
| `artFont` | `ArtFontField` | `page.artFont` | string |
| `variant` | `VariantField` | `page.layoutVariant` | enum |
| `backgroundColor` | `ColorField` | `page.backgroundColor` | color |
| `pageNumber` | `PageNumberField` | `page.pageNumber` | boolean |
| `titleY` | `TitleYField` | `page.titleY` | number |

---

## 9. 数据流

```text
FieldRenderer
├── 接收: fieldKey (str), pages (optional)
├── 查找: FIELD_TO_COMPONENT_MAP[fieldKey]
├── 查找: 当前页面 pageId → pages[pageId]
├── 渲染: <Component page={page} onUpdate={updatePage} customFonts={customFonts} pages={pages} />
│
└── updatePage(updatedPage)
    └── Zustand Store: set(state => ({ pages: state.pages.map(update) }))
        └── React 重新渲染: EditorPage → EditorPanel → Editor → FieldRenderer → Field
```