import React from 'react';
import { FreeformItem } from '../../../types/freeform.types';
import { LUCIDE_ICON_MAP } from '../../../constants/icons';
import { HelpCircle } from 'lucide-react';

export const Icon: React.FC<{ item: FreeformItem }> = ({ item }) => {
  const { content, typography } = item;
  const iconName = content?.icon || 'HelpCircle';

  // 渲染图标组件
  const renderIconContent = () => {
    // 1. 处理 Material 图标 (如果名称包含下划线通常是 material)
    if (iconName.includes('_')) {
      return (
        <span 
          className="material-symbols-outlined select-none" 
          style={{ 
            fontSize: `${Math.min(item.width, item.height) * 0.8}px`,
            color: typography?.color || 'inherit'
          }}
        >
          {iconName.toLowerCase()}
        </span>
      );
    }

    // 2. 处理 Lucide 图标
    const IconComponent = LUCIDE_ICON_MAP[iconName] || HelpCircle;
    return (
      <IconComponent 
        size={Math.min(item.width, item.height) * 0.8} 
        color={typography?.color || 'currentColor'} 
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {renderIconContent()}
    </div>
  );
};