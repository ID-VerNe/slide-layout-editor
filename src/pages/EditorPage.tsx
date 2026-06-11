import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FileImage, FileText, Monitor, Smartphone, ChevronRight, Tag as TagIcon, Square, Check, LayoutGrid, FileUser } from 'lucide-react';

import { useProject } from '../hooks/useProject';
import { usePreview } from '../hooks/usePreview';
import Sidebar from '../components/editor/Sidebar';
import TopNav from '../components/editor/TopNav';
import PreviewArea from '../components/editor/PreviewArea';
import EditorPanel from '../components/editor/EditorPanel';
import GlobalSettings from '../components/editor/GlobalSettings';
import Modal from '../components/Modal';
import { LAYOUT, LAYOUT_CONFIG, AspectRatioType, OrientationType } from '../constants/layout';
import { TEMPLATES } from '../templates/registry';
import { nativeFs } from '../utils/native-fs';
import { useStore } from '../store/useStore';
import { TemplatePreview } from '../components/ui/TemplatePreview';

export default function EditorPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewProject = searchParams.get('new') === 'true';
  const templateId = searchParams.get('template');

  const {
    pages, projectTitle, setProjectTitle, theme, setTheme,
    currentPageIndex, setCurrentPageIndex, currentPage,
    isLoaded, updatePage, addPage, removePage, reorderPages, 
    handleExportProject, handleImportProject, loadProject,
    saveToDB, undo, redo, canUndo, canRedo,
    printSettings, setPrintSettings, imageQuality, setImageQuality,
    minimalCounter, setMinimalCounter, counterStyle, setCounterStyle, customFonts, setCustomFonts,
    currentFilePath, setCurrentFilePath, hasUnsavedChanges, markAsSaved
  } = useProject(projectId, templateId);

  const activeProjectId = useStore(s => s.activeProjectId);

  useEffect(() => {
    if (projectId && activeProjectId !== projectId) {
      loadProject(projectId, templateId);
    }
  }, [projectId, activeProjectId, loadProject, templateId]);

  const { previewZoom, setPreviewZoom, isAutoFit, setIsAutoFit, previewRef, previewContainerRef, handleManualZoom, toggleFit, handleOverflowChange } = usePreview({ pages, currentPageIndex, printSettings, minimalCounter, isLoaded });

  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'change'>('create');
  const [creationStage, setCreationStage] = useState<'orientation' | 'ratio' | 'template'>('orientation');
  const [selectedOrientation, setSelectedOrientation] = useState<OrientationType>('landscape');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('16:9');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackTitle = pages[0]?.title || 'Untitled Project';

  useEffect(() => {
    const fileName = currentFilePath ? currentFilePath.split(/[\\/]/).pop() : (projectTitle || fallbackTitle);
    const unsavedMark = hasUnsavedChanges ? '● ' : '';
    document.title = `${unsavedMark}${fileName} | SlideGrid Studio`;

    if (isLoaded && projectId) {
      nativeFs.setCurrentProject(projectId, projectTitle || fallbackTitle);
    }
  }, [projectTitle, fallbackTitle, currentFilePath, hasUnsavedChanges, isLoaded, projectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) handleSaveAs();
        else handleSmartSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pages, projectTitle, currentFilePath, theme, isLoaded, projectId]);

  // 自动保存：每 3 秒检查并保存到 IndexedDB
  useEffect(() => {
    if (!isLoaded || !projectId || !hasUnsavedChanges) return;
    
    const autoSaveTimer = setTimeout(() => {
      console.log('[AutoSave] Saving to IndexedDB...');
      saveToDB(previewRef, false);
    }, 3000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [isLoaded, projectId, hasUnsavedChanges, pages, projectTitle, theme, saveToDB]);

  useEffect(() => {
    if (isNewProject && isLoaded && pages.length === 1 && pages[0].title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
      setModalMode('create');
      setCreationStage('orientation');
      setShowLayoutModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('new');
      setSearchParams(nextParams, { replace: true });
    }
  }, [isNewProject, isLoaded, pages]);

  useEffect(() => {
    const handleOpenBrowser = (e: any) => {
      setModalMode(e.detail?.mode || 'change');
      if (currentPage) {
        const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
        setSelectedOrientation(currentConfig.orientation);
        setSelectedRatio(currentPage.aspectRatio || '16:9');
      }
      setShowLayoutModal(true);
    };
    
    const handleShowExportModal = () => {
      setShowExportModal(true);
    };
    
    const handleTriggerImport = () => {
      fileInputRef.current?.click();
    };
    
    window.addEventListener('open-layout-browser', handleOpenBrowser);
    window.addEventListener('show-export-modal', handleShowExportModal);
    window.addEventListener('trigger-import', handleTriggerImport);
    
    return () => {
      window.removeEventListener('open-layout-browser', handleOpenBrowser);
      window.removeEventListener('show-export-modal', handleShowExportModal);
      window.removeEventListener('trigger-import', handleTriggerImport);
    };
  }, [currentPage]);

  useEffect(() => {
    let timeout: any;
    if (projectId && isLoaded && pages.length > 0 && pages[0].title !== 'PLACEHOLDER_FOR_NEW_PROJECT') {
      timeout = setTimeout(() => saveToDB(previewRef, false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [pages, projectId, isLoaded, saveToDB, projectTitle, theme, minimalCounter, imageQuality, printSettings]);

  const generateThumb = async () => {
    try {
      const el = previewRef.current?.querySelector('.magazine-page');
      if (el) {
        if (nativeFs.isElectron()) {
          const rect = el.getBoundingClientRect();
          return await (window as any).electronAPI.captureThumbnail(projectId!, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
        return await toPng(el as HTMLElement, { pixelRatio: 0.2, quality: 0.5 });
      }
    } catch (e) {
      console.warn('[Export] Failed to capture thumbnail:', e);
    }
    return null;
  };

  const handleSmartSave = async () => {
    if (!isLoaded || !projectId) return;
    const thumb = await generateThumb();
    const content = { id: projectId, version: "3.0", title: projectTitle, pages, theme, minimalCounter, counterStyle, customFonts, imageQuality, printSettings, thumbnail: thumb, filePath: currentFilePath };
    if (nativeFs.isElectron()) {
      const result = await nativeFs.saveProject(content, currentFilePath || undefined, projectTitle || fallbackTitle);
      if (result.success && result.filePath) { setCurrentFilePath(result.filePath); markAsSaved(); }
    }
    updateIndex(thumb, currentFilePath);
    saveToDB(previewRef, true);
  };

  const handleSaveAs = async () => {
    if (!isLoaded || !projectId) return;
    const thumb = await generateThumb();
    const content = { id: projectId, version: "3.0", title: projectTitle, pages, theme, minimalCounter, counterStyle, customFonts, imageQuality, printSettings, thumbnail: thumb, filePath: null };
    if (nativeFs.isElectron()) {
      const result = await nativeFs.saveProject(content, undefined, `${projectTitle || fallbackTitle}_Copy`);
      if (result.success && result.filePath) { setCurrentFilePath(result.filePath); markAsSaved(); updateIndex(thumb, result.filePath); }
    }
  };

  const updateIndex = (thumb: any, path: string | null) => {
    const recentKey = 'magazine_recent_projects';
    const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
    const entry = { id: projectId, title: projectTitle || fallbackTitle, date: new Date().toLocaleDateString(), lastModified: Date.now(), type: pages[0]?.layoutId, aspectRatio: pages[0]?.aspectRatio, thumbnail: thumb, filePath: path };
    const updatedRecent = [entry, ...recent.filter((p: any) => p.id !== projectId)].slice(0, 48);
    localStorage.setItem(recentKey, JSON.stringify(updatedRecent));
  };

  const handleNativeOpen = async () => {
    const result = await nativeFs.openProject();
    if (result.success && result.content) {
      try {
        const project = JSON.parse(result.content);
        await loadProject(project, null, result.filePath);
        if (result.filePath) { setCurrentFilePath(result.filePath); markAsSaved(); }
      } catch (e) { alert('Invalid file'); }
    }
  };

  const handleFinalAction = (layoutId: string) => {
    if (modalMode === 'create' && pages[0]?.title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
      updatePage({ ...pages[0], layoutId: layoutId as any, aspectRatio: selectedRatio, title: 'New Slide' });
    } else {
      if (modalMode === 'create') addPage(selectedRatio, layoutId);
      else updatePage({ ...currentPage, layoutId: layoutId as any, aspectRatio: selectedRatio });
    }
    setShowLayoutModal(false);
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!previewRef.current) return;
    setIsExporting(true); setShowExportModal(false); setExportProgress(0);
    const prevZoom = previewZoom; const prevIdx = currentPageIndex;
    try {
      setPreviewZoom(1); await document.fonts.ready;
      const exportIndices = exportScope === 'all' ? pages.map((_, i) => i) : [currentPageIndex];
      const opt = { pixelRatio: 2, backgroundColor: '#ffffff', filter: (n: any) => !(n.tagName === 'LINK' && n.rel === 'stylesheet' && !n.href.includes(window.location.origin)) };
      if (nativeFs.isElectron() && format === 'png' && exportScope === 'all') {
        const dirResult = await nativeFs.selectDirectory();
        if (dirResult.canceled) { setIsExporting(false); return; }
        for (let i = 0; i < exportIndices.length; i++) {
          const idx = exportIndices[i]; setCurrentPageIndex(idx); await new Promise(r => setTimeout(r, 800));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          const dataUrl = await toPng(el, opt);
          const fileName = `${projectTitle || 'Export'}_Page_${String(idx + 1).padStart(2, '0')}.png`;
          await nativeFs.saveFileBuffer(`${dirResult.path}/${fileName}`, dataUrl);
          setExportProgress(Math.round(((i + 1) / exportIndices.length) * 100));
        }
      } else if (format === 'pdf') {
        const doc = new jsPDF({ unit: 'px', format: [LAYOUT_CONFIG[pages[0].aspectRatio].width, LAYOUT_CONFIG[pages[0].aspectRatio].height], hotfixes: ["px_scaling"] });
        for (let i = 0; i < exportIndices.length; i++) {
          const idx = exportIndices[i]; setCurrentPageIndex(idx); await new Promise(r => setTimeout(r, 800));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          const dataUrl = await toPng(el, opt);
          if (i > 0) doc.addPage([LAYOUT_CONFIG[pages[idx].aspectRatio].width, LAYOUT_CONFIG[pages[idx].aspectRatio].height]);
          doc.addImage(dataUrl, 'PNG', 0, 0, LAYOUT_CONFIG[pages[idx].aspectRatio].width, LAYOUT_CONFIG[pages[idx].aspectRatio].height);
          const pageRect = el.getBoundingClientRect();
          el.querySelectorAll('.resume-link').forEach((linkEl: any) => { const rect = linkEl.getBoundingClientRect(); const url = linkEl.getAttribute('data-url'); if (url) doc.link(rect.left - pageRect.left, rect.top - pageRect.top, rect.width, rect.height, { url }); });
          setExportProgress(Math.round(((i + 1) / exportIndices.length) * 100));
        }
        doc.save(`${projectTitle || fallbackTitle}.pdf`);
      } else {
        for (const idx of exportIndices) {
          setCurrentPageIndex(idx); await new Promise(r => setTimeout(r, 600));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          const dataUrl = await toPng(el, opt);
          const link = document.createElement('a'); link.download = `${projectTitle}_${idx + 1}.png`; link.href = dataUrl; link.click();
        }
      }
    } finally {
      try {
        setPreviewZoom(prevZoom);
        setCurrentPageIndex(prevIdx);
      } catch (recoveryError) {
        console.error('Failed to restore preview state after export:', recoveryError);
      }
      setIsExporting(false); setExportProgress(0);
    }
  };

  const handleSelectOrientation = (ori: OrientationType) => {
    setSelectedOrientation(ori);
    if (ori === 'resume') { setSelectedRatio('A4'); setCreationStage('template'); }
    else { const firstRatio = Object.keys(LAYOUT_CONFIG).find(k => LAYOUT_CONFIG[k as AspectRatioType].orientation === ori) as AspectRatioType; setSelectedRatio(firstRatio || '16:9'); setCreationStage('ratio'); }
  };

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      <Sidebar pages={pages} currentPageIndex={currentPageIndex} onPageSelect={setCurrentPageIndex} onAddPage={() => window.dispatchEvent(new CustomEvent('open-layout-browser', { detail: { mode: 'create' } }))} onRemovePage={removePage} onReorderPages={reorderPages} onClearAll={() => useStore.getState().loadProject(projectId!, null)} onImport={() => fileInputRef.current?.click()} onExport={handleExportProject} onToggleFontManager={() => setShowSettings(!showSettings)} showFontManager={showSettings} onNavigateHome={() => navigate('/')} onNativeSave={handleSmartSave} onNativeSaveAs={handleSaveAs} onNativeOpen={handleNativeOpen} />
      <AnimatePresence>{isExporting && exportProgress > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#264376]/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10"><div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mb-6"><motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} /></div><p className="text-[10px] font-black uppercase tracking-[0.4em]">Exporting Archive {exportProgress}%</p></motion.div>)}</AnimatePresence>
      <div className="flex-1 flex overflow-hidden">
        <motion.div initial={false} animate={{ flex: 1 }} className="bg-neutral-200/50 flex flex-col overflow-hidden relative">
          <TopNav projectTitle={projectTitle} setProjectTitle={setProjectTitle} fallbackTitle={fallbackTitle} currentPageIndex={currentPageIndex} totalPages={pages.length} onPageChange={setCurrentPageIndex} enforceA4={false} onToggleEnforceA4={()=>{}} previewZoom={previewZoom} onZoomChange={handleManualZoom} isAutoFit={isAutoFit} onToggleAutoFit={toggleFit} onExportPng={(all) => { setExportScope(all?'all':'current'); setShowExportModal(true); }} onSave={handleSmartSave} onSaveAs={handleSaveAs} isExporting={isExporting} showExportMenu={showExportMenu} setShowExportMenu={setShowExportMenu} exportMenuRef={exportMenuRef} showEditor={showEditor} onToggleEditor={() => setShowEditor(!showEditor)} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
          <PreviewArea pages={pages} currentPageIndex={currentPageIndex} previewZoom={previewZoom} previewRef={previewRef} previewContainerRef={previewContainerRef} enforceA4={false} isAutoFit={isAutoFit} setIsAutoFit={setIsAutoFit} printSettings={printSettings} minimalCounter={minimalCounter} onOverflowChange={handleOverflowChange} onUpdatePage={updatePage} />
        </motion.div>
        <motion.div initial={false} animate={{ width: showEditor ? LAYOUT.EDITOR_PANEL_WIDTH : 0, opacity: showEditor ? 1 : 0 }} className="overflow-hidden z-20"><EditorPanel currentPage={currentPage} onUpdatePage={updatePage} onRemovePage={removePage} customFonts={customFonts} /></motion.div>
      </div>
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Settings" type="custom" maxWidth="max-w-2xl">
        <GlobalSettings 
          page={currentPage || pages[0]} 
          onUpdate={updatePage} 
          customFonts={customFonts} 
          setCustomFonts={setCustomFonts} 
          theme={theme} 
          setTheme={setTheme} 
          imageQuality={imageQuality} 
          setImageQuality={setImageQuality} 
          minimalCounter={minimalCounter || false} 
          setMinimalCounter={setMinimalCounter} 
          counterStyle={counterStyle} 
          setCounterStyle={setCounterStyle} 
          counterColor={currentPage?.counterColor || ''}
          setCounterColor={(value) => currentPage && updatePage({ ...currentPage, counterColor: value })} 
          printSettings={printSettings} 
          setPrintSettings={setPrintSettings} 
        />
      </Modal>
      
      <Modal isOpen={showLayoutModal} onClose={() => setShowLayoutModal(false)} title={modalMode === 'create' ? "Add New Slide" : "Change Layout"} type="custom" maxWidth="max-w-6xl">
        <div className="min-h-[70vh] flex flex-col p-6">
          {creationStage === 'orientation' && (<div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in"><div className="text-center space-y-2"><h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Step 1: Canvas Orientation</h3></div><div className="flex gap-8"><OrientationCard id="landscape" icon={Monitor} label="Landscape" desc="Slides" onClick={() => handleSelectOrientation('landscape')} /><OrientationCard id="portrait" icon={Smartphone} label="Portrait" desc="Magazine" onClick={() => handleSelectOrientation('portrait')} /><OrientationCard id="square" icon={Square} label="Square" desc="Posts" onClick={() => handleSelectOrientation('square')} /><OrientationCard id="resume" icon={FileUser} label="Resume" desc="Career Docs" onClick={() => handleSelectOrientation('resume')} /></div></div>)}
          {creationStage === 'ratio' && (<div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in slide-in-from-right-4"><div className="w-full flex items-center justify-between border-b pb-6"><button onClick={() => setCreationStage('orientation')} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Orientation</button><div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 2: Specific Ratio</h3></div><div className="w-24"/></div><div className="flex gap-6 flex-wrap justify-center">{Object.entries(LAYOUT_CONFIG).filter(([_, cfg]) => cfg.orientation === selectedOrientation).map(([key, cfg]) => (<button key={key} onClick={() => { setSelectedRatio(key as any); setCreationStage('template'); }} className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${selectedRatio === key ? 'border-[#2a4a82] bg-[#2a4a82]/5 shadow-lg' : 'border-slate-100 hover:border-[#2a4a82]/30'}`}><div className={`bg-white rounded shadow-md border ${cfg.width > cfg.height ? 'w-24 h-14' : 'w-14 h-20'}`} /><span className="block text-sm font-black uppercase text-slate-900">{key}</span></button>))}</div></div>)}
          
          {creationStage === 'template' && (
            <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 overflow-hidden">
              <div className="flex items-center justify-between border-b pb-6">
                <button onClick={() => selectedOrientation === 'resume' ? setCreationStage('orientation') : setCreationStage('ratio')} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Back</button>
                <div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 3: Select Template</h3></div>
                <div className="w-24"/>
              </div>
              
              <div className="space-y-12 max-h-[60vh] overflow-y-auto no-scrollbar pr-2 pb-10">
                {Array.from(new Set(TEMPLATES.filter(t => t.supportedRatios.includes(selectedRatio)).map(t => t.category))).map(cat => (
                  <div key={cat} className="space-y-8">
                    <div className="flex items-center gap-3 px-1 border-b pb-4">
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">{cat}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                      {TEMPLATES.filter(t => t.category === cat && t.supportedRatios.includes(selectedRatio))
                        .sort((a, b) => a.name.localeCompare(b.name)) // 核心新增：按名称 A-Z 排序
                        .map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => handleFinalAction(t.id)} 
                          className="flex flex-col gap-4 group"
                        >
                          {/* 核心升级：抽象预览组件 */}
                          <TemplatePreview layoutId={t.id} aspectRatio={selectedRatio} />
                          
                          <div className="text-left space-y-1 px-1">
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 group-hover:text-[#2a4a82] transition-colors">{t.name}</span>
                            <p className="text-[9px] text-slate-400 leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-all">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export" type="custom"><div className="grid grid-cols-2 gap-4 p-4"><button onClick={() => handleExport('png')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all"><span className="text-xs font-black uppercase">Export PNG</span></button><button onClick={() => handleExport('pdf')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all"><span className="text-xs font-black uppercase">Export PDF</span></button></div></Modal>
    </div>
  );
}

const OrientationCard = ({ icon: Icon, label, desc, onClick }: any) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all shadow-sm hover:shadow-2xl"><div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 group-hover:bg-[#264376] transition-all"><Icon size={40} className="text-[#264376] group-hover:text-white transition-colors" /></div><div className="text-center"><span className="block text-lg font-black uppercase text-slate-900 mb-1">{label}</span><span className="text-xs font-bold text-slate-400">{desc}</span></div></button>
);
