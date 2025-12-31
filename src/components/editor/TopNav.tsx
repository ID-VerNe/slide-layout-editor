import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomOut, ZoomIn, Maximize, Minimize2, Download, ChevronDown } from 'lucide-react';

interface TopNavProps {
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  enforceA4: boolean;
  onToggleEnforceA4: () => void;
  previewZoom: number;
  onZoomChange: (zoom: number) => void;
  isAutoFit: boolean;
  onToggleAutoFit: () => void;
  onExportPng: (all: boolean) => void;
  onSave?: () => void;
  isExporting: boolean;
  showExportMenu: boolean;
  setShowExportMenu: (show: boolean) => void;
  exportMenuRef: React.RefObject<HTMLDivElement | null>;
  showEditor?: boolean;
  onToggleEditor?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  currentPageIndex,
  totalPages,
  onPageChange,
  enforceA4,
  onToggleEnforceA4,
  previewZoom,
  onZoomChange,
  isAutoFit,
  onToggleAutoFit,
  onExportPng,
  onSave,
  isExporting,
  showExportMenu,
  setShowExportMenu,
  exportMenuRef,
  showEditor,
  onToggleEditor
}) => {
  return (
    <div className="h-16 px-6 bg-white border-b border-neutral-200 flex justify-between items-center z-10">
      <div className="flex items-center gap-3">
        <span className="font-bold text-slate-800 tracking-tight">Preview</span>
        <div className="h-4 w-[1px] bg-slate-200" />
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Slide {currentPageIndex + 1}</span>
      </div>
      
      <div className="flex items-center gap-6">
        {/* ... (Zoom logic stays) */}
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={() => onZoomChange(Math.max(0.2, previewZoom - 0.1))} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ZoomOut size={14} />
          </button>
          <input 
            type="range" min="0.2" max="1.5" step="0.01" 
            value={previewZoom} 
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-20 accent-[#264376] h-1"
          />
          <button onClick={() => onZoomChange(Math.min(1.5, previewZoom + 0.1))} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ZoomIn size={14} />
          </button>
          <span className="text-[10px] font-bold text-slate-500 min-w-[32px] text-center">{Math.round(previewZoom * 100)}%</span>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button 
            onClick={onToggleAutoFit}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${isAutoFit ? 'bg-[#264376] text-white font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
            title="Auto Fit to Height"
          >
            <Minimize2 size={12} />
            <span className="text-[10px] uppercase">Fit</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          {/* ... (Page Navigation logic stays) */}
          <button
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === totalPages - 1}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors text-slate-600"
          >
            <ChevronRight size={20} />
          </button>

          <div className="w-px h-6 bg-slate-100 mx-2" />

          {/* Toggle Editor Button */}
          <button
            onClick={onToggleEditor}
            className={`p-2 rounded-lg transition-all ${!showEditor ? 'bg-[#264376] text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400'}`}
            title={showEditor ? "Collapse Editor" : "Expand Editor"}
          >
            <Maximize size={20} />
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
            title="Save changes and update thumbnail"
          >
            <span className="text-sm font-bold tracking-tight">Save</span>
          </button>

          <div className="relative ml-2" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 bg-[#264376] text-white px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#264376]/20"
            >
              <Download size={18} />
              <span className="text-sm font-bold tracking-tight">{isExporting ? 'Exporting...' : 'Export'}</span>
              <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1">
                    Select Option
                  </div>
                  <button 
                    onClick={() => onExportPng(false)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#264376]" />
                    Current Page
                  </button>
                  <button 
                    onClick={() => onExportPng(true)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full border border-[#264376]/30" />
                    All Pages ({totalPages})
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
