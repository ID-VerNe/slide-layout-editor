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

/** 图像主标注文本字段 */
export const ImageLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  return (
    <GenericTextField
      page={page}
      onUpdate={onUpdate}
      fieldKey="imageLabel"
      label={label || 'Visual Caption / Fig.'}
      icon={Type}
      placeholder="e.g. FIG. 01 — THE MOUNTAIN"
      className="text-xs font-bold border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
      defaultFont="'Inter', sans-serif"
      customFonts={customFonts}
    />
  );
});

ImageLabelField.displayName = 'ImageLabelField';
export default ImageLabelField;