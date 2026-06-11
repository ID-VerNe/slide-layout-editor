import React from 'react';

interface PresetOption<T> {
  value: T;
  label: string;
}

interface PresetSelectProps<T> {
  value: T;
  options: readonly PresetOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/**
 * 受控预设选择器
 * 用于字号、行高、字距等设计约束字段
 */
export function PresetSelect<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className = ''
}: PresetSelectProps<T>) {
  // 查找最接近的预设值
  const findClosestOption = (val: T): PresetOption<T> => {
    if (typeof val === 'number') {
      return options.reduce((prev, curr) => {
        const prevDiff = Math.abs((prev.value as number) - (val as number));
        const currDiff = Math.abs((curr.value as number) - (val as number));
        return currDiff < prevDiff ? curr : prev;
      });
    }
    return options.find(opt => opt.value === val) || options[0];
  };

  const selectedOption = findClosestOption(value);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
          {label}
        </span>
      )}
      <select
        value={String(selectedOption.value)}
        onChange={(e) => {
          const option = options.find(opt => String(opt.value) === e.target.value);
          if (option) onChange(option.value);
        }}
        className="w-full px-3 py-2 bg-white border border-slate-200 hover:border-slate-950 focus:border-slate-950 focus:outline-none focus:ring-0 text-[10px] font-bold text-slate-950 uppercase tracking-wide transition-all cursor-pointer"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
