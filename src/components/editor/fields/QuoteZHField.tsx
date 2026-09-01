import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Quote } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/**
 * QuoteZHField - 金句中文译文编辑器
 */
export const QuoteZHField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    const handleChange = (val: string) => {
      onUpdate({ ...page, quoteZH: val });
    };

    const handleImmediateChange = (val: string) => {
      onUpdate({ ...page, quoteZH: val }, true);
    };

    const style = page.styleOverrides?.quoteZH || {};

    return (
      <FieldWrapper
        page={page}
        onUpdate={onUpdate}
        fieldKey="quoteZH"
        label={label || 'Quote Translation (ZH)'}
        icon={Quote}
        showStyleConfig={true}
        styleMode="text"
        customFonts={customFonts}
      >
        <div className="relative group/field">
          <DebouncedTextArea
            rows={2}
            value={page.quoteZH || ''}
            onChange={handleChange}
            onImmediateChange={handleImmediateChange}
            placeholder="输入金句中文释义..."
            className="text-xs leading-relaxed border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
            style={{
              fontFamily:
                style.fontFamily ||
                page.bodyFont ||
                "'Noto Serif SC', 'STFangsong', serif",
              textAlign: style.textAlign,
              color: '#475569',
            }}
          />
        </div>
      </FieldWrapper>
    );
  }
);

QuoteZHField.displayName = 'QuoteZHField';
export default QuoteZHField;
