import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Quote } from 'lucide-react';
import { GenericTextField } from './GenericTextField';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/** 金句中文译文编辑器 */
export const QuoteZHField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    return (
      <GenericTextField
        page={page}
        onUpdate={onUpdate}
        fieldKey="quoteZH"
        label={label || 'Quote Translation (ZH)'}
        icon={Quote}
        multiline={true}
        rows={2}
        placeholder="输入金句中文释义..."
        defaultFont="'Noto Serif SC', 'STFangsong', serif"
        defaultColor="#475569"
        customFonts={customFonts}
      />
    );
  }
);

QuoteZHField.displayName = 'QuoteZHField';
export default QuoteZHField;
