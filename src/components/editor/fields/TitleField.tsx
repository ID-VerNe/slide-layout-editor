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
 * TitleField - 已重构：基于 FieldWrapper 与 ZineStylePanel
 */
export const TitleField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, title: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, title: val }, true);
  };

  const style = page.styleOverrides?.title || {};
  
  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey="title"
      label={label || 'Headline'}
      icon={Type}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        <DebouncedTextArea 
            rows={2} 
            value={page.title || ''} 
            onChange={handleChange} 
            onImmediateChange={handleImmediateChange}
            placeholder="Headline..." 
            className="text-sm font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors" 
            style={{ 
              fontFamily: style.fontFamily || page.titleFont,
              textAlign: style.align || style.textAlign,
              color: '#0F172A' // 锁定为深色以保证编辑器可见性
            }} 
        />
        <div className="absolute left-3 bottom-2 flex items-center gap-1 opacity-20 pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-widest">
            {style.presetKey || 'CUSTOM'}
          </span>
        </div>
      </div>
    </FieldWrapper>
  );
});
