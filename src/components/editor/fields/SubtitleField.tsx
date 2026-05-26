import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Type } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string; 
  customFonts: CustomFont[];
}

/**
 * SubtitleField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 */
export const SubtitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, subtitle: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, subtitle: val }, true);
  };

  const style = page.styleOverrides?.subtitle || {};
  
  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="subtitle"
      label={label || 'Subtitle'}
      icon={Type}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedTextArea 
            rows={2} 
            value={page.subtitle || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="Subtitle..." 
            className="text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
            style={{ 
              fontFamily: style.fontFamily || page.bodyFont,
              textAlign: style.textAlign,
              color: '#0F172A'
            }} 
        />
      </div>
    </FieldWrapper>
  );
});
