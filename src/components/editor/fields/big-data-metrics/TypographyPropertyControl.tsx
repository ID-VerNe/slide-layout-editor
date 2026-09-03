import React from 'react';
import { CustomFont } from '../../../../types';
import { FontSelect } from '../../../ui/FontSelect';

interface TypographyPropertyControlProps {
  title: string;
  size: number;
  sizeStep?: number;
  minSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  defaultColor?: string;
  customFonts: CustomFont[];
  onSizeChange: (newSize: number) => void;
  onFontChange: (font: string) => void;
  onBoldToggle: (bold: boolean) => void;
  onItalicToggle: (italic: boolean) => void;
  onColorChange: (color: string) => void;
}

/**
 * TypographyPropertyControl - 通用单项排版属性控制单元
 */
export const TypographyPropertyControl: React.FC<TypographyPropertyControlProps> = ({
  title,
  size,
  sizeStep = 0.25,
  minSize = 0.5,
  fontFamily,
  bold = false,
  italic = false,
  color,
  defaultColor = '#000000',
  customFonts,
  onSizeChange,
  onFontChange,
  onBoldToggle,
  onItalicToggle,
  onColorChange,
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-[9px] font-black uppercase text-slate-500">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] font-bold text-slate-400 ml-1">Size (x8px)</label>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onSizeChange(Math.max(minSize, size - sizeStep))}
              className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
            >
              -
            </button>
            <span className="w-full text-center text-[10px] font-black">{size}</span>
            <button
              type="button"
              onClick={() => onSizeChange(size + sizeStep)}
              className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-[8px] font-bold text-slate-400 ml-1">Font</label>
          <FontSelect
            value={fontFamily}
            onChange={onFontChange}
            customFonts={customFonts}
            compact
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onBoldToggle(!bold)}
          className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
            bold
              ? 'bg-zine-accent text-white'
              : 'bg-white text-slate-400 border border-slate-200'
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => onItalicToggle(!italic)}
          className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
            italic
              ? 'bg-zine-accent text-white'
              : 'bg-white text-slate-400 border border-slate-200'
          }`}
        >
          Italic
        </button>
        <input
          type="color"
          value={color || defaultColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer"
          title="Color"
        />
      </div>
    </div>
  );
};
