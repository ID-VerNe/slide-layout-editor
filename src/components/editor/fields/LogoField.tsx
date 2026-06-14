import React from 'react';
import { PageData, CustomFont } from '../../../types';
import { Image } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts?: CustomFont[];
  label?: string;
  fieldKey?: string;
  pages?: PageData[];
}

/**
 * LogoField
 * 修复版：使用具名函数以优化 HMR 并在 React 19 中提供更好的调试信息。
 */
export const LogoField = React.memo(function LogoField({
  page,
  onUpdate,
  label,
  fieldKey,
  pages
}: FieldProps) {
  const isVisible = page.visibility?.logo !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), logo: !isVisible }
    });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      manualVisibility={isVisible}
      onToggle={toggle}
      label={label || "Show Logo"}
      icon={Image}
    >
      <div className="h-1" />
    </FieldWrapper>
  );
});
