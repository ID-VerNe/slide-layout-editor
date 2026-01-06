import React from 'react';
import { PageData } from '../../../types';
import { Type } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: any; // 弃用
}

/**
 * ParagraphField - 极简版
 * 遵循全局 Typography 设定，移除局部工具栏。
 */
export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, paragraph: val });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="paragraph" 
      label="Narrative Essay" 
      icon={Type}
    >
      <div className="relative group/field">
        <DebouncedTextArea 
            value={page.paragraph || ''} 
            onChange={handleChange} 
            placeholder="Start writing your story here..." 
            rows={12}
            className="text-[13px] leading-relaxed bg-slate-50 border-slate-100 min-h-[250px] focus:bg-white transition-all"
        />
      </div>
    </FieldWrapper>
  );
});
