import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { useStore } from '../../../store/useStore';
import { RotateCcw } from 'lucide-react';
import { 
  getDefaultSizeForField, 
  getDefaultAlignForField, 
  getDefaultFontFamilyForField 
} from './zineStyleUtils';
import { TextStyleSection } from './sections/TextStyleSection';
import { ImageStyleSection } from './sections/ImageStyleSection';
import { DividerStyleSection } from './sections/DividerStyleSection';
import { DockingGridSection } from './sections/DockingGridSection';
import { ColorPaletteSection } from './sections/ColorPaletteSection';

interface ZineStylePanelProps {
  page: PageData;
  fieldKey: string;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  mode?: 'text' | 'image' | 'divider';
}

/**
 * ZineStylePanel - 受控的样式实验室
 * 职责：编排文本、图片、分割线与 9 点定位样式，单模块高内聚
 */
export const ZineStylePanel: React.FC<ZineStylePanelProps> = ({
  page,
  fieldKey,
  onUpdate,
  customFonts,
  mode,
}) => {
  const ds = useStore((s) => s.designSystem);
  const theme = useStore((s) => s.theme);
  const overrides = page.styleOverrides?.[fieldKey] || {};

  const updateOverride = (key: string, value: any) => {
    onUpdate(
      {
        ...page,
        styleOverrides: {
          ...(page.styleOverrides || {}),
          [fieldKey]: {
            ...overrides,
            [key]: value,
          },
        },
      },
      true
    );
  };

  const updateOverrides = (updates: Record<string, any>) => {
    onUpdate(
      {
        ...page,
        styleOverrides: {
          ...(page.styleOverrides || {}),
          [fieldKey]: {
            ...overrides,
            ...updates,
          },
        },
      },
      true
    );
  };

  const resetToDefault = () => {
    const nextOverrides = { ...(page.styleOverrides || {}) };
    delete nextOverrides[fieldKey];
    onUpdate(
      {
        ...page,
        styleOverrides: nextOverrides,
      },
      true
    );
  };

  // 模式启发式推导 (Fallback)
  const isDivider =
    mode === 'divider' ||
    (!mode &&
      (fieldKey.toLowerCase().includes('divider') ||
        fieldKey === 'separator' ||
        fieldKey.toLowerCase().includes('line')));
  const isImage =
    mode === 'image' ||
    (!mode &&
      (fieldKey.toLowerCase().includes('image') ||
        fieldKey.toLowerCase().includes('logo') ||
        fieldKey.toLowerCase().includes('media')) &&
      !fieldKey.toLowerCase().includes('label') &&
      !fieldKey.toLowerCase().includes('text'));
  const isText = mode === 'text' || (!isDivider && !isImage);

  const currentSize = overrides.size !== undefined ? overrides.size : getDefaultSizeForField(fieldKey);
  const currentThickness = overrides.thickness || 1;
  const currentLength = overrides.width || '100%';
  const currentColor = overrides.color || ds.tokens.colors.primary;
  const currentRounded = overrides.borderRadius || (isImage ? '0px' : undefined);
  const currentFontFamily = overrides.fontFamily || getDefaultFontFamilyForField(page, fieldKey, theme);
  const currentAlign = overrides.alignSelf;
  const currentJustify = overrides.justifySelf;
  const currentTextAlign = overrides.align || overrides.textAlign || getDefaultAlignForField(page, fieldKey);

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-64 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* 头部标题与重置 */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-zine-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Style Lab</span>
        </div>
        {hasOverrides && (
          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={10} />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* 文本模式专属配置 */}
      {isText && (
        <TextStyleSection
          currentFontFamily={currentFontFamily}
          onFontFamilyChange={(f) => updateOverride('fontFamily', f)}
          customFonts={customFonts}
          currentSize={currentSize}
          onSizeChange={(s) => updateOverride('size', s)}
          currentTextAlign={currentTextAlign}
          onTextAlignChange={(val) => updateOverrides({ align: val, textAlign: val })}
          bold={overrides.bold}
          onBoldToggle={() => updateOverride('bold', !overrides.bold)}
          italic={overrides.italic}
          onItalicToggle={() => updateOverride('italic', !overrides.italic)}
        />
      )}

      {/* 图片模式专属配置 */}
      {isImage && (
        <ImageStyleSection
          currentRounded={currentRounded || '0px'}
          onRoundedChange={(r) => updateOverride('borderRadius', r)}
        />
      )}

      {/* 分割线模式专属配置 */}
      {isDivider && (
        <DividerStyleSection
          currentThickness={currentThickness}
          onThicknessChange={(t) => updateOverride('thickness', t)}
          currentLength={currentLength}
          onLengthChange={(l) => updateOverride('width', l)}
        />
      )}

      {/* 9 点停靠定位 */}
      <DockingGridSection
        alignSelf={currentAlign}
        justifySelf={currentJustify}
        onSelect={(align, justify) => updateOverrides({ alignSelf: align, justifySelf: justify })}
        onReset={() => {
          const next = { ...overrides };
          delete next.alignSelf;
          delete next.justifySelf;
          onUpdate({ ...page, styleOverrides: { ...page.styleOverrides, [fieldKey]: next } }, true);
        }}
      />

      {/* 调色盘 */}
      <ColorPaletteSection
        currentColor={currentColor}
        colorTokens={ds.tokens.colors}
        onSelectColor={(val) => updateOverride('color', val)}
      />
    </div>
  );
};
