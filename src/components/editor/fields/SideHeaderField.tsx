import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Bookmark } from 'lucide-react';
import { GenericTextField } from './GenericTextField';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/** 侧边旋转印章/刊头文本输入 */
export const SideHeaderField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        fieldKey="sideHeader"
        label={label || 'Side Header Stamp'}
        icon={Bookmark}
        placeholder="e.g. VOL. 01 // THE ESSAY ARCHIVE"
        className="text-xs uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
        customFonts={customFonts}
      />
    );
  }
);

SideHeaderField.displayName = 'SideHeaderField';
export default SideHeaderField;
