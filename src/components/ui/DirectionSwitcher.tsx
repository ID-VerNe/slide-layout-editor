import React from 'react';
import { 
  AlignLeft, 
  AlignRight, 
  ArrowUp, 
  ArrowDown, 
  Columns, 
  Rows, 
  Wind, 
  Layers, 
  Layout,
  LucideIcon 
} from 'lucide-react';

export type SwitcherDirectionMode = 'left-right' | 'top-bottom' | 'horizontal-vertical' | 'capsule' | 'custom';

export interface SwitcherOption {
  value: string;
  label: string;
  icon?: string;
}

interface DirectionSwitcherProps {
  value?: string;
  onChange: (value: string) => void;
  mode?: SwitcherDirectionMode;
  options?: SwitcherOption[];
  className?: string;
}

// Map icon names to Lucide icons
const ICON_MAP: Record<string, LucideIcon> = {
  AlignLeft,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Columns,
  Rows,
  Wind,
  Layers,
  Layout,
};

const MODE_PRESETS: Record<Exclude<SwitcherDirectionMode, 'custom'>, SwitcherOption[]> = {
  'left-right': [
    { value: 'left', label: 'Image Left', icon: 'AlignLeft' },
    { value: 'right', label: 'Image Right', icon: 'AlignRight' },
  ],
  'top-bottom': [
    { value: 'top', label: 'Headline Top', icon: 'ArrowUp' },
    { value: 'bottom', label: 'Headline Bottom', icon: 'ArrowDown' },
  ],
  'horizontal-vertical': [
    { value: 'horizontal', label: 'Horizontal', icon: 'Columns' },
    { value: 'vertical', label: 'Vertical', icon: 'Rows' },
  ],
  'capsule': [
    { value: 'under', label: 'Under', icon: 'ArrowDown' },
    { value: 'over', label: 'Over', icon: 'ArrowUp' },
    { value: 'minimal', label: 'Minimal', icon: 'Wind' },
  ],
};

/** 根据当前值或显式模式推导最终选项列表 */
function resolveOptions(mode?: SwitcherDirectionMode, options?: SwitcherOption[], currentValue?: string): SwitcherOption[] {
  if (options && options.length > 0) {
    return options;
  }
  if (mode && mode !== 'custom' && MODE_PRESETS[mode]) {
    return MODE_PRESETS[mode];
  }
  // 启发式安全回退
  if (currentValue === 'under' || currentValue === 'over' || currentValue === 'minimal') {
    return MODE_PRESETS.capsule;
  }
  if (currentValue === 'horizontal' || currentValue === 'vertical') {
    return MODE_PRESETS['horizontal-vertical'];
  }
  if (currentValue === 'top' || currentValue === 'bottom') {
    return MODE_PRESETS['top-bottom'];
  }
  return MODE_PRESETS['left-right'];
}

/**
 * DirectionSwitcher - 专属方向与变体切换器
 */
export const DirectionSwitcher: React.FC<DirectionSwitcherProps> = ({
  value,
  onChange,
  mode,
  options: customOptions,
  className = '',
}) => {
  const resolvedOptions = resolveOptions(mode, customOptions, value);
  const activeValue = value || resolvedOptions[0]?.value;

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComp = ICON_MAP[iconName];
    if (!IconComp) return null;
    return <IconComp size={14} className="shrink-0" />;
  };

  return (
    <div 
      className={`grid gap-2 p-1 bg-slate-100 rounded-2xl ${className}`}
      style={{ gridTemplateColumns: `repeat(${resolvedOptions.length}, minmax(0, 1fr))` }}
    >
      {resolvedOptions.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider ${
              isActive
                ? 'bg-white text-[#264376] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {renderIcon(opt.icon)}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
