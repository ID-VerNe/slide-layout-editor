import React from 'react';
import { PageData, DesignSystem, CustomFont } from '../../../types';
import { useStore } from '../../../store/useStore';
import { FontSelect } from '../../ui/FontSelect';
import { Type, AlignLeft, AlignCenter, AlignJustify, Italic, Palette, MousePointer2, RotateCcw } from 'lucide-react';

interface ZineStylePanelProps {
  page: PageData;
  fieldKey: string;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
}

/**
 * ZineStylePanel - 受控的样式实验室
 * 仅提供符合 Zine 审美规范的选项：
 * 1. 强制 8px 步进的字号。
 * 2. 仅限 Design System Token 颜色。
 * 3. 仅限 Zine 推荐字体对。
 */
export const ZineStylePanel: React.FC<ZineStylePanelProps> = ({
  page,
  fieldKey,
  onUpdate,
  customFonts
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

  const currentSize = overrides.fontSize || (fieldKey === 'title' ? 72 : 16);
  const currentColor = overrides.color || ds.tokens.colors.primary;
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-64 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* 0. 头部标题与重置 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Style Override</span>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[120px]">{fieldKey}</span>
        </div>
        {hasOverrides && (
          <button 
            onClick={resetToDefault}
            className="px-2 py-1 bg-red-50 text-red-500 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-1"
          >
            <RotateCcw size={10} /> Reset
          </button>
        )}
      </div>

      {/* 1. 字体选择 (Zine 受限模式) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Type size={12} />
          <span>Typography Pair</span>
        </div>
        <FontSelect 
          value={overrides.fontFamily} 
          onChange={(v) => updateOverride('fontFamily', v)}
          customFonts={customFonts}
          compact
        />
      </div>

      {/* 2. 字号与对齐 (8px 步进) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <MousePointer2 size={12} />
            <span>Size</span>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => updateOverride('fontSize', Math.max(8, currentSize - 8))}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >-</button>
            <span className="w-full text-center text-[10px] font-black">{currentSize}</span>
            <button 
              onClick={() => updateOverride('fontSize', currentSize + 8)}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >+</button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <AlignLeft size={12} />
            <span>Align</span>
          </div>
          <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => updateOverride('textAlign', 'left')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${overrides.textAlign === 'left' || (!overrides.textAlign && fieldKey === 'title') ? 'bg-white shadow-sm' : 'opacity-40'}`}
              title="Align Left"
            ><AlignLeft size={12} /></button>
            <button 
              onClick={() => updateOverride('textAlign', 'center')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${overrides.textAlign === 'center' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              title="Align Center"
            ><AlignCenter size={12} /></button>
            <button 
              onClick={() => updateOverride('textAlign', 'justify')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${overrides.textAlign === 'justify' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              title="Justify"
            ><AlignJustify size={12} /></button>
          </div>
        </div>
      </div>

      {/* 3. 调色盘 (仅限 DS Tokens) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Palette size={12} />
          <span>Industrial Palette</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ds.tokens.colors).map(([name, value]) => (
            <button
              key={name}
              onClick={() => updateOverride('color', value)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${currentColor === value ? 'border-zine-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: value }}
              title={name}
            />
          ))}
          {/* 自由取色器作为最后兜底，但在 UI 上淡化 */}
          <div className="w-6 h-6 rounded-full border border-slate-200 relative overflow-hidden bg-gradient-to-tr from-red-500 to-blue-500 opacity-40 hover:opacity-100 transition-opacity">
            <input 
              type="color" 
              value={currentColor} 
              onChange={(e) => updateOverride('color', e.target.value)}
              className="absolute -top-1 -left-1 w-8 h-8 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>

      {/* 4. 辅助开关 */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => updateOverride('fontStyle', overrides.fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${overrides.fontStyle === 'italic' ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'}`}
        >
          <Italic size={12} />
          <span>Italic Mode</span>
        </button>
      </div>
    </div>
  );
};
