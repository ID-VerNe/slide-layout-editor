import React from 'react';
import { Move } from 'lucide-react';

interface DockingGridSectionProps {
  alignSelf?: string;
  justifySelf?: string;
  onSelect: (align: string, justify: string) => void;
  onReset: () => void;
}

/**
 * DockingGridSection - 9 点定位控制器 (3x3 网格)
 */
export const DockingGridSection: React.FC<DockingGridSectionProps> = ({
  alignSelf,
  justifySelf,
  onSelect,
  onReset,
}) => {
  const isDocked = Boolean(alignSelf || justifySelf);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Move size={12} />
          <span>9-Point Docking</span>
        </div>
        {isDocked && (
          <button
            type="button"
            onClick={onReset}
            className="text-[8px] font-black text-zine-accent hover:underline"
          >
            FILL
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {/* Row 1 */}
        <button
          type="button"
          onClick={() => onSelect('start', 'start')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'start' && justifySelf === 'start'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Top Left"
        >
          ↖
        </button>
        <button
          type="button"
          onClick={() => onSelect('start', 'center')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'start' && justifySelf === 'center'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Top Center"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onSelect('start', 'end')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'start' && justifySelf === 'end'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Top Right"
        >
          ↗
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => onSelect('center', 'start')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'center' && justifySelf === 'start'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Mid Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onSelect('center', 'center')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'center' && justifySelf === 'center'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Center"
        >
          ⊙
        </button>
        <button
          type="button"
          onClick={() => onSelect('center', 'end')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'center' && justifySelf === 'end'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Mid Right"
        >
          →
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => onSelect('end', 'start')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'end' && justifySelf === 'start'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Bottom Left"
        >
          ↙
        </button>
        <button
          type="button"
          onClick={() => onSelect('end', 'center')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'end' && justifySelf === 'center'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Bottom Center"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onSelect('end', 'end')}
          className={`h-10 flex items-center justify-center text-lg font-bold border rounded transition-all ${
            alignSelf === 'end' && justifySelf === 'end'
              ? 'bg-zine-accent text-white border-zine-accent'
              : 'bg-white border-slate-200 hover:border-zine-accent hover:bg-slate-50'
          }`}
          title="Bottom Right"
        >
          ↘
        </button>
      </div>
    </div>
  );
};
