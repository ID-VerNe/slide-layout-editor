import React from 'react';
import { PageData, PrintSettings, TypographySettings } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { LAYOUT_CONFIG } from '../constants/layout';
import MetadataOverlay from './ui/slide/MetadataOverlay';

// 引入模板
import ModernFeature from './templates/ModernFeature';
import PlatformHero from './templates/PlatformHero';
import ComponentMosaic from './templates/ComponentMosaic';
import TestimonialCard from './templates/TestimonialCard';
import CommunityHub from './templates/CommunityHub';
import TableOfContents from './templates/TableOfContents';
import BigStatement from './templates/BigStatement';
import StepTimeline from './templates/StepTimeline';
import GalleryCapsule from './templates/GalleryCapsule';
import EditorialSplit from './templates/EditorialSplit';
import BackCoverMovie from './templates/BackCoverMovie';
import FutureFocus from './templates/FutureFocus';
import EditorialClassic from './templates/EditorialClassic';
import CinematicFullBleed from './templates/CinematicFullBleed';
import EditorialBackCover from './templates/EditorialBackCover';
import KinfolkFeature from './templates/KinfolkFeature';
import KinfolkEssay from './templates/KinfolkEssay';
import KinfolkMontage from './templates/KinfolkMontage';
import MicroAnchor from './templates/MicroAnchor';
import TypographyHero from './templates/TypographyHero';
import FilmDiptych from './templates/FilmDiptych';
import AppleBentoGrid from './templates/AppleBentoGrid';
import AcademicHybridResume from './templates/AcademicHybridResume';

interface PreviewProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  printSettings?: PrintSettings; 
  typography?: TypographySettings;
  minimalCounter?: boolean;
}

const Preview: React.FC<PreviewProps> = React.memo(({ page, pageIndex, totalPages, printSettings, typography, minimalCounter }) => {
  const isMinimal = minimalCounter ?? page.minimalCounter ?? false;

  const renderTemplate = () => {
    // 核心重构：将页码元数据透传给模板组件
    const commonProps = { 
      page, 
      typography,
      pageIndex,
      totalPages 
    }; 

    switch (page.layoutId) {
      case 'academic-hybrid-resume': return <AcademicHybridResume {...commonProps} />;
      case 'modern-feature': return <ModernFeature {...commonProps} />;
      case 'platform-hero': return <PlatformHero {...commonProps} />;
      case 'component-mosaic': return <ComponentMosaic {...commonProps} />;
      case 'testimonial-card': return <TestimonialCard {...commonProps} />;
      case 'community-hub': return <CommunityHub {...commonProps} />;
      case 'table-of-contents': return <TableOfContents {...commonProps} />;
      case 'big-statement': return <BigStatement {...commonProps} />;
      case 'step-timeline': return <StepTimeline {...commonProps} />;
      case 'gallery-capsule': return <GalleryCapsule {...commonProps} />;
      case 'editorial-split': return <EditorialSplit {...commonProps} />;
      case 'back-cover-movie': return <BackCoverMovie {...commonProps} />;
      case 'future-focus': return <FutureFocus {...commonProps} />;
      case 'editorial-classic': return <EditorialClassic {...commonProps} />;
      case 'cinematic-full-bleed': return <CinematicFullBleed {...commonProps} />;
      case 'editorial-back-cover': return <EditorialBackCover {...commonProps} />;
      case 'kinfolk-feature': return <KinfolkFeature {...commonProps} />;
      case 'kinfolk-essay': return <KinfolkEssay {...commonProps} />;
      case 'kinfolk-montage': return <KinfolkMontage {...commonProps} />;
      case 'micro-anchor': return <MicroAnchor {...commonProps} />;
      case 'typography-hero': return <TypographyHero {...commonProps} />;
      case 'film-diptych': return <FilmDiptych {...commonProps} />;
      case 'apple-bento-grid': return <AppleBentoGrid {...commonProps} />;
      default: return <ModernFeature {...commonProps} />;
    }
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
      <MetadataOverlay page={page} pageIndex={pageIndex} minimalCounter={isMinimal} />
      <div 
        className="w-full h-full relative transition-all duration-700 isolate"
        style={isPrintEnabled ? { transform: `scale(${scaleFactor})`, transformOrigin: `${getOriginX()} ${getOriginY()}`, outline: printSettings?.showContentFrame ? '0.5px solid rgba(0,0,0,0.15)' : 'none', outlineOffset: '-0.5px' } : {}}
      >
        <AnimatePresence mode="wait">
          <motion.div key={page.id + page.layoutId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative z-10">
            {renderTemplate()}
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