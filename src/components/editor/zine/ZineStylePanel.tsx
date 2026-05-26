import React from 'react';
import { PageData, DesignSystem, CustomFont } from '../../../types';
import { useStore } from '../../../store/useStore';
import { FontSelect } from '../../ui/FontSelect';
import { 
  Type, AlignLeft, AlignCenter, AlignJustify, Italic, Palette, 
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
  
  // 语义化属性解析
  const currentSize = overrides.size !== undefined ? overrides.size : (fieldKey === 'title' ? 4 : 1.5);
  const currentThickness = overrides.thickness || 1;
  const currentLength = overrides.width || '100%';
  const currentColor = overrides.color || ds.tokens.colors.primary;
  const currentRounded = overrides.borderRadius || (isImage ? '0px' : undefined);
  
  // 对齐属性 (9点定位支持)
  const currentAlign = overrides.alignSelf;
  const currentJustify = overrides.justifySelf;
  const currentTextAlign = overrides.align || 'left';

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
            value={overrides.fontFamily} 
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
                onClick={() => updateOverride('align', 'left')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'left' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Align Left"
              ><AlignLeft size={12} /></button>
              <button 
                onClick={() => updateOverride('align', 'center')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'center' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Align Center"
              ><AlignCenter size={12} /></button>
              <button 
                onClick={() => updateOverride('align', 'justify')}
                className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${currentTextAlign === 'justify' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Justify"
              ><AlignJustify size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 全球 9点定位控制 (9-Point Grid Docking) */}
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
        
        <div className="grid grid-cols-2 gap-2">
          {/* 垂直对齐 (Top/Middle/Bottom) */}
          <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => updateOverride('alignSelf', 'start')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'start' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >TOP</button>
            <button 
              onClick={() => updateOverride('alignSelf', 'center')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'center' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >MID</button>
            <button 
              onClick={() => updateOverride('alignSelf', 'end')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'end' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >BOT</button>
          </div>
          
          {/* 水平对齐 (Left/Center/Right) */}
          <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => updateOverride('justifySelf', 'start')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'start' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >LFT</button>
            <button 
              onClick={() => updateOverride('justifySelf', 'center')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'center' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >CTR</button>
            <button 
              onClick={() => updateOverride('justifySelf', 'end')}
              className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'end' ? 'bg-white shadow-sm text-zine-accent' : 'opacity-40'}`}
            >RGT</button>
          </div>
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
