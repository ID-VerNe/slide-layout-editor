import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Languages } from 'lucide-react';
import { DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/**
 * ParagraphZHField - 中文译文段落编辑器
 * 遵循双语排版中的“影子层级”，默认使用纤细宋体与柔和灰调
 */
export const ParagraphZHField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    const handleChange = (val: string) => {
      onUpdate({ ...page, paragraphZH: val });
    };

    const handleImmediateChange = (val: string) => {
      onUpdate({ ...page, paragraphZH: val }, true);
    };

    const style = page.styleOverrides?.paragraphZH || {};

    return (
      <FieldWrapper
        page={page}
        onUpdate={onUpdate}
        fieldKey="paragraphZH"
        label={label || 'Chinese Translation'}
        icon={Languages}
        showStyleConfig={true}
        styleMode="text"
        customFonts={customFonts}
      >
        <div className="relative group/field">
          <DebouncedTextArea
            rows={4}
            value={page.paragraphZH || ''}
            onChange={handleChange}
            onImmediateChange={handleImmediateChange}
            placeholder="输入中文对照译文（思源宋体/弱对比灰）..."
            className="text-xs leading-relaxed border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
            style={{
              fontFamily:
                style.fontFamily ||
                page.bodyFont ||
                "'Noto Serif SC', 'STFangsong', serif",
              textAlign: style.align || style.textAlign,
              color: '#475569',
            }}
          />
        </div>
      </FieldWrapper>
    );
  }
);

ParagraphZHField.displayName = 'ParagraphZHField';
export default ParagraphZHField;
