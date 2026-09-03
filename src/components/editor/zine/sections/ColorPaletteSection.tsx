import React from 'react';
import { Palette } from 'lucide-react';

interface ColorPaletteSectionProps {
  currentColor?: string;
  colorTokens: Record<string, string>;
  onSelectColor: (color: string) => void;
}

/**
 * ColorPaletteSection - 设计系统颜色标记选择器
 */
export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({
  currentColor,
  colorTokens,
  onSelectColor,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Palette size={12} />
        <span>Color Palette</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(colorTokens).map(([name, value]) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectColor(value)}
            className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 active:scale-90 ${
              currentColor === value
                ? 'border-zine-accent ring-2 ring-zine-accent/20'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: value }}
            title={name}
          />
        ))}
      </div>
    </div>
  );
};
