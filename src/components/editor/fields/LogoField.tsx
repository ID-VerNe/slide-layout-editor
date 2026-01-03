import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Image } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * LogoField
 * 修复版：移除危险的自定义 memo 比较逻辑。
 */
export const LogoField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
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
      label="Show Logo"
      icon={Image}
    >
      <div className="h-1" />
    </FieldWrapper>
  );
});