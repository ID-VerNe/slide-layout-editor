import React from 'react';
import { PageData } from '../../../types';
import { Copyright } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * FooterField - 页脚版权编辑器
 * 允许用户自定义单页或全局的页脚元数据内容。
 */
export const FooterField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, footer: val });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="footer" 
      label="Footer Metadata" 
      icon={Copyright}
    >
      <div className="space-y-2">
        <Input 
          value={page.footer || ''} 
          onChange={(e) => handleChange(e.target.value)} 
          placeholder="e.g. All Rights Reserved // 2026"
          className="text-[10px] uppercase font-bold"
        />
        <p className="text-[8px] text-slate-400 italic px-1">
          Appears at the very bottom of the page.
        </p>
      </div>
    </FieldWrapper>
  );
});
