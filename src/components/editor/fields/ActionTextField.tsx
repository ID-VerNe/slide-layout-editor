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

export const ActionTextField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.actionText !== false;

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
          fontSize: Math.max(8, (currentSize || 14) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="actionText" label="Action Button / Link" icon={Type}>
      <div className="relative group/field">
        <FieldToolbar onIncrease={() => updateFontSize(1)} onDecrease={() => updateFontSize(-1)} />
        <Input 
          value={page.actionText || ''} 
          onChange={(e) => handleChange(e.target.value)} 
          placeholder="e.g. Learn More →" 
          className={!isVisible ? 'opacity-50 grayscale' : ''}
        />
      </div>
    </FieldWrapper>
  );
});
