import React from 'react';
import { PageData, CustomFont } from '../../../../types';
import { Type, RotateCcw } from 'lucide-react';
import { TypographyPropertyControl } from './TypographyPropertyControl';

interface MetricsStylePanelProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

/**
 * MetricsStylePanel - BigDataMetrics 排版样式设置面板
 */
export const MetricsStylePanel: React.FC<MetricsStylePanelProps> = ({
  page,
  onUpdate,
  customFonts,
}) => {
  const styles = (page.styleOverrides?.bigDataMetrics || {}) as any;

  const updateStyle = (part: 'value' | 'label' | 'unit', key: string, value: any) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        bigDataMetrics: {
          ...styles,
          [part]: {
            ...(styles[part] || {}),
            [key]: value,
          },
        },
      },
    });
  };

  const resetAll = () => {
    const nextOverrides = { ...(page.styleOverrides || {}) };
    delete nextOverrides.bigDataMetrics;
    onUpdate({ ...page, styleOverrides: nextOverrides });
  };

  const valueStyle = styles.value || {};
  const labelStyle = styles.label || {};
  const unitStyle = styles.unit || {};

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Type size={14} className="text-zine-accent" />
          <span className="text-[10px] font-black uppercase tracking-wider">Metrics Style</span>
        </div>
        {Object.keys(styles).length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="text-[8px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1"
          >
            <RotateCcw size={10} /> RESET
          </button>
        )}
      </div>

      <TypographyPropertyControl
        title="Value (数值)"
        size={valueStyle.size || 3.5}
        sizeStep={0.5}
        minSize={0.5}
        fontFamily={valueStyle.fontFamily}
        bold={valueStyle.bold}
        italic={valueStyle.italic}
        color={valueStyle.color}
        customFonts={customFonts}
        onSizeChange={(size) => updateStyle('value', 'size', size)}
        onFontChange={(font) => updateStyle('value', 'fontFamily', font)}
        onBoldToggle={(bold) => updateStyle('value', 'bold', bold)}
        onItalicToggle={(italic) => updateStyle('value', 'italic', italic)}
        onColorChange={(color) => updateStyle('value', 'color', color)}
      />

      <TypographyPropertyControl
        title="Label (标签)"
        size={labelStyle.size || 2.25}
        sizeStep={0.25}
        minSize={0.5}
        fontFamily={labelStyle.fontFamily}
        bold={labelStyle.bold}
        italic={labelStyle.italic}
        color={labelStyle.color}
        customFonts={customFonts}
        onSizeChange={(size) => updateStyle('label', 'size', size)}
        onFontChange={(font) => updateStyle('label', 'fontFamily', font)}
        onBoldToggle={(bold) => updateStyle('label', 'bold', bold)}
        onItalicToggle={(italic) => updateStyle('label', 'italic', italic)}
        onColorChange={(color) => updateStyle('label', 'color', color)}
      />

      <TypographyPropertyControl
        title="Unit (单位)"
        size={unitStyle.size || 1.5}
        sizeStep={0.25}
        minSize={0.5}
        fontFamily={unitStyle.fontFamily}
        bold={unitStyle.bold}
        italic={unitStyle.italic}
        color={unitStyle.color}
        customFonts={customFonts}
        onSizeChange={(size) => updateStyle('unit', 'size', size)}
        onFontChange={(font) => updateStyle('unit', 'fontFamily', font)}
        onBoldToggle={(bold) => updateStyle('unit', 'bold', bold)}
        onItalicToggle={(italic) => updateStyle('unit', 'italic', italic)}
        onColorChange={(color) => updateStyle('unit', 'color', color)}
      />
    </div>
  );
};
