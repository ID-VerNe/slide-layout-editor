import React from 'react';
import { PageData } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { LAYOUT_CONFIG } from '../constants/layout';

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

interface PreviewProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
}

const Preview: React.FC<PreviewProps> = React.memo(({ page, pageIndex, totalPages }) => {
  const customCounterColor = page.counterColor || '#64748b';

  const renderCounter = () => {
    const style = page.counterStyle || 'number';
    const current = pageIndex + 1;

    switch (style) {
      case 'alpha':
        return String.fromCharCode(64 + current).toUpperCase();
      case 'roman':
        const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' };
        return romanMap[current] || current.toString();
      case 'dots':
        const tens = Math.floor(current / 10);
        const fives = Math.floor((current % 10) / 5);
        const ones = current % 5;
        return (
          <div className="flex gap-2 items-center">
            {Array.from({ length: tens }).map((_, i) => <div key={`t-${i}`} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: customCounterColor }} />)}
            {Array.from({ length: fives }).map((_, i) => <div key={`f-${i}`} className="w-0.5 h-3 rounded-full mx-0.5" style={{ backgroundColor: customCounterColor }} />)}
            {Array.from({ length: ones }).map((_, i) => <div key={`o-${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: customCounterColor }} />)}
          </div>
        );
      default:
        return current.toString().padStart(2, '0');
    }
  };

  const renderBackgroundPattern = () => {
    const pattern = page.backgroundPattern || 'none';
    if (pattern === 'none') return null;

    let style: React.CSSProperties = {};
    
    switch (pattern) {
      case 'grid':
        style = {
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        };
        break;
      case 'dots':
        style = {
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        };
        break;
      case 'diagonal':
        style = {
          backgroundImage: `repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 15px)`,
          backgroundSize: '20px 20px'
        };
        break;
      case 'cross':
        style = {
          backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        };
        break;
    }

    return (
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={style}
      />
    );
  };

  const renderTemplate = () => {
    switch (page.layoutId) {
      case 'modern-feature': return <ModernFeature page={page} />;
      case 'platform-hero': return <PlatformHero page={page} />;
      case 'component-mosaic': return <ComponentMosaic page={page} />;
      case 'testimonial-card': return <TestimonialCard page={page} />;
      case 'community-hub': return <CommunityHub page={page} />;
      case 'table-of-contents': return <TableOfContents page={page} />;
      case 'big-statement': return <BigStatement page={page} />;
      case 'step-timeline': return <StepTimeline page={page} />;
      case 'gallery-capsule': return <GalleryCapsule page={page} />;
      case 'editorial-split': return <EditorialSplit page={page} />;
      case 'back-cover-movie': return <BackCoverMovie page={page} />;
      case 'future-focus': return <FutureFocus page={page} />;
      case 'editorial-classic': return <EditorialClassic page={page} />;
      case 'cinematic-full-bleed': return <CinematicFullBleed page={page} />;
      case 'editorial-back-cover': return <EditorialBackCover page={page} />;
      case 'kinfolk-feature': return <KinfolkFeature page={page} />;
      case 'kinfolk-essay': return <KinfolkEssay page={page} />;
      case 'kinfolk-montage': return <KinfolkMontage page={page} />;
      case 'micro-anchor': return <MicroAnchor page={page} />;
      case 'typography-hero': return <TypographyHero page={page} />;
      case 'film-diptych': return <FilmDiptych page={page} />;
      default: 
        return <ModernFeature page={page} />;
    }
  };

  const dimensions = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
  const isMinimal = page.minimalCounter === true;

  return (
    <div
      className="magazine-page relative shadow-2xl mx-auto overflow-hidden shrink-0"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        backgroundColor: page.backgroundColor || '#ffffff',
      }}
    >
      {renderBackgroundPattern()}

      <AnimatePresence mode="wait">
        <motion.div
          key={page.id + page.layoutId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full relative z-10"
        >
          {renderTemplate()}
        </motion.div>
      </AnimatePresence>

      <div className={`absolute bottom-10 left-16 right-16 flex justify-between items-center z-20 pointer-events-none ${page.layoutVariant === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-pre-line transition-all duration-500 ${page.layoutVariant === 'right' ? 'text-right' : 'text-left'}`} 
          style={{ color: customCounterColor, opacity: 0.4 }} // 元数据保持低透明度
        >
           {page.footer}
        </div>
        
        {page.pageNumber !== false ? (
          <div 
            className={`text-[10px] font-black uppercase tracking-widest flex items-center transition-all duration-500
              ${isMinimal ? '' : 'gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 shadow-sm'}`}
            style={{ 
              color: customCounterColor,
              // 核心修复：如果是 Minimal 模式，给 0.4 的透明度；如果是正常模式，全显 (1.0)
              opacity: isMinimal ? 0.4 : 1.0 
            }}
          >
             {renderCounter()}
          </div>
        ) : (
          page.pageNumberText && (
            <div 
              className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center animate-in fade-in"
              style={{ color: customCounterColor, opacity: 0.6 }}
            >
               {page.pageNumberText}
            </div>
          )
        )}
      </div>
    </div>
  );
});

export default Preview;