import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Copyright } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/**
 * FooterField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 * 适配最新的 Zine 模块化架构
 */
export const FooterField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, footer: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, footer: val }, true);
  };

  const style = page.styleOverrides?.footer || {};

  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="footer"
      label={label || 'Footer Metadata'}
      icon={Copyright}
      showStyleConfig={true}
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedInput 
            value={page.footer || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="e.g. All Rights Reserved // 2026" 
            className="text-[10px] font-black uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
            style={{ 
              fontFamily: style.fontFamily || page.bodyFont || "'Inter', sans-serif",
              textAlign: style.textAlign,
              color: '#0F172A'
            }} 
        />
      </div>
    </FieldWrapper>
  );
});