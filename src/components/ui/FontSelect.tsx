import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomFont } from '../../types';

interface FontSelectProps {
  value?: string;
  onChange: (v: string) => void;
  label?: string;
  customFonts?: CustomFont[];
  compact?: boolean;
}

/** Extracts primary font family name for robust matching */
export function normalizeFontFamily(font?: string): string {
  if (!font) return '';
  return font.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
}

export const SYSTEM_FONTS = {
  serif: [
    { label: 'Playfair Display', value: "'Playfair Display', serif" },
    { label: 'Crimson Pro', value: "'Crimson Pro', serif" },
    { label: 'Lora', value: "'Lora', serif" },
    { label: '仿宋 (FangSong)', value: "'STFangsong', 'FangSong', 'Noto Serif SC', serif" },
    { label: '思源宋体 (Noto Serif SC)', value: "'Noto Serif SC', serif" },
  ],
  sans: [
    { label: 'Inter (Sans-Serif)', value: "'Inter', sans-serif" },
  ]
};

export const FontSelect: React.FC<FontSelectProps> = ({ 
  value, 
  onChange, 
  label, 
  customFonts = [], 
  compact = false 
}) => {
  // 规范化匹配当前激活字体，支持模糊比对与自定义字体
  const resolvedValue = useMemo(() => {
    if (!value) return '';

    const allOptions = [
      ...SYSTEM_FONTS.serif,
      ...SYSTEM_FONTS.sans,
      ...customFonts.map(f => ({ label: f.name, value: f.family }))
    ];

    // 1. 精确值匹配
    const exact = allOptions.find(opt => opt.value === value);
    if (exact) return exact.value;

    // 2. 规范化匹配（去除引号、fallback等干扰）
    const norm = normalizeFontFamily(value);
    const normalizedMatch = allOptions.find(opt => normalizeFontFamily(opt.value) === norm);
    if (normalizedMatch) return normalizedMatch.value;

    return value;
  }, [value, customFonts]);

  // 检查是否为不在预设列表中的独立自定义字体
  const isCustomOrUnknown = Boolean(
    resolvedValue &&
    !SYSTEM_FONTS.serif.some(f => f.value === resolvedValue) &&
    !SYSTEM_FONTS.sans.some(f => f.value === resolvedValue) &&
    !customFonts.some(f => f.family === resolvedValue)
  );

  return (
    <div className={`flex flex-col gap-1 w-full ${compact ? 'gap-0' : ''}`}>
      {label && !compact && <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>}
      <div className="relative group">
        <select 
          value={resolvedValue} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-white text-xs font-black uppercase tracking-widest text-slate-900 pr-8 rounded-none transition-all focus:outline-none focus:border-slate-950 cursor-pointer border border-slate-200
            ${compact ? 'py-1 pl-1.5' : 'py-2.5 pl-3'}`}
        >
          {isCustomOrUnknown && (
            <optgroup label="Current Font">
              <option value={resolvedValue}>{resolvedValue}</option>
            </optgroup>
          )}

          {customFonts.length > 0 && (
            <optgroup label="Custom Fonts">
              {customFonts.map(f => (
                <option key={f.family} value={f.family}>{f.name}</option>
              ))}
            </optgroup>
          )}

          <optgroup label="Zine Spec: Serif (Han/EN)">
            {SYSTEM_FONTS.serif.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </optgroup>

          <optgroup label="Zine Spec: Sans (Latin)">
            {SYSTEM_FONTS.sans.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </optgroup>
        </select>
        <ChevronDown size={14} strokeWidth={3} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none" />
      </div>
    </div>
  );
};