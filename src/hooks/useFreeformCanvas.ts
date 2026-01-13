import { useMemo } from 'react';
import { FreeformConfig } from '../types/freeform.types';

export function useFreeformCanvas(config: FreeformConfig) {
  const snapToGrid = useMemo(() => config.snapToGrid, [config.snapToGrid]);
  const showAlignmentGuides = useMemo(() => config.showAlignmentGuides, [config.showAlignmentGuides]);
  const showGridOverlay = useMemo(() => config.showGridOverlay, [config.showGridOverlay]);
  const gridSize = useMemo(() => config.gridSize, [config.gridSize]);

  return {
    snapToGrid,
    showAlignmentGuides,
    showGridOverlay,
    gridSize,
  };
}
