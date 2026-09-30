import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Monitor } from 'lucide-react';

import { useProject } from '../hooks/useProject';
import { usePreview } from '../hooks/usePreview';
import { useProjectPersistence, useCustomFontsDom } from '../hooks/useProjectPersistence';
import { useExportPipeline } from '../hooks/useExportPipeline';
import { useEditorShortcuts } from '../hooks/useEditorShortcuts';
import { useLayoutCreationWizard } from '../hooks/useLayoutCreationWizard';
import Sidebar from '../components/editor/Sidebar';
import TopNav from '../components/editor/TopNav';
import PreviewArea from '../components/editor/PreviewArea';
import EditorPanel from '../components/editor/EditorPanel';
import GlobalSettings from '../components/editor/GlobalSettings';
import Modal from '../components/Modal';
import { LayoutBrowserModal } from '../components/editor/modals/LayoutBrowserModal';
import { ExportModal } from '../components/editor/modals/ExportModal';
import { OffscreenExportRenderer } from '../components/editor/OffscreenExportRenderer';
import { LAYOUT } from '../constants/layout';
import { useStore } from '../store/useStore';

export default function EditorPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewProject = searchParams.get('new') === 'true';
  const templateId = searchParams.get('template');

  const {
    pages, projectTitle, setProjectTitle, theme,
    currentPageIndex, setCurrentPageIndex, currentPage,
    isLoaded, updatePage, addPage, removePage, reorderPages,
    loadProject, saveToDB, undo, redo, canUndo, canRedo,
    printSettings, imageQuality, minimalCounter, counterStyle, customFonts,
    currentFilePath, setCurrentFilePath, hasUnsavedChanges, markAsSaved,
  } = useProject(projectId, templateId);

  // 字体 DOM 注册副作用:customFonts 变化即注册到 document.fonts
  useCustomFontsDom(customFonts);

  const activeProjectId = useStore(s => s.activeProjectId);

  useEffect(() => {
    if (projectId && activeProjectId !== projectId) {
      loadProject(projectId, templateId);
    }
  }, [projectId, activeProjectId, loadProject, templateId]);

  const { previewZoom, setPreviewZoom, isAutoFit, setIsAutoFit, previewRef, previewContainerRef, handleManualZoom, toggleFit, handleOverflowChange } = usePreview({ pages, currentPageIndex, printSettings, minimalCounter, isLoaded });

  const fallbackTitle = pages[0]?.title || 'Untitled Project';

  const { handleSmartSave, handleSaveAs, handleNativeOpen } = useProjectPersistence({
    isLoaded, projectId, pages, projectTitle, fallbackTitle, theme,
    minimalCounter, counterStyle, customFonts, imageQuality, printSettings,
    currentFilePath, previewRef, saveToDB, loadProject,
    markAsSaved, setCurrentFilePath, hasUnsavedChanges,
  });

  const exportPipeline = useExportPipeline();

  const wizard = useLayoutCreationWizard({ pages, currentPage, modalMode: 'create' });

  // 文档标题 effect:IPC 同步由 loadProject 单点负责,此处只维护标题
  useEffect(() => {
    const fileName = currentFilePath ? currentFilePath.split(/[\\/]/).pop() : (projectTitle || fallbackTitle);
    const unsavedMark = hasUnsavedChanges ? '● ' : '';
    document.title = `${unsavedMark}${fileName} | SlideGrid Studio`;
  }, [projectTitle, fallbackTitle, currentFilePath, hasUnsavedChanges]);

  // 新工程占位:URL 带 new=true 且首页仍是占位标题时,弹出 3 步创建向导
  useEffect(() => {
    if (isNewProject && isLoaded && pages.length === 1 && pages[0].title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
      wizard.openForCreate();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('new');
      setSearchParams(nextParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewProject, isLoaded, pages]);

  // 键盘快捷键:Ctrl+S 保存、Ctrl+Shift+S 另存为、Ctrl+Z/Y 撤销重做
  useEditorShortcuts({
    onSave: handleSmartSave,
    onSaveAs: handleSaveAs,
    onUndo: undo,
    onRedo: redo,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor "Change Layout" 按钮通过 callback prop 触发,替代原 window CustomEvent 通道
  const handleOpenLayoutBrowser = useCallback((mode: 'create' | 'change') => {
    if (mode === 'create') wizard.openForCreate();
    else wizard.openForChange();
  }, [wizard]);

  const handleExport = useCallback(async (format: 'png' | 'pdf') => {
    await exportPipeline.handleExport(
      format, exportScope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings,
    );
  }, [exportPipeline, exportScope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings]);

  // 稳定化高频子组件的内联回调,避免穿透 React.memo
  const handleClearAll = useCallback(() => {
    if (projectId) useStore.getState().loadProject(projectId, null);
  }, [projectId]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleToggleFontManager = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const handleNavigateHome = useCallback(() => navigate('/'), [navigate]);

  const handleExportPng = useCallback((all: boolean) => {
    setExportScope(all ? 'all' : 'current');
    setShowExportModal(true);
  }, []);

  const handleToggleEditor = useCallback(() => {
    setShowEditor(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      <Sidebar pages={pages} currentPageIndex={currentPageIndex} onPageSelect={setCurrentPageIndex} onAddPage={() => handleOpenLayoutBrowser('create')} onRemovePage={removePage} onReorderPages={reorderPages} onClearAll={handleClearAll} onImport={handleImport} onExport={() => setShowExportModal(true)} onToggleFontManager={handleToggleFontManager} showFontManager={showSettings} onNavigateHome={handleNavigateHome} onNativeSave={handleSmartSave} onNativeSaveAs={handleSaveAs} onNativeOpen={handleNativeOpen} />
      <AnimatePresence>{exportPipeline.isExporting && exportPipeline.exportProgress > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#264376]/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10"><div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mb-6"><motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${exportPipeline.exportProgress}%` }} /></div><p className="text-[10px] font-black uppercase tracking-[0.4em]">Exporting Archive {exportPipeline.exportProgress}%</p></motion.div>)}</AnimatePresence>
      <div className="flex-1 flex overflow-hidden">
        <motion.div initial={false} animate={{ flex: 1 }} className="bg-neutral-200/50 flex flex-col overflow-hidden relative">
          <TopNav projectTitle={projectTitle} setProjectTitle={setProjectTitle} fallbackTitle={fallbackTitle} currentPageIndex={currentPageIndex} totalPages={pages.length} onPageChange={setCurrentPageIndex} previewZoom={previewZoom} onZoomChange={handleManualZoom} isAutoFit={isAutoFit} onToggleAutoFit={toggleFit} onExportPng={handleExportPng} onSave={handleSmartSave} onSaveAs={handleSaveAs} isExporting={exportPipeline.isExporting} showExportMenu={showExportMenu} setShowExportMenu={setShowExportMenu} exportMenuRef={exportMenuRef} showEditor={showEditor} onToggleEditor={handleToggleEditor} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
          <PreviewArea pages={pages} currentPageIndex={currentPageIndex} previewZoom={previewZoom} previewRef={previewRef} previewContainerRef={previewContainerRef} enforceA4={false} isAutoFit={isAutoFit} setIsAutoFit={setIsAutoFit} printSettings={printSettings} minimalCounter={minimalCounter} onOverflowChange={handleOverflowChange} onUpdatePage={updatePage} handleManualZoom={handleManualZoom} toggleFit={toggleFit} disableAnimation={exportPipeline.isExporting} />
        </motion.div>
        <motion.div initial={false} animate={{ width: showEditor ? LAYOUT.EDITOR_PANEL_WIDTH : 0, opacity: showEditor ? 1 : 0 }} className="overflow-hidden z-20"><EditorPanel currentPage={currentPage} onUpdatePage={updatePage} onRemovePage={removePage} customFonts={customFonts} pages={pages} onOpenLayoutBrowser={handleOpenLayoutBrowser} /></motion.div>
      </div>
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Settings" type="custom" maxWidth="max-w-2xl">
        <GlobalSettings />
      </Modal>

      <LayoutBrowserModal
        isOpen={wizard.isOpen}
        onClose={wizard.close}
        modalMode={wizard.modalMode}
        creationStage={wizard.creationStage}
        selectedOrientation={wizard.selectedOrientation}
        selectedRatio={wizard.selectedRatio}
        onSelectOrientation={wizard.selectOrientation}
        onSelectRatio={wizard.selectRatio}
        onBackToOrientation={wizard.backToOrientation}
        onBackToRatio={wizard.backToRatio}
        onFinalize={(layoutId) => wizard.finalize(layoutId, { updatePage, addPage })}
      />

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} />

      {exportPipeline.offscreenTarget && (
        <OffscreenExportRenderer
          page={exportPipeline.offscreenTarget.page}
          pageIndex={exportPipeline.offscreenTarget.index}
          totalPages={pages.length}
          printSettings={printSettings}
          minimalCounter={minimalCounter}
          onReady={exportPipeline.handleOffscreenReady}
        />
      )}
    </div>
  );
}
