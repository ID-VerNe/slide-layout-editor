import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, Tag } from 'lucide-react';
import { DebouncedInput } from '../../ui/DebouncedBase';
import { FieldToolbar } from './FieldToolbar';
import { FieldWrapper } from './FieldWrapper';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * ActionTextField
 * 修复版：移除危险的自定义 memo 比较逻辑。
 */
export const ActionTextField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, actionText: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.actionText?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        actionText: {
          ...(page.styleOverrides?.actionText || {}),
          fontSize: Math.max(8, (currentSize || 13) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="actionText" 
      label="Block Label"
      icon={Tag}
    >
      <div className="relative">
        <FieldToolbar 
            onIncrease={() => updateFontSize(1)} 
            onDecrease={() => updateFontSize(-1)} 
        />
        <DebouncedInput 
            value={page.actionText || ''} 
            onChange={handleChange} 
            placeholder="Label text..." 
        />
      </div>
    </FieldWrapper>
  );
});