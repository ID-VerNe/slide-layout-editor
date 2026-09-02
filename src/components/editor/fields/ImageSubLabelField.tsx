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
 * ImageSubLabelField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 * 适配最新的 Zine 模块化架构
 */
export const ImageSubLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, imageSubLabel: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, imageSubLabel: val }, true);
  };

  const style = page.styleOverrides?.imageSubLabel || {};

  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="imageSubLabel"
      label={label || 'Secondary Caption / Vol.'}
      icon={Type}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedInput 
            value={page.imageSubLabel || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="e.g. VOL. 01" 
            className="text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
            style={{ 
              fontFamily: style.fontFamily || page.bodyFont,
              textAlign: style.align || style.textAlign,
              color: '#0F172A'
            }} 
        />
      </div>
    </FieldWrapper>
  );
});
