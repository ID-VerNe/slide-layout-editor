import React from 'react';
import { CustomFont } from '../../../../types';
import { FontSelect } from '../../../ui/FontSelect';
import { 
  Type as TypeIcon, 
  MousePointer2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Italic 
} from 'lucide-react';

interface TextStyleSectionProps {
  currentFontFamily: string;
  onFontFamilyChange: (font: string) => void;
  customFonts: CustomFont[];
  currentSize: number;
  onSizeChange: (size: number) => void;
  currentTextAlign: string;
  onTextAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  bold?: boolean;
  onBoldToggle: () => void;
  italic?: boolean;
  onItalicToggle: () => void;
}

/**
 * TextStyleSection - 文本专属样式配置区
 */
export const TextStyleSection: React.FC<TextStyleSectionProps> = ({
  currentFontFamily,
  onFontFamilyChange,
  customFonts,
  currentSize,
  onSizeChange,
  currentTextAlign,
  onTextAlignChange,
  bold,
  onBoldToggle,
  italic,
  onItalicToggle,
}) => {
  return (
    <>
      {/* 字体选择 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <TypeIcon size={12} />
          <span>Font Family</span>
        </div>
        <FontSelect
          value={currentFontFamily}
          onChange={onFontFamilyChange}
          customFonts={customFonts}
          compact
        />
      </div>

      {/* 字号与对齐 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <MousePointer2 size={12} />
            <span>Size (x8)</span>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onSizeChange(Math.max(0.5, currentSize - 0.5))}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >
              -
            </button>
            <span className="w-full text-center text-[10px] font-black truncate px-1">
              {currentSize}
            </span>
            <button
              type="button"
              onClick={() => onSizeChange(currentSize + 0.5)}
              className="w-full py-1 text-xs font-black hover:bg-white rounded transition-all active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <AlignLeft size={12} />
            <span>Text Align</span>
          </div>
          <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onTextAlignChange('left')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${
                currentTextAlign === 'left' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'
              }`}
              title="Align Left"
            >
              <AlignLeft size={12} />
            </button>
            <button
              type="button"
              onClick={() => onTextAlignChange('center')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${
                currentTextAlign === 'center' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'
              }`}
              title="Align Center"
            >
              <AlignCenter size={12} />
            </button>
            <button
              type="button"
              onClick={() => onTextAlignChange('right')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${
                currentTextAlign === 'right' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'
              }`}
              title="Align Right"
            >
              <AlignRight size={12} />
            </button>
            <button
              type="button"
              onClick={() => onTextAlignChange('justify')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-all ${
                currentTextAlign === 'justify' ? 'bg-white shadow-sm' : 'opacity-40 hover:opacity-100'
              }`}
              title="Justify"
            >
              <AlignJustify size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 粗体与斜体 */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onBoldToggle}
          className={`py-2 flex items-center justify-center gap-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
            bold ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'
          }`}
        >
          <TypeIcon size={12} />
          <span>Bold</span>
        </button>
        <button
          type="button"
          onClick={onItalicToggle}
          className={`py-2 flex items-center justify-center gap-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
            italic ? 'bg-zine-accent text-white' : 'bg-slate-50 text-slate-400'
          }`}
        >
          <Italic size={12} />
          <span>Italic</span>
        </button>
      </div>
    </>
  );
};
