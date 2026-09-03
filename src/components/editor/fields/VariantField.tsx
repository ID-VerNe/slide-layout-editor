import React from 'react';
import { PageData } from '../../../types';
import { Layout, Layers } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';
import { DirectionSwitcher, SwitcherDirectionMode, SwitcherOption } from '../../ui/DirectionSwitcher';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  label?: string;
  options?: SwitcherOption[];
  mode?: SwitcherDirectionMode;
}

/**
 * VariantField - 动态布局切换器
 * 核心升级：基于专属 DirectionSwitcher 图元组件，支持声明式 options 与内置方向预设
 */
export const VariantField: React.FC<FieldProps> = React.memo(({ 
  page, 
  onUpdate, 
  label, 
  options,
  mode 
}) => {
  const isCapsule = page.layoutId === 'gallery-capsule';
  const isDiptych = page.layoutId === 'film-diptych';

  const setVariant = (val: string) => {
    onUpdate({ ...page, layoutVariant: val });
  };

  // 推导模式
  const resolvedMode: SwitcherDirectionMode = mode || (
    options && options.length > 0
      ? 'custom'
      : isCapsule
        ? 'capsule'
        : isDiptych
          ? 'horizontal-vertical'
          : 'left-right'
  );

  // 推导展示标题与图标
  const fieldLabel = label || (isCapsule ? 'Visual Scheme' : isDiptych ? 'Split Direction' : 'Layout Orientation');
  const fieldIcon = isCapsule ? Layers : Layout;

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="variant" label={fieldLabel} icon={fieldIcon}>
      <DirectionSwitcher
        value={page.layoutVariant}
        onChange={setVariant}
        mode={resolvedMode}
        options={options}
      />
    </FieldWrapper>
  );
});