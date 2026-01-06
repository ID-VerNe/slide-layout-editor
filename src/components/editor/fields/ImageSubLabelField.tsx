import React from 'react';
import { PageData } from '../../../types';
import { Type } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

/**
 * ImageSubLabelField - 二级标注编辑器
 * 专门用于 Editorial Classic 的刊号等辅助信息控制。
 */
export const ImageSubLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const handleChange = (val: string) => {
    onUpdate({ ...page, imageSubLabel: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.imageSubLabel?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        imageSubLabel: {
          ...(page.styleOverrides?.imageSubLabel || {}),
          fontSize: Math.max(6, (currentSize || 10) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="imageSubLabel" label="Secondary Caption / Vol." icon={Type}>
      <div className="relative group/field">
        <FieldToolbar onIncrease={() => updateFontSize(1)} onDecrease={() => updateFontSize(-1)} />
        <Input 
          value={page.imageSubLabel || ''} 
          onChange={(e) => handleChange(e.target.value)} 
          placeholder="e.g. VOL. 01" 
        />
      </div>
    </FieldWrapper>
  );
});
