import React from 'react';
import { PageData } from '../../../types';
import { Minus } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string; 
  fieldKey?: string;
}

/**
 * SeparatorField - 用于控制分割线的颜色与粗细
 */
export const SeparatorField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, fieldKey }) => {
  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey={fieldKey as keyof PageData}
      label={label || 'Divider'}
      icon={Minus}
      showStyleConfig={true}
    >
      <div className="h-10 w-full flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg group">
        <div 
          className="w-2/3 h-px bg-slate-300 group-hover:bg-zine-accent transition-colors"
          style={{
            backgroundColor: page.styleOverrides?.[fieldKey!]?.color,
            height: page.styleOverrides?.[fieldKey!]?.height || page.styleOverrides?.[fieldKey!]?.thickness || '1px'
          }}
        />
      </div>
    </FieldWrapper>
  );
});
