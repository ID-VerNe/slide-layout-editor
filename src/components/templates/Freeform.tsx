import React, { useCallback } from 'react';
import { PageData } from '../../types';
import { FreeformItem, FreeformConfig } from '../../types/freeform.types';
import { FreeformCanvas } from '../freeform/FreeformCanvas';
import { FreeformToolbar } from '../freeform/FreeformToolbar';

interface FreeformProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export default function Freeform({ page, onUpdate }: FreeformProps) {
  const items = page.freeformItems || [];
  const config = page.freeformConfig || {
    gridSize: 20,
    snapToGrid: true,
    showAlignmentGuides: true,
    showGridOverlay: true,
  };

  const handleUpdateItems = useCallback((newItems: FreeformItem[]) => {
    onUpdate({ ...page, freeformItems: newItems });
  }, [onUpdate, page]);

  const handleUpdateConfig = useCallback((newConfig: FreeformConfig) => {
    onUpdate({ ...page, freeformConfig: { ...config, ...newConfig } });
  }, [onUpdate, page, config]);

  const handleAdd = useCallback((item: FreeformItem) => {
    onUpdate({ ...page, freeformItems: [...items, item] });
  }, [onUpdate, page, items]);

  return (
    <div className="w-full h-full relative bg-white overflow-hidden">
      <FreeformToolbar onAdd={handleAdd} />
      <FreeformCanvas
        items={items}
        page={page}
        config={config}
        onUpdate={handleUpdateItems}
        onConfigUpdate={handleUpdateConfig}
      />
    </div>
  );
}
