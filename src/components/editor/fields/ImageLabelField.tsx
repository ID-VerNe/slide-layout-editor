import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Type } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/**
 * ImageLabelField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 * 适配最新的 Zine 模块化架构
 */
export const ImageLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, imageLabel: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, imageLabel: val }, true);
  };

  const style = page.styleOverrides?.imageLabel || {};

  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="imageLabel"
      label={label || 'Visual Caption / Fig.'}
      icon={Type}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedInput 
            value={page.imageLabel || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="e.g. FIG. 01 — THE MOUNTAIN" 
            className="text-xs font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
            style={{ 
              fontFamily: style.fontFamily || page.bodyFont || "'Inter', sans-serif",
              textAlign: style.align || style.textAlign,
              color: '#0F172A'
            }} 
        />
      </div>
    </FieldWrapper>
  );
});