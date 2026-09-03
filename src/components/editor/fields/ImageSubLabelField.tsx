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

/** 图像副标注文本字段 */
export const ImageSubLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  return (
    <GenericTextField
      page={page}
      onUpdate={onUpdate}
      fieldKey="imageSubLabel"
      label={label || 'Secondary Caption / Vol.'}
      icon={Type}
      placeholder="e.g. VOL. 01"
      className="text-xs font-medium border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
      customFonts={customFonts}
    />
  );
});

ImageSubLabelField.displayName = 'ImageSubLabelField';
export default ImageSubLabelField;
