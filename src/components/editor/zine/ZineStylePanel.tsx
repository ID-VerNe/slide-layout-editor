import React from 'react';
import { PageData, DesignSystem, CustomFont } from '../../../types';
import { useStore } from '../../../store/useStore';
import { FontSelect } from '../../ui/FontSelect';
import { getTemplateById } from '../../../templates/registry';
import { 
  Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Italic, Palette, 
  MousePointer2, RotateCcw, Move, Maximize2, Type as TypeIcon
} from 'lucide-react';

interface ZineStylePanelProps {
  page: PageData;
  fieldKey: string;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  mode?: 'text' | 'image' | 'divider';
}

/**
 * ZineStylePanel - 受控的样式实验室
 * 已更新：支持语义化排版 (size as 8px multiplier, serif/sans toggles)
 * 已增强：支持显式模式切换 (text/image/divider)
 */
export const ZineStylePanel: React.FC<ZineStylePanelProps> = ({
  page,
  fieldKey,
  onUpdate,
  customFonts,
  mode
}) => {
  const ds = useStore(s => s.designSystem);
  const theme = useStore(s => s.theme);
  const overrides = page.styleOverrides?.[fieldKey] || {};

  const updateOverride = (key: string, value: any) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [fieldKey]: {
          ...overrides,
          [key]: value
        }
      }
    }, true);
  };

  // 批量更新多个属性
  const updateOverrides = (updates: Record<string, any>) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [fieldKey]: {
          ...overrides,
          ...updates
        }
      }
    }, true);
  };

  const resetToDefault = () => {
    const nextOverrides = { ...(page.styleOverrides || {}) };
    delete nextOverrides[fieldKey];
    onUpdate({
      ...page,
      styleOverrides: nextOverrides
    }, true);
  };

  // 默认模式启发式 (Fallback)
  const isDivider = mode === 'divider' || (!mode && (fieldKey.toLowerCase().includes('divider') || fieldKey === 'separator' || fieldKey.toLowerCase().includes('line')));
  const isImage = mode === 'image' || (!mode && (fieldKey.toLowerCase().includes('image') || fieldKey.toLowerCase().includes('logo') || fieldKey.toLowerCase().includes('media')) && !fieldKey.toLowerCase().includes('label') && !fieldKey.toLowerCase().includes('text'));
  const isText = mode === 'text' || (!isDivider && !isImage);
  
  // 语义化属性解析（提供贴合排版层级的合理初始阶梯）
  const getDefaultSizeForField = (key: string): number => {
    const lk = key.toLowerCase();
    if (lk === 'title' || lk === 'heading') return 4; // 32px (H2)
    if (lk.includes('display') || lk.includes('hero')) return 6; // 48px (H1)
    if (lk.includes('quote')) return 3; // 24px
    if (lk.includes('metric') || lk.includes('number') || lk.includes('stat')) return 5; // 40px
    if (lk.includes('sub') || lk.includes('desc') || lk.includes('para') || lk.includes('body')) return 2; // 16px (Body)
    if (lk.includes('caption') || lk.includes('meta') || lk.includes('tag') || lk.includes('badge')) return 1.25; // 10px (Caption)
    return 2; // 默认正文字号 16px，避免突降为 12px
  };

  const currentSize = overrides.size !== undefined ? overrides.size : getDefaultSizeForField(fieldKey);
  const currentThickness = overrides.thickness || 1;
  const currentLength = overrides.width || '100%';
  const currentColor = overrides.color || ds.tokens.colors.primary;
  const currentRounded = overrides.borderRadius || (isImage ? '0px' : undefined);
  
  // 智能推导当前文本对齐方式（优先从当前模板 Schema 中检索默认 align）
  const getDefaultAlignForField = (key: string): string => {
    try {
      const tpl = getTemplateById(page.layoutId);
      if (tpl?.schema) {
        const findAlignInNode = (node: any): string | undefined => {
          if (!node) return undefined;
          if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
            return node.props?.align || node.props?.textAlign;
          }
          if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
              const res = findAlignInNode(child);
              if (res) return res;
            }
          }
          return undefined;
        };
        const defaultAlign = findAlignInNode(tpl.schema);
        if (defaultAlign) return defaultAlign;
      }
    } catch {
      // 降级使用 left
    }
    return 'left';
  };

  // 智能推导当前文本字体族（从模板 Schema 或 Design Token 继承）
  const getDefaultFontFamilyForField = (key: string): string => {
    try {
      const tpl = getTemplateById(page.layoutId);
      if (tpl?.schema) {
        const findFontInNode = (node: any): string | undefined => {
          if (!node) return undefined;
          if (node.type === 'Component' && (node.fieldKey === key || node.bind === `page.${key}`)) {
            if (node.props?.fontFamily) return node.props.fontFamily;
            if (node.props?.serif) return theme.typography.headingFont;
            if (node.props?.sans) return theme.typography.bodyFont;
            if (node.props?.caption) return theme.typography.captionFont;
          }
          if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
              const res = findFontInNode(child);
              if (res) return res;
            }
          }
          return undefined;
        };
        const defaultFont = findFontInNode(tpl.schema);
        if (defaultFont) return defaultFont;
      }
    } catch {
      // 忽略异常，降级到语义推导
    }

    const lk = key.toLowerCase();
    if (lk === 'title' || lk === 'heading' || lk.includes('display') || lk.includes('hero')) {
      return page.titleFont || theme.typography.headingFont;
    }
    if (lk.includes('caption') || lk.includes('meta') || lk.includes('tag') || lk.includes('badge') || lk === 'footer') {
      return theme.typography.captionFont || theme.typography.bodyFont;
    }
    if (lk.includes('zh') || lk.includes('chinese')) {
      return theme.typography.bodyFontZH;
    }
    return page.bodyFont || theme.typography.bodyFont;
  };

  const currentFontFamily = overrides.fontFamily || getDefaultFontFamilyForField(fieldKey);
  const currentAlign = overrides.alignSelf;
  const currentJustify = overrides.justifySelf;
  const currentTextAlign = overrides.align || overrides.textAlign || getDefaultAlignForField(fieldKey);

  const updateTextAlign = (val: 'left' | 'center' | 'right' | 'justify') => {
    updateOverrides({ align: val, textAlign: val });
  };
  
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-64 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* 0. 头部标题与重置 */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-zine-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Style Lab</span>
        </div>
        {hasOverrides && (
          <button 
            onClick={resetToDefault}
            className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={10} />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* 1. 字体族选择 (仅限文本模式) */}
      {isText && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <TypeIcon size={12} />
            <span>Font Family</span>
          </div>
          <FontSelect 
            value={currentFontFamily} 
            onChange={(v) => updateOverride('fontFamily', v)}
            customFonts={customFonts}
            compact
          />
        </div>
      )}

      {/* 2. 核心数值控制 (Size/Thickness/Rounding) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <MousePointer2 size={12} />
            <span>{isDivider ? 'Thickness' : (isImage ? 'Rounding' : 'Size (x8)')}</span>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => {
                if (isDivider) updateOverride('thickness', Math.max(0.5, (parseFloat(currentThickness as string) || 1) - 0.5));
                else if (isImage) updateOverride('borderRadius', (Math.max(0, (parseFloat(currentRounded as string) || 0) - 4)) + 'px');
                else updateOverride('size', Math.max(0.5, currentSize - 0.5));
              }}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >-</button>
            <span className="w-full text-center text-[10px] font-black truncate px-1">
               {isDivider ? currentThickness : (isImage ? currentRounded : currentSize)}
            </span>
            <button 
              onClick={() => {
                if (isDivider) updateOverride('thickness', ((parseFloat(currentThickness as string) || 1) + 0.5));
                else if (isImage) updateOverride('borderRadius', ((parseFloat(currentRounded as string) || 0) + 4) + 'px');
                else updateOverride('size', currentSize + 0.5);
              }}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >+</button>
          </div>
        </div>

        {isDivider ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Maximize2 size={12} />
              <span>Length</span>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button 
                onClick={() => {
                  const val = parseFloat(currentLength as string) || 100;
                  updateOverride('width', Math.max(10, val - 10) + '%');
                }}
                className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
              >-</button>
              <span className="w-full text-center text-[10px] font-black">{currentLength}</span>
              <button 
                onClick={() => {
                  const val = parseFloat(currentLength as string) || 100;
                  updateOverride('width', Math.min(100, val + 10) + '%');
                }}
                className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
              >+</button>
            </div>
          </div>
        ) : (isText && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <AlignLeft size={12} />
              <span>Text Align</span>
            </div>
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button 
                onClick={() => updateTextAlign('left')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'left' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                title="Align Left"
              ><AlignLeft size={12} /></button>
              <button 
                onClick={() => updateTextAlign('center')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'center' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                title="Align Center"
              ><AlignCenter size={12} /></button>
              <button 
                onClick={() => updateTextAlign('right')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'right' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                title="Align Right"
              ><AlignRight size={12} /></button>
              <button 
                onClick={() => updateTextAlign('justify')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'justify' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                title="Justify"
              ><AlignJustify size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 9宫格定位 (9-Point Docking) - 改进为 3x3 网格 */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Move size={12} />
            <span>9-Point Docking</span>
          </div>
          {(currentAlign || currentJustify) && (
             <button 
               onClick={() => {
                 const next = { ...overrides };
                 delete next.alignSelf;
                 delete next.justifySelf;
                 onUpdate({ ...page, styleOverrides: { ...page.styleOverrides, [fieldKey]: next } }, true);
               }}
               className="text-[8px] font-black text-zine-accent hover:underline"
             >FILL</button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {/* 
            注意：Flexbox 和 Grid 的对齐语义不同
            - Grid: alignSelf=垂直, justifySelf=水平
            - Flexbox(column): alignSelf=水平, justifySelf不生效
            
            为了用户体验一致，我们统一使用：
            - alignSelf 控制垂直位置（上中下）
            - justifySelf 控制水平位置（左中右）
          */}
          
          {/* 第一行：Top Left, Top Center, Top Right */}
          <button
            onClick={() => updateOverrides({ alignSelf: 'start', justifySelf: 'start' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'start' && currentJustify === 'start' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Top Left (左上)"
          >↖</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'start', justifySelf: 'center' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'start' && currentJustify === 'center' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Top Center (上中)"
          >↑</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'start', justifySelf: 'end' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'start' && currentJustify === 'end' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Top Right (右上)"
          >↗</button>

          {/* 第二行：Mid Left, Center, Mid Right */}
          <button
            onClick={() => updateOverrides({ alignSelf: 'center', justifySelf: 'start' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'center' && currentJustify === 'start' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Mid Left (左中)"
          >←</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'center', justifySelf: 'center' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'center' && currentJustify === 'center' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Center (正中)"
          >⊙</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'center', justifySelf: 'end' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'center' && currentJustify === 'end' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Mid Right (右中)"
          >→</button>

          {/* 第三行：Bottom Left, Bottom Center, Bottom Right */}
          <button
            onClick={() => updateOverrides({ alignSelf: 'end', justifySelf: 'start' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'end' && currentJustify === 'start' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Bottom Left (左下)"
          >↙</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'end', justifySelf: 'center' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'end' && currentJustify === 'center' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Bottom Center (下中)"
          >↓</button>
          <button
            onClick={() => updateOverrides({ alignSelf: 'end', justifySelf: 'end' })}
            className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${currentAlign === 'end' && currentJustify === 'end' ? 'bg-zine-accent text-white border-zine-accent' : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'}`}
            title="Bottom Right (右下)"
          >↘</button>
        </div>
      </div>

      {/* 4. 调色盘 (仅限 DS Tokens) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Palette size={12} />
          <span>Color Palette</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ds.tokens.colors).map(([name, value]) => (
            <button
              key={name}
              onClick={() => updateOverride('color', value)}
              className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 active:scale-90 ${currentColor === value ? 'border-zine-accent ring-2 ring-zine-accent/20' : 'border-transparent'}`}
              style={{ backgroundColor: value as string }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* 5. 辅助开关 (仅限非分割线) */}
      {!isDivider && !isImage && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => updateOverride('bold', !overrides.bold)}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${overrides.bold ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'}`}
          >
            <TypeIcon size={12} />
            <span>Bold</span>
          </button>
          <button
            onClick={() => updateOverride('italic', !overrides.italic)}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${overrides.italic ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'}`}
          >
            <Italic size={12} />
            <span>Italic</span>
          </button>
        </div>
      )}
    </div>
  );
};
