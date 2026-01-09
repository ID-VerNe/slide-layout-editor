import React from 'react';
import { PageData, PrintSettings, TypographySettings } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { LAYOUT_CONFIG } from '../constants/layout';
import MetadataOverlay from './ui/slide/MetadataOverlay';
import templateMap from './templateMap';
import TemplateLoader from './ui/TemplateLoader';
import TemplateErrorBoundary from './ui/TemplateErrorBoundary';

interface PreviewProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  printSettings?: PrintSettings; 
  typography?: TypographySettings;
  minimalCounter?: boolean;
}

/**
 * Preview - 核心预览容器
 * 重构版：已将元数据层（页码、页脚、背景纹理）彻底剥离至 MetadataOverlay 组件。
 */
const Preview: React.FC<PreviewProps> = React.memo(({ page, pageIndex, totalPages, printSettings, typography, minimalCounter }) => {
  const isMinimal = minimalCounter ?? page.minimalCounter ?? false;

  const renderTemplate = () => {
    const commonProps = { page, typography }; 
    const TemplateComponent = templateMap[page.layoutId] || templateMap['modern-feature'];
    return <TemplateComponent {...commonProps} />;
  };

  const designDims = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
  const isPrintEnabled = printSettings?.enabled;
  const orientation = designDims.orientation;
  const config = (printSettings?.configs && printSettings.configs[orientation]) || { bindingSide: 'left', trimSide: 'bottom' };
  const widthMm = printSettings?.widthMm || 100;
  const heightMm = printSettings?.heightMm || 145;
  const gutterMm = printSettings?.gutterMm || 10;

  const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
  const availWidthMm = isHorizontalBinding ? (widthMm - gutterMm) : widthMm;
  const availHeightMm = !isHorizontalBinding ? (heightMm - gutterMm) : heightMm;
  const scaleW = availWidthMm / widthMm;
  const scaleH = availHeightMm / heightMm;
  const scaleFactor = isPrintEnabled ? Math.min(scaleW, scaleH) : 1;
  const canvasWidth = designDims.width;
  const canvasHeight = isPrintEnabled ? designDims.width * (heightMm / widthMm) : designDims.height;
  const ppi = canvasWidth / widthMm;
  const gutterPx = gutterMm * ppi;

  const getOriginX = () => { if (config.bindingSide === 'left') return 'right'; if (config.bindingSide === 'right') return 'left'; if (config.trimSide === 'left') return 'right'; if (config.trimSide === 'right') return 'left'; return 'center'; };
  const getOriginY = () => { if (config.bindingSide === 'top') return 'bottom'; if (config.bindingSide === 'bottom') return 'top'; if (config.trimSide === 'top') return 'bottom'; if (config.trimSide === 'bottom') return 'top'; return 'center'; };

  return (
    <div
      className="magazine-page relative shadow-2xl mx-auto overflow-hidden shrink-0"
      style={{
        width: `${canvasWidth}px`, height: `${canvasHeight}px`,
        backgroundColor: page.backgroundColor || '#ffffff',
      }}
    >
      <div 
        className="w-full h-full relative transition-all duration-700 isolate"
        style={isPrintEnabled ? { transform: `scale(${scaleFactor})`, transformOrigin: `${getOriginX()} ${getOriginY()}`, outline: printSettings?.showContentFrame ? '0.5px solid rgba(0,0,0,0.15)' : 'none', outlineOffset: '-0.5px' } : {}}
      >
        {/* 
          核心重构：元数据层移动到缩放层内部
          这确保了页码和纹理能跟随整体比例调整（例如打印位移）
        */}
        <MetadataOverlay page={page} pageIndex={pageIndex} minimalCounter={isMinimal} />

        <AnimatePresence mode="wait">
          <motion.div key={page.id + page.layoutId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative z-10">
            <React.Suspense fallback={<TemplateLoader />}>
              <TemplateErrorBoundary>
                {renderTemplate()}
              </TemplateErrorBoundary>
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {isPrintEnabled && (
        <>
          {printSettings?.showGutterShadow && (
            <div className="absolute z-50 pointer-events-none flex items-center justify-center overflow-hidden" style={{ top: config.bindingSide === 'bottom' ? 'auto' : 0, bottom: config.bindingSide === 'bottom' ? 0 : 'auto', left: config.bindingSide === 'right' ? 'auto' : 0, right: config.bindingSide === 'right' ? 0 : 'auto', width: isHorizontalBinding ? `${gutterPx}px` : '100%', height: isHorizontalBinding ? '100%' : `${gutterPx}px`, background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)', borderLeft: config.bindingSide === 'right' ? '1px dashed rgba(0,0,0,0.2)' : 'none', borderRight: config.bindingSide === 'left' ? '1px dashed rgba(0,0,0,0.2)' : 'none', borderTop: config.bindingSide === 'bottom' ? '1px dashed rgba(0,0,0,0.2)' : 'none', borderBottom: config.bindingSide === 'top' ? '1px dashed rgba(0,0,0,0.2)' : 'none' }}>
              <span className={`text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 whitespace-nowrap ${isHorizontalBinding ? '-rotate-90' : ''}`}>Binding: {config.bindingSide}</span>
            </div>
          )}
          {printSettings?.showTrimShadow && (
            <div className="absolute z-50 pointer-events-none flex items-center justify-center overflow-hidden" style={{ top: config.trimSide === 'bottom' ? 'auto' : 0, bottom: config.trimSide === 'bottom' ? 0 : 'auto', left: config.trimSide === 'right' ? 'auto' : 0, right: config.trimSide === 'right' ? 0 : 'auto', width: (config.trimSide === 'left' || config.trimSide === 'right') ? `${canvasWidth - (canvasWidth * scaleFactor) - (isHorizontalBinding ? gutterPx : 0)}px` : '100%', height: (config.trimSide === 'top' || config.trimSide === 'bottom') ? `${canvasHeight - (canvasHeight * scaleFactor) - (!isHorizontalBinding ? gutterPx : 0)}px` : '100%', background: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)', opacity: 0.8 }}>
              <span className={`text-[9px] font-black uppercase tracking-[0.8em] text-slate-300 ${(config.trimSide === 'left' || config.trimSide === 'right') ? 'rotate-90' : ''}`}>Trim: {config.trimSide}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default Preview;