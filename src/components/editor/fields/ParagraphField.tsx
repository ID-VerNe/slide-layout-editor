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

/** 段落文本输入字段 */
export const ParagraphField: React.FC<FieldProps> = React.memo(({ page, onUpdate, label, customFonts }) => {
  return (
    <GenericTextField
      page={page}
      onUpdate={onUpdate}
      fieldKey="paragraph"
      label={label || 'Body Text'}
      icon={Type}
      multiline={true}
      rows={5}
      placeholder="Write something..."
      customFonts={customFonts}
    />
  );
});

ParagraphField.displayName = 'ParagraphField';
export default ParagraphField;
