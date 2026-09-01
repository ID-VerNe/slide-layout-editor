import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Bookmark } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  label?: string;
  customFonts: CustomFont[];
}

/**
 * SideHeaderField - 侧边旋转印章/刊头文本输入
 * 用于在页面侧边沿 90° 旋转排版，强化实体杂志感（如 VOL. 01 // THE TIMES）
 */
export const SideHeaderField: React.FC<FieldProps> = React.memo(
  ({ page, onUpdate, label, customFonts }) => {
    const handleChange = (val: string) => {
      onUpdate({ ...page, sideHeader: val });
    };

    const handleImmediateChange = (val: string) => {
      onUpdate({ ...page, sideHeader: val }, true);
    };

    const style = page.styleOverrides?.sideHeader || {};

    return (
      <FieldWrapper
        page={page}
        onUpdate={onUpdate}
        fieldKey="sideHeader"
        label={label || 'Side Header Stamp'}
        icon={Bookmark}
        showStyleConfig={true}
        styleMode="text"
        customFonts={customFonts}
      >
        <div className="relative group/field">
          <DebouncedInput
            value={page.sideHeader || ''}
            onChange={handleChange}
            onImmediateChange={handleImmediateChange}
            placeholder="e.g. VOL. 01 // THE ESSAY ARCHIVE"
            className="text-xs uppercase tracking-widest border-slate-100 hover:border-zine-accent focus:border-zine-accent transition-colors"
            style={{
              fontFamily: style.fontFamily || page.titleFont,
              color: '#0F172A',
            }}
          />
        </div>
      </FieldWrapper>
    );
  }
);

SideHeaderField.displayName = 'SideHeaderField';
export default SideHeaderField;
