import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Save, ChevronLeft, ChevronRight, Monitor, Move, ZoomIn, ZoomOut, Check, ChevronDown, RotateCcw, RotateCw, Maximize, Minimize, Copy } from 'lucide-react';
import { DebouncedInput } from '../ui/DebouncedBase';

interface TopNavProps {
  projectTitle: string;
  setProjectTitle: (val: string) => void;
  fallbackTitle: string;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  previewZoom: number;
  onZoomChange: (val: number) => void;
  isAutoFit: boolean;
  onToggleAutoFit: () => void;
  onExportPng: (all: boolean) => void;
  onSave: () => void;
  onSaveAs: () => void; // 新增
  isExporting: boolean;
  showExportMenu: boolean;
  setShowExportMenu: (val: boolean) => void;
  exportMenuRef: React.RefObject<HTMLDivElement>;
  showEditor: boolean;
  onToggleEditor: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  projectTitle, setProjectTitle, fallbackTitle,
  currentPageIndex, totalPages, onPageChange,
  previewZoom, onZoomChange,
  isAutoFit, onToggleAutoFit,
  onExportPng, onSave, onSaveAs, isExporting,
  showExportMenu, setShowExportMenu, exportMenuRef,
  showEditor, onToggleEditor,
  canUndo, canRedo, onUndo, onRedo
}) => {
  const [showSaveMenu, setShowSaveMenu] = React.useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (showSaveMenu && saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu, setShowExportMenu, exportMenuRef, showSaveMenu]);

  return (
    <div className="h-16 bg-white border-b border-zine-accent flex items-center justify-between px-6 shrink-0 z-40 relative">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3 w-64 group">
          <div className="p-2 bg-zine-surface border border-zine-accent rounded-none text-zine-accent"><Monitor size={16} strokeWidth={3} /></div>
          <div className="flex-1 min-w-0">
            <DebouncedInput value={projectTitle} onChange={setProjectTitle} placeholder={fallbackTitle} className="font-black text-sm text-zine-accent placeholder:text-slate-300 bg-transparent border-none p-0 focus:ring-0 w-full uppercase tracking-tight truncate" />
            <p className="text-[9px] font-black text-zine-secondary uppercase tracking-[0.2em] leading-none mt-1">Slide {currentPageIndex + 1} // {totalPages}</p>
          </div>
        </div>
        <div className="h-8 w-[2px] bg-zine-accent/10" />
        <div className="flex items-center gap-1">
          <button onClick={onUndo} disabled={!canUndo} className={`p-2 rounded-none transition-all border ${canUndo ? 'text-zine-accent border-zine-accent hover:bg-zine-accent hover:text-white' : 'text-slate-200 border-slate-100 cursor-not-allowed'}`} title="Undo (Ctrl+Z)"><RotateCcw size={16} strokeWidth={3} /></button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-2 rounded-none transition-all border ${canRedo ? 'text-zine-accent border-zine-accent hover:bg-zine-accent hover:text-white' : 'text-slate-200 border-slate-100 cursor-not-allowed'}`} title="Redo (Ctrl+Y)"><RotateCw size={16} strokeWidth={3} /></button>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white p-1 rounded-none border border-zine-accent">
        <button onClick={() => onZoomChange(Math.max(0.1, previewZoom - 0.1))} className="p-1.5 text-zine-accent hover:bg-zine-surface rounded-none transition-all"><ZoomOut size={14} strokeWidth={3} /></button>
        <div className="w-24 px-2 flex items-center gap-2"><input type="range" min="0.1" max="1.5" step="0.05" value={previewZoom} onChange={(e) => onZoomChange(parseFloat(e.target.value))} className="w-full h-[2px] bg-slate-200 appearance-none cursor-pointer accent-zine-accent" /></div>
        <button onClick={() => onZoomChange(Math.min(1.5, previewZoom + 0.1))} className="p-1.5 text-zine-accent hover:bg-zine-surface rounded-none transition-all"><ZoomIn size={14} strokeWidth={3} /></button>
        <div className="w-px h-4 bg-zine-accent mx-1" />
        <button onClick={onToggleAutoFit} className={`flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isAutoFit ? 'bg-zine-accent text-white border-zine-accent' : 'text-slate-400 border-transparent hover:border-zine-accent hover:text-zine-accent'}`}><Move size={10} strokeWidth={3} /> {isAutoFit ? 'Fit' : 'Free'}</button>
        <span className="text-[9px] font-mono font-black text-zine-accent w-10 text-center">{Math.round(previewZoom * 100)}%</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border border-zine-accent rounded-none p-0.5">
          <button onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0} className="p-1.5 text-zine-accent hover:bg-zine-surface disabled:opacity-20 transition-colors"><ChevronLeft size={16} strokeWidth={3} /></button>
          <div className="w-px h-4 bg-zine-accent/20" />
          <button onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))} disabled={currentPageIndex === totalPages - 1} className="p-1.5 text-zine-accent hover:bg-zine-surface disabled:opacity-20 transition-colors"><ChevronRight size={16} strokeWidth={3} /></button>
        </div>

        <button onClick={() => onToggleEditor()} className={`p-2 rounded-none border-2 transition-all ${!showEditor ? 'border-zine-accent bg-zine-surface text-zine-accent' : 'border-slate-100 text-slate-300 hover:border-zine-accent hover:text-zine-accent'}`} title={showEditor ? "Fullscreen Mode" : "Show Editor"}>{showEditor ? <Maximize size={18} strokeWidth={3} /> : <Minimize size={18} strokeWidth={3} />}</button>

        {/* 保存菜单 */}
        <div className="relative" ref={saveMenuRef}>
          <div className="flex items-center gap-px bg-white rounded-none p-0.5 border border-zine-accent">
            <button onClick={onSave} className="p-2 text-zine-accent hover:bg-zine-surface rounded-none transition-all" title="Quick Save (Ctrl+S)"><Save size={18} strokeWidth={3} /></button>
            <div className="w-px h-6 bg-zine-accent/20" />
            <button onClick={() => setShowSaveMenu(!showSaveMenu)} className="p-1 text-zine-accent hover:bg-zine-surface rounded-none transition-all"><ChevronDown size={12} strokeWidth={3} /></button>
          </div>
          <AnimatePresence>
            {showSaveMenu && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full right-0 mt-1 w-48 bg-white rounded-none border-2 border-zine-accent p-1 z-50 shadow-none">
                <button onClick={() => { onSave(); setShowSaveMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-none hover:bg-zine-accent hover:text-white text-zine-accent transition-all text-[10px] font-black uppercase tracking-widest"><Save size={14} strokeWidth={3} /> Save <span className="ml-auto text-[9px] opacity-40">Ctrl+S</span></button>
                <button onClick={() => { onSaveAs(); setShowSaveMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-none hover:bg-zine-accent hover:text-white text-zine-accent transition-all text-[10px] font-black uppercase tracking-widest"><Copy size={14} strokeWidth={3} /> Save As <span className="ml-auto text-[9px] opacity-40">Shift+S</span></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={exportMenuRef}>
          <button onClick={() => setShowExportMenu(!showExportMenu)} className={`flex items-center gap-3 px-6 py-2.5 rounded-none font-black text-[11px] uppercase tracking-[0.2em] transition-all border-2 ${isExporting ? 'bg-zine-surface text-slate-400 border-slate-200 cursor-wait' : 'bg-zine-accent text-white border-zine-accent hover:brightness-110'}`}>{isExporting ? 'Exporting' : 'Export'}<ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} /></button>
          <AnimatePresence>{showExportMenu && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full right-0 mt-1 w-48 bg-white rounded-none border-2 border-zine-accent p-1 z-50 shadow-none overflow-hidden"><div className="space-y-1"><p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 mb-1">Scope Options</p><button onClick={() => onExportPng(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-left hover:bg-zine-accent hover:text-white text-zine-accent transition-all group"><Download size={14} strokeWidth={3}/><span className="text-[10px] font-black uppercase tracking-widest">Single Slide</span></button><button onClick={() => onExportPng(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-left hover:bg-zine-accent hover:text-white text-zine-accent transition-all group"><Download size={14} strokeWidth={3}/><span className="text-[10px] font-black uppercase tracking-widest">Full Archive</span></button></div></motion.div>)}</AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
