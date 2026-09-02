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
 * ParagraphField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 */
export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, paragraph: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, paragraph: val }, true);
  };

  const style = page.styleOverrides?.paragraph || {};
  
  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="paragraph"
      label={label || 'Body Text'}
      icon={Type}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedTextArea 
            rows={5} 
            value={page.paragraph || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="Write something..." 
            className="text-xs leading-relaxed border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
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
