import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { LucideIcon, Type } from 'lucide-react';
import { DebouncedInput, DebouncedTextArea } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

export interface GenericTextFieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  fieldKey: keyof PageData & string;
  label?: string;
  placeholder?: string;
  icon?: LucideIcon | React.ComponentType<any>;
  multiline?: boolean;
  rows?: number;
  customFonts?: CustomFont[];
  defaultFont?: string;
  defaultColor?: string;
  className?: string;
}

/**
 * 通用文本字段编辑器组件
 * 封装 FieldWrapper、Debounced 输入组件以及 Zine 样式覆盖与实时更新逻辑
 */
export const GenericTextField: React.FC<GenericTextFieldProps> = React.memo(({
  page,
  onUpdate,
  fieldKey,
  label,
  placeholder = 'Write something...',
  icon = Type,
  multiline = false,
  rows = 4,
  customFonts = [],
  defaultFont,
  defaultColor = '#0F172A',
  className = 'text-xs leading-relaxed border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors',
}) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, [fieldKey]: val });
  };

  const handleImmediateChange = (val: string) => {
    onUpdate({ ...page, [fieldKey]: val }, true);
  };

  const style = page.styleOverrides?.[fieldKey] || {};
  const value = ((page as any)[fieldKey] as string) || '';

  return (
    <FieldWrapper
      page={page}
      onUpdate={onUpdate}
      fieldKey={fieldKey}
      label={label || fieldKey}
      icon={icon}
      showStyleConfig={true}
      styleMode="text"
      customFonts={customFonts}
    >
      <div className="relative group/field">
        {multiline ? (
          <DebouncedTextArea
            rows={rows}
            value={value}
            onChange={handleChange}
            onImmediateChange={handleImmediateChange}
            placeholder={placeholder}
            className={className}
            style={{
              fontFamily: style.fontFamily || page.bodyFont || defaultFont,
              textAlign: style.align || style.textAlign,
              color: defaultColor,
            }}
          />
        ) : (
          <DebouncedInput
            value={value}
            onChange={handleChange}
            onImmediateChange={handleImmediateChange}
            placeholder={placeholder}
            className={className}
            style={{
              fontFamily: style.fontFamily || page.bodyFont || defaultFont,
              textAlign: style.align || style.textAlign,
              color: defaultColor,
            }}
          />
        )}
      </div>
    </FieldWrapper>
  );
});

GenericTextField.displayName = 'GenericTextField';
export default GenericTextField;
