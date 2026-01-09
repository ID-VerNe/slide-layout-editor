import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualScrollContainerProps {
  itemCount: number;
  itemHeight: number;
  gap: number;
  renderItem: (index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
}

const VirtualScrollContainer: React.FC<VirtualScrollContainerProps> = ({
  itemCount,
  itemHeight,
  gap,
  renderItem,
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-y-auto ${className}`}
      style={{
        height: '100%',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(virtualItem.index, {
              height: `${itemHeight}px`,
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualScrollContainer;
