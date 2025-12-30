import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FileImage, FileText } from 'lucide-react';

import { useProject } from '../hooks/useProject';
import { usePreview } from '../hooks/usePreview';
import Sidebar from '../components/editor/Sidebar';
import TopNav from '../components/editor/TopNav';
import PreviewArea from '../components/editor/PreviewArea';
import EditorPanel from '../components/editor/EditorPanel';
import GlobalSettings from '../components/editor/GlobalSettings';
import Modal from '../components/Modal';

export default function EditorPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    currentPage,
    customFonts,
    setCustomFonts,
    isLoaded,
    updatePage,
    addPage,
    removePage,
    handleClearAll,
    handleExportProject,
    handleImportProject,
    saveToDB
  } = useProject(projectId, templateId);

  const {
    previewZoom,
    setPreviewZoom,
    isAutoFit,
    previewRef,
    previewContainerRef,
    handleManualZoom,
    toggleFit,
    handleOverflowChange
  } = usePreview({ pages, currentPageIndex });

  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (projectId && isLoaded) {
      timeout = setTimeout(() => saveToDB(previewRef), 1000);
    }
    return () => clearTimeout(timeout);
  }, [pages, customFonts, projectId, isLoaded, saveToDB, previewRef]);

  // Outside click logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

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
      await new Promise(r => setTimeout(r, 500));
      const pagesToExportIndices = exportScope === 'all' ? pages.map((_, i) => i) : [currentPageIndex];
      
      const exportOptions = {
        pixelRatio: 2,
        filter: (node: HTMLElement) => {
          // 过滤掉可能导致跨域安全错误的远程样式表
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            const href = (node as HTMLLinkElement).href;
            return href.includes(window.location.origin) || href.startsWith('data:');
          }
          return true;
        }
      };

      if (format === 'pdf') {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
        for (let i = 0; i < pagesToExportIndices.length; i++) {
          const idx = pagesToExportIndices[i];
          setCurrentPageIndex(idx);
          // 增加到 1000ms 等待图片加载和动画完成
          await new Promise(r => setTimeout(r, 1000));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          if (!el) throw new Error(`Slide element ${idx + 1} not found`);
          const dataUrl = await toPng(el, { ...exportOptions, quality: 0.95 });
          if (i > 0) doc.addPage();
          doc.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);
        }
        doc.save(`presentation-${Date.now()}.pdf`);
      } else {
        for (let i = 0; i < pagesToExportIndices.length; i++) {
          const idx = pagesToExportIndices[i];
          setCurrentPageIndex(idx);
          // 增加到 1000ms 等待图片加载和动画完成
          await new Promise(r => setTimeout(r, 1000));
          const el = previewRef.current.querySelector('.magazine-page') as HTMLElement;
          if (!el) throw new Error(`Slide element ${idx + 1} not found`);
          const dataUrl = await toPng(el, { ...exportOptions, quality: 1, backgroundColor: '#ffffff' });
          const link = document.createElement('a');
          link.download = `slide-${idx + 1}.png`;
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

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
      <Sidebar 
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageSelect={setCurrentPageIndex}
        onAddPage={addPage}
        onRemovePage={removePage}
        onClearAll={handleClearAll}
        onImport={() => fileInputRef.current?.click()}
        onExport={handleExportProject}
        onToggleFontManager={() => setShowSettings(!showSettings)}
        showFontManager={showSettings}
        onNavigateHome={() => navigate('/')}
      />

      <input ref={fileInputRef} type="file" className="hidden" accept=".wdzmaga" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportProject(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }} />

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧预览区：通过 flex-1 自动填充剩余空间 */}
        <motion.div 
          initial={false}
          animate={{ flex: 1 }} 
          className="bg-neutral-200/50 flex flex-col overflow-hidden relative"
        >
          <TopNav 
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
            isExporting={isExporting}
            showExportMenu={showExportMenu}
            setShowExportMenu={setShowExportMenu}
            exportMenuRef={exportMenuRef}
            showEditor={showEditor}
            onToggleEditor={() => setShowEditor(!showEditor)}
          />
          <PreviewArea pages={pages} currentPageIndex={currentPageIndex} previewZoom={previewZoom} previewRef={previewRef} previewContainerRef={previewContainerRef} enforceA4={false} onOverflowChange={handleOverflowChange} />
        </motion.div>

        {/* 右侧编辑器容器：实现宽度动画 */}
        <motion.div
          initial={false}
          animate={{ 
            width: showEditor ? 400 : 0,
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

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Presentation Settings" type="custom" maxWidth="max-w-2xl">
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
          <GlobalSettings page={currentPage} onUpdate={updatePage} customFonts={customFonts} setCustomFonts={setCustomFonts} />
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
