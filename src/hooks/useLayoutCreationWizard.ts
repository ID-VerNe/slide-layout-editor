import { useState, useCallback } from 'react';
import { AspectRatioType, LAYOUT_CONFIG, OrientationType } from '../constants/layout';
import { PageData } from '../types';
import { getTemplateById, TemplateConfig } from '../templates/registry';
import { applyTemplateDefaults } from '../utils/templateDefaults';

export interface UseLayoutCreationWizardParams {
  pages: PageData[];
  currentPage: PageData | undefined;
  modalMode: 'create' | 'change';
}

export interface UseLayoutCreationWizardResult {
  isOpen: boolean;
  modalMode: 'create' | 'change';
  creationStage: 'orientation' | 'ratio' | 'template';
  selectedOrientation: OrientationType;
  selectedRatio: AspectRatioType;
  openForCreate: () => void;
  openForChange: () => void;
  close: () => void;
  selectOrientation: (ori: OrientationType) => void;
  selectRatio: (ratio: AspectRatioType) => void;
  backToOrientation: () => void;
  backToRatio: () => void;
  finalize: (layoutId: string, actions: {
    updatePage: (page: PageData) => void;
    addPage: (ratio: AspectRatioType, layoutId: string) => void;
  }) => void;
}

function mergeDefaultsForLayout(
  target: PageData,
  layoutId: string,
  selectedRatio: AspectRatioType,
  templateConfig: TemplateConfig | undefined
): PageData {
  return applyTemplateDefaults({ ...target, layoutId, aspectRatio: selectedRatio }, templateConfig);
}

export function useLayoutCreationWizard(params: UseLayoutCreationWizardParams): UseLayoutCreationWizardResult {
  const { pages, currentPage, modalMode: initialMode } = params;

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'change'>(initialMode);
  const [creationStage, setCreationStage] = useState<'orientation' | 'ratio' | 'template'>('orientation');
  const [selectedOrientation, setSelectedOrientation] = useState<OrientationType>('landscape');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('16:9');

  const syncFromCurrentPage = useCallback(() => {
    if (currentPage) {
      const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
      setSelectedOrientation(currentConfig.orientation);
      setSelectedRatio(currentPage.aspectRatio || '16:9');
    }
  }, [currentPage]);

  const openForCreate = useCallback(() => {
    setModalMode('create');
    setCreationStage('orientation');
    setIsOpen(true);
  }, []);

  const openForChange = useCallback(() => {
    setModalMode('change');
    syncFromCurrentPage();
    setIsOpen(true);
  }, [syncFromCurrentPage]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectOrientation = useCallback((ori: OrientationType) => {
    setSelectedOrientation(ori);
    if (ori === 'resume') {
      setSelectedRatio('A4');
      setCreationStage('template');
    } else {
      const firstRatio = Object.keys(LAYOUT_CONFIG).find(
        k => LAYOUT_CONFIG[k as AspectRatioType].orientation === ori
      ) as AspectRatioType;
      setSelectedRatio(firstRatio || '16:9');
      setCreationStage('ratio');
    }
  }, []);

  const selectRatio = useCallback((ratio: AspectRatioType) => {
    setSelectedRatio(ratio);
    setCreationStage('template');
  }, []);

  const backToOrientation = useCallback(() => {
    setCreationStage('orientation');
  }, []);

  const backToRatio = useCallback(() => {
    setCreationStage('ratio');
  }, []);

  const finalize = useCallback((layoutId: string, actions: {
    updatePage: (page: PageData) => void;
    addPage: (ratio: AspectRatioType, layoutId: string) => void;
  }) => {
    const templateConfig = getTemplateById(layoutId);

    if (modalMode === 'create' && pages[0]?.title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
      actions.updatePage(mergeDefaultsForLayout({ ...pages[0], title: 'New Slide' }, layoutId, selectedRatio, templateConfig));
    } else if (modalMode === 'create') {
      actions.addPage(selectedRatio, layoutId);
    } else if (currentPage) {
      actions.updatePage(mergeDefaultsForLayout(currentPage, layoutId, selectedRatio, templateConfig));
    }
    setIsOpen(false);
  }, [modalMode, pages, currentPage, selectedRatio]);

  return {
    isOpen,
    modalMode,
    creationStage,
    selectedOrientation,
    selectedRatio,
    openForCreate,
    openForChange,
    close,
    selectOrientation,
    selectRatio,
    backToOrientation,
    backToRatio,
    finalize,
  };
}
