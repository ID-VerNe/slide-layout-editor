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

export const ImageLabelField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const isVisible = page.visibility?.imageLabel !== false;

  const handleChange = (val: string) => {
    onUpdate({ ...page, imageLabel: val });
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.imageLabel?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        imageLabel: {
          ...(page.styleOverrides?.imageLabel || {}),
          fontSize: Math.max(6, (currentSize || 10) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="imageLabel" label="Visual Caption / Fig." icon={Type}>
      <div className="relative group/field">
        <FieldToolbar onIncrease={() => updateFontSize(1)} onDecrease={() => updateFontSize(-1)} />
        <Input 
          value={page.imageLabel || ''} 
          onChange={(e) => handleChange(e.target.value)} 
          placeholder="e.g. FIG. 01 — THE MOUNTAIN" 
          className={!isVisible ? 'opacity-50 grayscale' : ''}
        />
      </div>
    </FieldWrapper>
  );
});