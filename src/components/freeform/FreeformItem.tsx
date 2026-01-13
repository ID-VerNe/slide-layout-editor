import React from 'react';
import { FreeformItem as FreeformItemType } from '../../types/freeform.types';
import { PageData } from '../../types';
import { TextBlock } from './components/TextBlock';
import { ImageBlock } from './components/ImageBlock';
import { Shape } from './components/Shape';
import { Icon } from './components/Icon';

interface FreeformItemProps {
  item: FreeformItemType;
  isSelected: boolean;
  page: PageData;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export const FreeformItem: React.FC<FreeformItemProps> = ({
  item,
  isSelected,
  page,
  onMouseDown,
  onResizeStart,
}) => {
  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return <TextBlock item={item} page={page} />;
      case 'image':
        // 核心修复：透传 page 以便 SlideImage 正确解析资源
        return <ImageBlock item={item} page={page} />;
      case 'shape':
        return <Shape item={item} />;
      case 'icon':
        return <Icon item={item} />;
      default:
        return null;
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onResizeStart(e, handle);
  };

  const visualStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: item.backgroundColor,
    borderColor: item.borderColor,
    borderWidth: item.borderWidth,
    borderStyle: item.borderWidth ? 'solid' : undefined,
    borderRadius: (item.type === 'shape' && item.content?.shape === 'circle') ? '50%' : item.borderRadius,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return (
    <div
      className="absolute cursor-move select-none group"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        opacity: item.opacity,
        transform: `rotate(${item.rotation || 0}deg)`,
        zIndex: item.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
    >
      <div style={visualStyle}>
        {renderContent()}
      </div>
      
      {isSelected && (
        <div 
          className="absolute inset-0 border-2 border-[#264376] pointer-events-none"
          style={{ borderRadius: visualStyle.borderRadius }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#264376] rounded-full pointer-events-auto cursor-nw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#264376] rounded-full pointer-events-auto cursor-ne-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#264376] rounded-full pointer-events-auto cursor-sw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#264376] border border-white rounded-full pointer-events-auto cursor-se-resize shadow-sm" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
        </div>
      )}
    </div>
  );
};