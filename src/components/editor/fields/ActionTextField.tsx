import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Type } from 'lucide-react';
import { GenericTextField } from './GenericTextField';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/** 行动号召 / 按钮文本字段 */
export const ActionTextField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  return (
    <GenericTextField
      page={page}
      onUpdate={onUpdate}
      fieldKey="actionText"
      label={label || 'Action Text / Button'}
      icon={Type}
      placeholder="e.g. SHOP NOW"
      className="text-xs font-black uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
      defaultFont="'Inter', sans-serif"
      customFonts={customFonts}
    />
  );
});

ActionTextField.displayName = 'ActionTextField';
export default ActionTextField;