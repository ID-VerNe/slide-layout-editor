import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Save, ChevronLeft, ChevronRight, Monitor, Move, ZoomIn, ZoomOut, Check, ChevronDown, RotateCcw, RotateCw, Maximize, Minimize } from 'lucide-react';
import { DebouncedInput } from '../ui/DebouncedBase';

interface TopNavProps {
  projectTitle: string;
  setProjectTitle: (val: string) => void;
  fallbackTitle: string;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  enforceA4: boolean;
  onToggleEnforceA4: () => void;
  previewZoom: number;
  onZoomChange: (val: number) => void;
  isAutoFit: boolean;
  onToggleAutoFit: () => void;
  onExportPng: (all: boolean) => void;
  onSave: () => void;
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
  onExportPng, onSave, isExporting,
  showExportMenu, setShowExportMenu, exportMenuRef,
  showEditor, onToggleEditor,
  canUndo, canRedo, onUndo, onRedo
}) => {
  return (
    <div className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-40 relative shadow-sm">
      
      {/* Left: 标题与撤销重做 */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3 w-64 group">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-[#264376] transition-colors">
            <Monitor size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <DebouncedInput 
              value={projectTitle} 
              onChange={setProjectTitle} 
              placeholder={fallbackTitle}
              className="font-black text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-none p-0 focus:ring-0 w-full uppercase tracking-tight truncate"
            />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Slide {currentPageIndex + 1} of {totalPages}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-100" />

        <div className="flex items-center gap-1">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${canUndo ? 'text-slate-500 hover:text-[#264376] hover:bg-slate-50' : 'text-slate-200 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${canRedo ? 'text-slate-500 hover:text-[#264376] hover:bg-slate-50' : 'text-slate-200 cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Center: Zoom Controls */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => onZoomChange(Math.max(0.1, previewZoom - 0.1))} 
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
        >
          <ZoomOut size={14} />
        </button>
        
        <div className="w-24 px-2 flex items-center gap-2">
          <input 
            type="range" 
            min="0.1" max="1.5" step="0.05" 
            value={previewZoom} 
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#264376]"
          />
        </div>
        
        <button 
          onClick={() => onZoomChange(Math.min(1.5, previewZoom + 0.1))} 
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
        >
          <ZoomIn size={14} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button 
          onClick={onToggleAutoFit} 
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isAutoFit ? 'bg-[#264376] text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
        >
          <Move size={10} /> {isAutoFit ? 'Fit' : 'Free'}
        </button>

        <span className="text-[9px] font-mono font-bold text-slate-300 w-8 text-center">{Math.round(previewZoom * 100)}%</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-50 rounded-lg p-1">
          <button 
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))} 
            disabled={currentPageIndex === 0}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))} 
            disabled={currentPageIndex === totalPages - 1}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 核心修正：全屏/隐藏侧边栏按钮 */}
        <button 
          onClick={() => onToggleEditor()}
          // 当 showEditor 为 false 时，说明处于“全屏模式”，显示激活状态
          className={`p-2 rounded-xl border-2 transition-all ${!showEditor ? 'border-[#264376] bg-[#264376]/5 text-[#264376] shadow-lg shadow-[#264376]/10' : 'border-slate-100 text-slate-300 hover:border-slate-200 hover:bg-slate-50'}`}
          title={showEditor ? "Fullscreen Mode" : "Show Editor"}
        >
          {showEditor ? <Maximize size={18} /> : <Minimize size={18} />}
        </button>

        <button onClick={onSave} className="p-2.5 text-slate-400 hover:text-[#264376] transition-colors rounded-xl border-2 border-transparent hover:border-slate-100" title="Save Project">
          <Save size={20} />
        </button>

        <div className="relative" ref={exportMenuRef}>
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isExporting ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-[#264376] text-white shadow-lg shadow-[#264376]/20 hover:brightness-110 active:scale-95'}`}
          >
            {isExporting ? 'Exporting...' : 'Export'}
            <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
              >
                <div className="space-y-1">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Export Options</p>
                  <button onClick={() => onExportPng(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 text-slate-600 transition-colors group">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><Download size={14}/></div>
                    <span className="text-xs font-bold">Current Slide</span>
                  </button>
                  <button onClick={() => onExportPng(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 text-slate-600 transition-colors group">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors"><Download size={14}/></div>
                    <span className="text-xs font-bold">All Slides (Zip)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopNav;