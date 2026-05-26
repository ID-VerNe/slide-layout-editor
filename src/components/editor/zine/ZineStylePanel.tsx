import React from 'react';
import { PageData, DesignSystem, CustomFont } from '../../../types';
import { useStore } from '../../../store/useStore';
import { FontSelect } from '../../ui/FontSelect';
import { 
  Type, AlignLeft, AlignCenter, AlignJustify, Italic, Palette, 
  MousePointer2, RotateCcw, Move, Maximize2, Layers 
} from 'lucide-react';

interface ZineStylePanelProps {
  page: PageData;
  fieldKey: string;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
}

/**
 * ZineStylePanel - 受控的样式实验室
 * 已增强：支持分割线的 9 点对齐与长度控制
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

  const isDivider = fieldKey.toLowerCase().includes('divider') || fieldKey === 'separator' || fieldKey.toLowerCase().includes('line');
  
  // 基础属性
  const currentSize = overrides.fontSize || (fieldKey === 'title' ? 72 : 16);
  const currentThickness = overrides.height || overrides.thickness || 1;
  const currentLength = overrides.width || '100%';
  const currentColor = overrides.color || ds.tokens.colors.primary;
  
  // 对齐属性 (9点定位支持)
  const currentAlign = overrides.alignSelf || 'center';
  const currentJustify = overrides.justifySelf || 'stretch';

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

      {/* 1. 字体选择 (仅限非分割线) */}
      {!isDivider && (
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
      )}

      {/* 2. 核心数值控制 (Size/Thickness) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <MousePointer2 size={12} />
            <span>{isDivider ? 'Thickness' : 'Size'}</span>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button 
              onClick={() => isDivider 
                ? updateOverride('height', (Math.max(0.5, (parseFloat(currentThickness as string) || 1) - 0.5)) + 'px')
                : updateOverride('fontSize', Math.max(8, currentSize - 8))}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >-</button>
            <span className="w-full text-center text-[10px] font-black">
               {isDivider ? currentThickness : currentSize}
            </span>
            <button 
              onClick={() => isDivider
                ? updateOverride('height', ((parseFloat(currentThickness as string) || 1) + 0.5) + 'px')
                : updateOverride('fontSize', currentSize + 8)}
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
        ) : (
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
        )}
      </div>

      {/* 3. 9点定位控制 (仅限分割线) */}
      {isDivider && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Move size={12} />
              <span>9-Point Alignment</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* 垂直对齐 (Top/Middle/Bottom) */}
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button 
                onClick={() => updateOverride('alignSelf', 'start')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'start' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >TOP</button>
              <button 
                onClick={() => updateOverride('alignSelf', 'center')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'center' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >MID</button>
              <button 
                onClick={() => updateOverride('alignSelf', 'end')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentAlign === 'end' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >BOT</button>
            </div>
            
            {/* 水平对齐 (Left/Center/Right) */}
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button 
                onClick={() => updateOverride('justifySelf', 'start')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'start' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >LFT</button>
              <button 
                onClick={() => updateOverride('justifySelf', 'center')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'center' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >CTR</button>
              <button 
                onClick={() => updateOverride('justifySelf', 'end')}
                className={`flex-1 py-1 text-[8px] font-black rounded transition-all ${currentJustify === 'end' ? 'bg-white shadow-sm' : 'opacity-40'}`}
              >RGT</button>
            </div>
          </div>
        </div>
      )}

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
      {!isDivider && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => updateOverride('fontStyle', overrides.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${overrides.fontStyle === 'italic' ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'}`}
          >
            <Italic size={12} />
            <span>Italic Mode</span>
          </button>
        </div>
      )}
    </div>
  );
};
