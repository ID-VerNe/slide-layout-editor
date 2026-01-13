import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Monitor, Smartphone, Square } from 'lucide-react';

import { useProject } from '../hooks/useProject';
import { usePreview } from '../hooks/usePreview';
import { useImagePreload } from '../hooks/useImagePreload';
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
    saveToDB, undo, redo, canUndo, canRedo,
    printSettings, setPrintSettings, imageQuality, setImageQuality,
    minimalCounter, setMinimalCounter, customFonts, setCustomFonts,
    currentFilePath, setCurrentFilePath, hasUnsavedChanges, markAsSaved
  } = useProject(projectId, templateId);

  const initProject = useStore(s => s.initProject);
  const { previewZoom, setPreviewZoom, isAutoFit, setIsAutoFit, previewRef, previewContainerRef, handleManualZoom, toggleFit, handleOverflowChange } = usePreview({ 
    pages, 
    currentPageIndex, 
    printSettings, 
    minimalCounter,
    isLoaded // 透传加载状态
  });

  useImagePreload();

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

  const fallbackTitle = pages[0]?.title || 'Untitled Project';

  // 调试日志：检查环境
  useEffect(() => {
    console.log('[EditorPage] Mounted', { 
      isElectron: nativeFs.isElectron,
      hasApi: !!(window as any).electronAPI 
    });
  }, []);

  // 窗口标题同步逻辑
  useEffect(() => {
    const fileName = currentFilePath ? currentFilePath.split(/[\/]/).pop() : (projectTitle || fallbackTitle);
    const unsavedMark = hasUnsavedChanges ? '● ' : '';
    document.title = `${unsavedMark}${fileName} | SlideGrid Studio`;
  }, [projectTitle, fallbackTitle, currentFilePath, hasUnsavedChanges]);

  // --- 智能保存逻辑 ---
  const handleSmartSave = React.useCallback(async (forceDialog: boolean = false) => {
    console.log('[EditorPage] handleSmartSave invoked', { forceDialog, isElectron: nativeFs.isElectron });
    try {
      if (!nativeFs.isElectron) {
        console.log('[EditorPage] Falling back to IndexedDB');
        saveToDB(previewRef, true);
        return;
      }

      const content = { 
        version: "3.0", 
        title: projectTitle, 
        pages, 
        theme, 
        minimalCounter, 
        customFonts, 
        imageQuality, 
        printSettings 
      };
      
      const targetPath = forceDialog ? undefined : (currentFilePath || undefined);
      const suggestedName = projectTitle || fallbackTitle; // 优先使用编辑框里的名字
      console.log('[EditorPage] Sending to nativeFs.saveProject', { targetPath, suggestedName });
      
      const result = await nativeFs.saveProject(content, targetPath, suggestedName);
      console.log('[EditorPage] Native save result:', result);
      
      if (result.success) {
        if (result.filePath) setCurrentFilePath(result.filePath);
        markAsSaved();
      } else if (result.error) {
        console.error('[EditorPage] Save failed result:', result.error);
        alert(`Save Failed: ${result.error}`);
      }
    } catch (e: any) {
      console.error('[EditorPage] Fatal save error:', e);
      alert(`System Error: ${e.message || 'Unknown error during save'}`);
    }
  }, [nativeFs, projectTitle, pages, theme, minimalCounter, customFonts, imageQuality, printSettings, currentFilePath, setCurrentFilePath, markAsSaved, saveToDB, previewRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSmartSave(e.shiftKey);
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSmartSave]); // 关键：依赖项改为 handleSmartSave

  useEffect(() => {
    if (isNewProject && isLoaded && pages.length === 1 && pages[0].title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
      setModalMode('create');
      setCreationStage('orientation');
      setShowLayoutModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('new');
      setSearchParams(nextParams, { replace: true });
    }
  }, [isNewProject, isLoaded, pages.length]);

  useEffect(() => {
    const handleOpenBrowser = (e: any) => {
      setModalMode(e.detail?.mode || 'change');
      if (currentPage) {
        const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
        setSelectedOrientation(currentConfig.orientation);
        setSelectedRatio(currentPage.aspectRatio || '16:9');
        setCreationStage('template');
      } else { setCreationStage('orientation'); }
      setShowLayoutModal(true);
    };
    window.addEventListener('open-layout-browser', handleOpenBrowser);
    return () => window.removeEventListener('open-layout-browser', handleOpenBrowser);
  }, [currentPage]);

  useEffect(() => {
    let timeout: any;
    // 增加 isLoaded 检查，且在刚加载完成的前 5 秒内不触发自动保存，给系统留出喘息空间
    if (projectId && isLoaded && pages.length > 0 && pages[0].title !== 'PLACEHOLDER_FOR_NEW_PROJECT') {
      timeout = setTimeout(() => {
        console.log('[EditorPage] Auto-saving to IndexedDB...');
        saveToDB(previewRef, false);
      }, 10000); // 将自动保存延迟增加到 10 秒
    }
    return () => clearTimeout(timeout);
  }, [projectId, isLoaded, saveToDB]); // 移除 pages 等频繁变动的依赖，仅通过定时器或手动触发保存

  const handleFinalAction = (layoutId: string) => {
    // 关键修复：如果是新建项目的初始设置（只有一个占位页面），则更新第一页而不是添加新页
    const isInitialSetup = pages.length === 1 && pages[0].title === 'PLACEHOLDER_FOR_NEW_PROJECT';

    if (modalMode === 'create' && !isInitialSetup) {
      addPage(selectedRatio, layoutId);
    } else {
      // 无论是修改现有页面布局，还是初始化第一个页面，都走 updatePage
      const targetPage = isInitialSetup ? pages[0] : currentPage;
      if (targetPage) {
        updatePage({ 
          ...targetPage, 
          layoutId: layoutId as any, 
          aspectRatio: selectedRatio,
          // 如果是初始化，顺便把占位标题清掉
          title: isInitialSetup ? '' : targetPage.title 
        });
      }
    }
    setShowLayoutModal(false);
  };

  // --- 导出逻辑 (已优化为按需动态导入) ---
  const handleExport = async (format: 'png' | 'pdf') => {
    if (!previewRef.current) return;
    
    // 动态导入重型库
    const [{ toPng }, { jsPDF }] = await Promise.all([
      import('html-to-image'),
      import('jspdf')
    ]);

    setIsExporting(true); setShowExportModal(false);
    try {
      const prevZoom = previewZoom; const prevIdx = currentPageIndex;
      setPreviewZoom(1); await document.fonts.ready;
      const indices = exportScope === 'all' ? pages.map((_, i) => i) : [currentPageIndex];
      const opt = { pixelRatio: 2, backgroundColor: '#ffffff', filter: (n: any) => !(n.tagName === 'LINK' && n.rel === 'stylesheet' && !n.href.includes(window.location.origin)) };
      if (nativeFs.isElectron && format === 'png' && exportScope === 'all') {
        const dirResult = await nativeFs.selectDirectory();
        if (dirResult.canceled) { setIsExporting(false); return; }
        for (let i = 0; i < indices.length; i++) {
          const idx = indices[i]; setCurrentPageIndex(idx); await new Promise(r => setTimeout(r, 600));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          const dataUrl = await toPng(el, opt);
          const fileName = `${projectTitle || 'Project'}_P${idx + 1}.png`;
          await nativeFs.saveFileBuffer(`${dirResult.path}/${fileName}`, dataUrl);
          setExportProgress(Math.round(((i + 1) / indices.length) * 100));
        }
      } else {
        if (format === 'pdf') {
          const doc = new jsPDF({ unit: 'px', format: [LAYOUT_CONFIG[pages[0].aspectRatio].width, LAYOUT_CONFIG[pages[0].aspectRatio].height] });
          for (let i = 0; i < indices.length; i++) {
            setCurrentPageIndex(indices[i]); await new Promise(r => setTimeout(r, 600));
            const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
            const dataUrl = await toPng(el, opt);
            if (i > 0) doc.addPage([LAYOUT_CONFIG[pages[indices[i]].aspectRatio].width, LAYOUT_CONFIG[pages[indices[i]].aspectRatio].height]);
            doc.addImage(dataUrl, 'PNG', 0, 0, LAYOUT_CONFIG[pages[indices[i]].aspectRatio].width, LAYOUT_CONFIG[pages[indices[i]].aspectRatio].height);
            setExportProgress(Math.round(((i + 1) / indices.length) * 100));
          }
          doc.save(`${projectTitle || 'Export'}.pdf`);
        } else {
          for (const idx of indices) {
            setCurrentPageIndex(idx); await new Promise(r => setTimeout(r, 600));
            const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
            const dataUrl = await toPng(el, opt);
            const link = document.createElement('a'); link.download = `${projectTitle}_${idx + 1}.png`; link.href = dataUrl; link.click();
          }
        }
      }
      setPreviewZoom(prevZoom); setCurrentPageIndex(prevIdx);
    } finally { setIsExporting(false); setExportProgress(0); }
  };

  if (!isLoaded || pages.length === 0) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-[#264376]/10 border-t-[#264376] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading SlideGrid Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      <Sidebar pages={pages} currentPageIndex={currentPageIndex} onPageSelect={setCurrentPageIndex} onAddPage={() => window.dispatchEvent(new CustomEvent('open-layout-browser', { detail: { mode: 'create' } }))} onRemovePage={removePage} onReorderPages={reorderPages} onClearAll={() => useStore.getState().loadProject(projectId!, null)} onToggleFontManager={() => setShowSettings(!showSettings)} showFontManager={showSettings} onNavigateHome={() => navigate('/')} />
      <AnimatePresence>{isExporting && exportProgress > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#264376]/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10">
          <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mb-6"><motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Exporting Archive {exportProgress}%</p>
        </motion.div>
      )}</AnimatePresence>
      <div className="flex-1 flex overflow-hidden">
        <motion.div initial={false} animate={{ flex: 1 }} className="bg-neutral-200/50 flex flex-col overflow-hidden relative">
          <TopNav projectTitle={projectTitle} setProjectTitle={setProjectTitle} fallbackTitle={fallbackTitle} currentPageIndex={currentPageIndex} totalPages={pages.length} onPageChange={setCurrentPageIndex} enforceA4={false} onToggleEnforceA4={()=>{}} previewZoom={previewZoom} onZoomChange={handleManualZoom} isAutoFit={isAutoFit} onToggleAutoFit={toggleFit} onExportPng={(all) => { setExportScope(all?'all':'current'); setShowExportModal(true); }} onSave={(force) => handleSmartSave(force)} isExporting={isExporting} showExportMenu={showExportMenu} setShowExportMenu={setShowExportMenu} exportMenuRef={exportMenuRef} showEditor={showEditor} onToggleEditor={() => setShowEditor(!showEditor)} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
          <PreviewArea pages={pages} currentPageIndex={currentPageIndex} previewZoom={previewZoom} previewRef={previewRef} previewContainerRef={previewContainerRef} enforceA4={false} isAutoFit={isAutoFit} setIsAutoFit={setIsAutoFit} printSettings={printSettings} minimalCounter={minimalCounter} onOverflowChange={handleOverflowChange} onUpdatePage={updatePage} />
        </motion.div>
        <motion.div initial={false} animate={{ width: showEditor ? LAYOUT.EDITOR_PANEL_WIDTH : 0, opacity: showEditor ? 1 : 0 }} className="overflow-hidden z-20">
          <EditorPanel currentPage={currentPage} onUpdatePage={updatePage} onRemovePage={removePage} customFonts={customFonts} />
        </motion.div>
      </div>
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Settings" type="custom" maxWidth="max-w-2xl">
        <GlobalSettings page={currentPage || pages[0]} onUpdate={updatePage} customFonts={customFonts} setCustomFonts={setCustomFonts} theme={theme} setTheme={setTheme} imageQuality={imageQuality} setImageQuality={setImageQuality} minimalCounter={minimalCounter || false} setMinimalCounter={setMinimalCounter} counterColor="" setCounterColor={()=>{}} printSettings={printSettings} setPrintSettings={setPrintSettings} />
      </Modal>
      <Modal isOpen={showLayoutModal} onClose={() => setShowLayoutModal(false)} title={modalMode === 'create' ? "Add New Slide" : "Change Layout"} type="custom" maxWidth="max-w-5xl">
        <div className="min-h-[60vh] flex flex-col p-4">
          {creationStage === 'orientation' && (<div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in"><div className="text-center space-y-2"><h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Step 1: Canvas Orientation</h3></div><div className="flex gap-8"><OrientationCard id="landscape" icon={Monitor} label="Landscape" desc="Slides" onClick={() => { setSelectedOrientation('landscape'); setCreationStage('ratio'); }} /><OrientationCard id="portrait" icon={Smartphone} label="Portrait" desc="Magazine" onClick={() => { setSelectedOrientation('portrait'); setCreationStage('ratio'); }} /><OrientationCard id="square" icon={Square} label="Square" desc="Posts" onClick={() => { setSelectedOrientation('square'); setCreationStage('ratio'); }} /></div></div>)}
          {creationStage === 'ratio' && (<div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in slide-in-from-right-4"><div className="w-full flex items-center justify-between border-b pb-6"><button onClick={() => setCreationStage('orientation')} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Orientation</button><div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 2: Specific Ratio</h3></div><div className="w-24"/></div><div className="flex gap-6 flex-wrap justify-center">{Object.entries(LAYOUT_CONFIG).filter(([_, cfg]) => cfg.orientation === selectedOrientation).map(([key, cfg]) => (<button key={key} onClick={() => { setSelectedRatio(key as any); setCreationStage('template'); }} className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${selectedRatio === key ? 'border-[#264376] bg-[#264376]/5 shadow-lg' : 'border-slate-100 hover:border-[#264376]/30'}`}><div className={`bg-white rounded shadow-md border ${cfg.width > cfg.height ? 'w-24 h-14' : 'w-14 h-20'}`} /><span className="block text-sm font-black uppercase text-slate-900">{key}</span></button>))}</div></div>)}
          {creationStage === 'template' && (<div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 overflow-hidden"><div className="flex items-center justify-between border-b pb-6"><button onClick={() => setCreationStage('ratio')} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Ratio</button><div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 3: Select Template</h3></div><div className="w-24"/></div><div className="space-y-12 max-h-[55vh] overflow-y-auto no-scrollbar pr-2">{Array.from(new Set(TEMPLATES.filter(t => t.supportedRatios.includes(selectedRatio)).map(t => t.category))).map(cat => (<div key={cat} className="space-y-6"><div className="flex items-center gap-3 px-1 border-b pb-4"><span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">{cat}</span></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{TEMPLATES.filter(t => t.category === cat && t.supportedRatios.includes(selectedRatio)).map(t => (<button key={t.id} onClick={() => handleFinalAction(t.id)} className={`flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all text-left group ${currentPage?.layoutId === t.id && modalMode === 'change' ? 'border-[#264376] bg-[#264376]/5' : 'border-slate-50 bg-slate-50/50 hover:border-[#264376]/30 hover:bg-white'}`}><span className="text-sm font-black uppercase mb-2">{t.name}</span><span className="text-[11px] text-slate-400 line-clamp-2">{t.desc}</span></button>))}</div></div>))}</div></div>)}
        </div>
      </Modal>

      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export" type="custom"><div className="grid grid-cols-2 gap-4 p-4"><button onClick={() => handleExport('png')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all"><span className="text-xs font-black uppercase">Export PNG</span></button><button onClick={() => handleExport('pdf')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all"><span className="text-xs font-black uppercase">Export PDF</span></button></div></Modal>
    </div>
  );
}

const OrientationCard = ({ icon: Icon, label, desc, onClick }: any) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all shadow-sm hover:shadow-2xl"><div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 group-hover:bg-[#264376] transition-all"><Icon size={40} className="text-[#264376] group-hover:text-white transition-colors" /></div><div className="text-center"><span className="block text-lg font-black uppercase text-slate-900 mb-1">{label}</span><span className="text-xs font-bold text-slate-400">{desc}</span></div></button>
);
