import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Languages } from 'lucide-react';
import { GenericTextField } from './GenericTextField';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/** 中文译文段落编辑器 */
export const ParagraphZHField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        fieldKey="paragraphZH"
        label={label || 'Chinese Translation'}
        icon={Languages}
        multiline={true}
        rows={4}
        placeholder="输入中文对照译文（思源宋体/弱对比灰）..."
        defaultFont="'Noto Serif SC', 'STFangsong', serif"
        defaultColor="#475569"
        customFonts={customFonts}
      />
    );
  }
);

ParagraphZHField.displayName = 'ParagraphZHField';
export default ParagraphZHField;
