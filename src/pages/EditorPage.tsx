import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FileImage, FileText, Layout as LayoutIcon, Monitor, Smartphone, ChevronRight, Tag as TagIcon, Square, Check } from 'lucide-react';

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

export default function EditorPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewProject = searchParams.get('new') === 'true';
  const templateId = searchParams.get('template');

  const {
    pages,
    projectTitle,
    setProjectTitle,
    imageQuality,
    setImageQuality,
    minimalCounter,
    setMinimalCounter,
    counterColor,
    setCounterColor,
    printSettings,
    setPrintSettings,
    typography,
    setTypography,
    currentPageIndex,
    setCurrentPageIndex,
    currentPage,
    customFonts,
    setCustomFonts,
    isLoaded,
    updatePage,
    addPage,
    removePage,
    reorderPages,
    handleClearAll,
    handleExportProject,
    handleImportProject,
    saveToDB
  } = useProject(projectId, templateId);

  const {
    previewZoom,
    setPreviewZoom,
    isAutoFit,
    setIsAutoFit,
    previewRef,
    previewContainerRef,
    handleManualZoom,
    toggleFit,
    handleOverflowChange
  } = usePreview({ pages, currentPageIndex, printSettings });

  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'change'>('create');
  const [creationStage, setCreationStage] = useState<'orientation' | 'ratio' | 'template'>('orientation');
  const [selectedOrientation, setSelectedOrientation] = useState<OrientationType>('landscape');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('16:9');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackTitle = pages[0]?.title || 'Untitled Project';

  useEffect(() => {
    document.title = `${projectTitle || fallbackTitle} | SlideGrid Studio`;
  }, [projectTitle, fallbackTitle]);

  useEffect(() => {
    const handleOpenBrowser = (e: any) => {
      const mode = e.detail?.mode || 'change';
      setModalMode(mode);
      if (mode === 'change' && currentPage) {
        const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
        setSelectedOrientation(currentConfig.orientation);
        setSelectedRatio(currentPage.aspectRatio || '16:9');
        setCreationStage('template');
      } else {
        setCreationStage('orientation');
      }
      setShowLayoutModal(true);
    };
    window.addEventListener('open-layout-browser', handleOpenBrowser);
    return () => window.removeEventListener('open-layout-browser', handleOpenBrowser);
  }, [currentPage]);

  useEffect(() => {
    if (isNewProject && isLoaded && pages.length === 1 && pages[0].id === 'slide-1') {
      setModalMode('create');
      setShowLayoutModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('new');
      setSearchParams(nextParams, { replace: true });
    }
  }, [isNewProject, isLoaded, pages, searchParams, setSearchParams]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (projectId && isLoaded) {
      timeout = setTimeout(() => saveToDB(previewRef, false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [pages, customFonts, projectId, isLoaded, saveToDB, previewRef, projectTitle, imageQuality, minimalCounter, counterColor, printSettings]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleSelectOrientation = (ori: OrientationType) => {
    setSelectedOrientation(ori);
    const firstRatio = Object.keys(LAYOUT_CONFIG).find(k => LAYOUT_CONFIG[k as AspectRatioType].orientation === ori) as AspectRatioType;
    setSelectedRatio(firstRatio);
    setCreationStage('ratio');
  };

  const handleSelectRatio = (ratio: AspectRatioType) => {
    setSelectedRatio(ratio);
    setCreationStage('template');
  };

  const handleFinalAction = (layoutId: string) => {
    if (modalMode === 'create') {
      if (pages.length === 1 && pages[0].id === 'slide-1' && pages[0].title === 'Modern Presentation') {
        updatePage({ ...pages[0], layoutId: layoutId as any, aspectRatio: selectedRatio, title: 'New Slide' });
      } else {
        addPage(selectedRatio, layoutId);
      }
    } else {
      updatePage({ ...currentPage, layoutId: layoutId as any, aspectRatio: selectedRatio });
    }
    setShowLayoutModal(false);
  };

  const initiateExport = (scope: 'current' | 'all') => {
    setExportScope(scope);
    setShowExportMenu(false);
    setShowExportModal(true);
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setShowExportModal(false);
    try {
      const prevZoom = previewZoom;
      const prevPageIndex = currentPageIndex;
      setPreviewZoom(1);
      await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(r));
      const pagesToExportIndices = exportScope === 'all' ? pages.map((_, i) => i) : [currentPageIndex];
      
      const exportOptions = {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node: HTMLElement) => {
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            const href = (node as HTMLLinkElement).href;
            return href.includes(window.location.origin) || href.startsWith('data:');
          }
          return true;
        }
      };

      if (format === 'pdf') {
        const firstPageToExport = pages[pagesToExportIndices[0]];
        const firstDims = LAYOUT_CONFIG[firstPageToExport.aspectRatio || '16:9'];
        const doc = new jsPDF({ 
          orientation: firstDims.width > firstDims.height ? 'landscape' : 'portrait', 
          unit: 'px', 
          format: [firstDims.width, firstDims.height] 
        });

        for (let i = 0; i < pagesToExportIndices.length; i++) {
          const idx = pagesToExportIndices[i];
          const page = pages[idx];
          const dims = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
          setCurrentPageIndex(idx);
          await new Promise(async (resolve) => {
             await new Promise(r => requestAnimationFrame(r));
             const checkImages = () => {
                const images = Array.from(previewRef.current?.querySelectorAll('img') || []);
                const allLoaded = images.every(img => img.complete && img.naturalHeight !== 0);
                if (allLoaded) setTimeout(resolve, 300);
                else setTimeout(checkImages, 100);
             };
             checkImages();
          });
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          if (!el) throw new Error(`Slide element ${idx + 1} not found`);
          const dataUrl = await toPng(el, { ...exportOptions, quality: 1 });
          if (i > 0) doc.addPage([dims.width, dims.height], dims.width > dims.height ? 'landscape' : 'portrait');
          doc.addImage(dataUrl, 'PNG', 0, 0, dims.width, dims.height);
        }
        doc.save(`${projectTitle || fallbackTitle}.pdf`);
      } else {
        for (let i = 0; i < pagesToExportIndices.length; i++) {
          const idx = pagesToExportIndices[i];
          setCurrentPageIndex(idx);
          await new Promise(async (resolve) => {
             await new Promise(r => requestAnimationFrame(r));
             const checkImages = () => {
                const images = Array.from(previewRef.current?.querySelectorAll('img') || []);
                const allLoaded = images.every(img => img.complete && img.naturalHeight !== 0);
                if (allLoaded) setTimeout(resolve, 300);
                else setTimeout(checkImages, 100);
             };
             checkImages();
          });
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          if (!el) throw new Error(`Slide element ${idx + 1} not found`);
          const dataUrl = await toPng(el, { ...exportOptions, quality: 1 });
          const link = document.createElement('a');
          link.download = `${projectTitle || fallbackTitle}-${idx + 1}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
      setPreviewZoom(prevZoom);
      setCurrentPageIndex(prevPageIndex);
    } catch (e) { 
      console.error("Export Error:", e);
      alert('Export Failed. Please check console for details.'); 
    } finally { setIsExporting(false); }
  };

  const filteredTemplates = TEMPLATES.filter(t => t.supportedRatios.includes(selectedRatio));
  const categories = Array.from(new Set(filteredTemplates.map(t => t.category)));

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      <Sidebar 
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageSelect={setCurrentPageIndex}
        onAddPage={() => window.dispatchEvent(new CustomEvent('open-layout-browser', { detail: { mode: 'create' } }))}
        onRemovePage={removePage}
        onReorderPages={reorderPages}
        onClearAll={handleClearAll}
        onImport={() => fileInputRef.current?.click()}
        onExport={handleExportProject}
        onToggleFontManager={() => setShowSettings(!showSettings)}
        showFontManager={showSettings}
        onNavigateHome={() => navigate('/')}
      />

      <input ref={fileInputRef} type="file" className="hidden" accept=".slgrid,.wdzmaga" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportProject(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }} />

      <div className="flex-1 flex overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ flex: 1 }} 
          className="bg-neutral-200/50 flex flex-col overflow-hidden relative"
        >
          <TopNav 
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            fallbackTitle={fallbackTitle}
            currentPageIndex={currentPageIndex}
            totalPages={pages.length}
            onPageChange={setCurrentPageIndex}
            enforceA4={false}
            onToggleEnforceA4={() => {}}
            previewZoom={previewZoom}
            onZoomChange={handleManualZoom}
            isAutoFit={isAutoFit}
            onToggleAutoFit={toggleFit}
            onExportPng={(all) => initiateExport(all ? 'all' : 'current')}
            onSave={() => saveToDB(previewRef, true)}
            isExporting={isExporting}
            showExportMenu={showExportMenu}
            setShowExportMenu={setShowExportMenu}
            exportMenuRef={exportMenuRef}
            showEditor={showEditor}
            onToggleEditor={() => setShowEditor(!showEditor)}
          />
          <PreviewArea 
            pages={pages} 
            currentPageIndex={currentPageIndex} 
            previewZoom={previewZoom} 
            previewRef={previewRef} 
            previewContainerRef={previewContainerRef} 
            enforceA4={false} 
            isAutoFit={isAutoFit} 
            setIsAutoFit={setIsAutoFit}
            printSettings={printSettings}
            onOverflowChange={handleOverflowChange} 
          />
        </motion.div>

        <motion.div
          initial={false}
          animate={{ 
            width: showEditor ? LAYOUT.EDITOR_PANEL_WIDTH : 0,
            opacity: showEditor ? 1 : 0
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="overflow-hidden z-20"
        >
          <EditorPanel 
            currentPage={currentPage} 
            onUpdatePage={updatePage} 
            onRemovePage={removePage} 
            customFonts={customFonts} 
          />
        </motion.div>
      </div>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Presentation Settings" type="custom" maxWidth="max-w-[85vw]">
        <div className="max-h-[85vh] overflow-y-auto no-scrollbar pr-2">
          <GlobalSettings 
            page={currentPage} 
            onUpdate={updatePage} 
            customFonts={customFonts} 
            setCustomFonts={setCustomFonts} 
            imageQuality={imageQuality}
            setImageQuality={setImageQuality}
            minimalCounter={minimalCounter}
            setMinimalCounter={setMinimalCounter}
            counterColor={counterColor}
            setCounterColor={setCounterColor}
            printSettings={printSettings}
            setPrintSettings={setPrintSettings}
            typography={typography}
            setTypography={setTypography}
          />
        </div>
      </Modal>

      <Modal 
        isOpen={showLayoutModal} 
        onClose={() => setShowLayoutModal(false)} 
        title={modalMode === 'create' ? "Add New Slide" : "Change Slide Layout"} 
        type="custom" 
        maxWidth="max-w-5xl"
      >
        <div className="min-h-[60vh] flex flex-col p-4">
          {creationStage === 'orientation' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Step 1: Canvas Orientation</h3>
                <p className="text-slate-500 font-medium">Choose the base layout category</p>
              </div>
              <div className="flex gap-8">
                <OrientationCard id="landscape" icon={Monitor} label="Landscape" desc="Horizontal slides" onClick={() => handleSelectOrientation('landscape')} />
                <OrientationCard id="portrait" icon={Smartphone} label="Portrait" desc="Vertical posters" onClick={() => handleSelectOrientation('portrait')} />
                <OrientationCard id="square" icon={Square} label="Square" desc="Social posts" onClick={() => handleSelectOrientation('square')} />
              </div>
            </div>
          )}
          {creationStage === 'ratio' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-6">
                <button onClick={() => setCreationStage('orientation')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">← Back to Category</button>
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Step 2: Specific Ratio</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Category: {selectedOrientation}</p>
                </div>
                <div className="w-24" />
              </div>
              <div className="flex gap-6 flex-wrap justify-center">
                {Object.entries(LAYOUT_CONFIG).filter(([_, cfg]) => cfg.orientation === selectedOrientation).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleSelectRatio(key as AspectRatioType)} className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${selectedRatio === key ? 'border-[#264376] bg-[#264376]/5 shadow-lg' : 'border-slate-100 hover:border-[#264376]/30 hover:bg-slate-50'}`}>
                    <div className={`bg-white rounded shadow-md border border-slate-100 group-hover:shadow-lg transition-all ${cfg.width > cfg.height ? 'w-24 h-14' : cfg.width === cfg.height ? 'w-16 h-16' : 'w-14 h-20'}`} />
                    <div className="text-center"><span className="block text-sm font-black uppercase tracking-widest text-slate-900">{key}</span><span className="text-[10px] font-bold text-slate-400">{cfg.width} x {cfg.height}</span></div>
                    {selectedRatio === key && <div className="absolute top-4 right-4 text-[#264376]"><Check size={16} strokeWidth={3} /></div>}
                  </button>
                ))}
              </div>
              <button onClick={() => setCreationStage('template')} className="px-10 py-4 bg-[#264376] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#264376]/20 hover:brightness-110 transition-all active:scale-95">Continue to Templates</button>
            </div>
          )}
          {creationStage === 'template' && (
            <div className="flex-1 flex flex-col space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <button onClick={() => setCreationStage('ratio')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">← Back to Ratio</button>
                <div className="text-center"><h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Step 3: Select Template</h3><p className="text-slate-500 text-xs tracking-wide">Showing templates for {selectedRatio}</p></div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#264376]/5 rounded-full border border-[#264376]/10"><Check size={10} className="text-[#264376]" /><span className="text-[9px] font-black uppercase text-[#264376]">{selectedRatio}</span></div>
              </div>
              <div className="space-y-12 max-h-[55vh] overflow-y-auto no-scrollbar pr-2">
                {categories.map(cat => (
                  <div key={cat} className="space-y-6">
                    <div className="flex items-center gap-3 px-1 border-b border-slate-100 pb-4"><TagIcon size={16} className="text-[#264376]" /><span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">{cat}</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTemplates.filter(t => t.category === cat).map(t => (
                        <button key={t.id} onClick={() => handleFinalAction(t.id)} className={`flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all text-left group ${currentPage?.layoutId === t.id && modalMode === 'change' ? 'border-[#264376] bg-[#264376]/5' : 'border-slate-50 bg-slate-50/50 hover:border-[#264376]/30 hover:bg-white hover:shadow-2xl hover:-translate-y-1'}`}>
                          <div className="w-full flex justify-between items-start mb-4"><div className={`p-3 rounded-2xl shadow-sm transition-all ${currentPage?.layoutId === t.id && modalMode === 'change' ? 'bg-[#264376] text-white' : 'bg-white text-[#264376] group-hover:bg-[#264376] group-hover:text-white'}`}><LayoutIcon size={20} /></div><ChevronRight size={18} className="text-slate-200 group-hover:text-[#264376] transition-colors" /></div>
                          <span className="text-sm font-black uppercase tracking-tight mb-2 text-slate-900">{t.name}</span><span className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">{t.desc}</span>
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

      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Slide" type="custom">
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">Choose your preferred format for {exportScope === 'all' ? `all ${pages.length} slides` : 'the current slide'}.</p>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleExport('png')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all group">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#264376]/10 group-hover:text-[#264376] transition-colors"><FileImage size={24} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Export as PNG</span>
             </button>
             <button onClick={() => handleExport('pdf')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all group">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#264376]/10 group-hover:text-[#264376] transition-colors"><FileText size={24} /></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Export as PDF</span>
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const OrientationCard = ({ icon: Icon, label, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all active:scale-95 shadow-sm hover:shadow-2xl"
  >
    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 group-hover:bg-[#264376] transition-all group-hover:-translate-y-2">
      <Icon size={40} className="text-[#264376] group-hover:text-white transition-colors" />
    </div>
    <div className="text-center">
      <span className="block text-lg font-black uppercase tracking-widest text-slate-900 mb-1">{label}</span>
      <span className="text-xs font-bold text-slate-400">{desc}</span>
    </div>
  </button>
);
