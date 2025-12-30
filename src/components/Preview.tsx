import React from 'react';
import { PageData } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

// 引入重构后的新模板
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

interface PreviewProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
}

const Preview: React.FC<PreviewProps> = React.memo(({ page, pageIndex, totalPages }) => {
  
  // 页码转换逻辑
  const renderCounter = () => {
    const style = page.counterStyle || 'number';
    const current = pageIndex + 1;

    switch (style) {
      case 'alpha':
        return String.fromCharCode(64 + current).toUpperCase();
      case 'roman':
        const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
        return romanMap[current] || current.toString();
      case 'dots':
        const tens = Math.floor(current / 10);
        const fives = Math.floor((current % 10) / 5);
        const ones = current % 5;
        return (
          <div className="flex gap-2 items-center">
            {Array.from({ length: tens }).map((_, i) => <div key={`t-${i}`} className="w-2 h-2 bg-[#264376] rounded-[1px]" />)}
            {Array.from({ length: fives }).map((_, i) => <div key={`f-${i}`} className="w-0.5 h-3 bg-[#264376] rounded-full mx-0.5" />)}
            {Array.from({ length: ones }).map((_, i) => <div key={`o-${i}`} className="w-1.5 h-1.5 bg-[#264376] rounded-full" />)}
          </div>
        );
      default:
        return current.toString().padStart(2, '0');
    }
  };

  // 背景纹路渲染
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

  // 路由分发模板
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
      default: 
        return <ModernFeature page={page} />;
    }
  };

  return (
    <div
      className="magazine-page relative shadow-2xl mx-auto overflow-hidden shrink-0"
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: page.backgroundColor || '#ffffff',
      }}
    >
      {/* 渲染全局背景纹路 */}
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

      {/* 改进后的全局页码/页脚组件 */}
      <div className="absolute bottom-10 left-16 right-16 flex justify-between items-center z-20 pointer-events-none">
        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] text-slate-500">
           {page.footer}
        </div>
        
        {page.pageNumber !== false && (
          <div className="text-[10px] font-black text-slate-500 opacity-40 uppercase tracking-widest flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50">
             {renderCounter()}
          </div>
        )}
      </div>
    </div>
  );
});

export default Preview;