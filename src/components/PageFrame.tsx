import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { PageData } from '../types';
import { BackgroundPattern } from './page-frame/BackgroundPattern';
import { GlobalFolio } from './page-frame/GlobalFolio';
import { ModularGridOverlay } from './page-frame/ModularGridOverlay';

export { DotsCounter } from './page-frame/DotsCounter';
export { ModularGridOverlay } from './page-frame/ModularGridOverlay';
export { BackgroundPattern } from './page-frame/BackgroundPattern';
export { GlobalFolio } from './page-frame/GlobalFolio';

interface PageFrameProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  children: React.ReactNode;
}

/**
 * PageFrame - 24x24 模块化网格容器
 * 职责：
 * 1. 注入 CSS 变量 (Design System Tokens)
 * 2. 渲染背景纹理 (BackgroundPattern)
 * 3. 渲染主内容插槽 (children)
 * 4. 渲染全局页码与元数据 (GlobalFolio)
 * 5. 渲染调试网格 (Alt+; 切换 ModularGridOverlay)
 */
export const PageFrame: React.FC<PageFrameProps> = ({ 
  page, 
  pageIndex, 
  totalPages, 
  children 
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const ds = useStore(s => s.designSystem);
  const counterStyle = useStore(s => s.counterStyle);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === ';' || e.key === '；')) {
        setShowGrid(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 注入 CSS 变量
  const tokenStyles = {
    '--zine-color-primary': ds.tokens.colors.primary,
    '--zine-color-secondary': ds.tokens.colors.secondary,
    '--zine-color-accent': ds.tokens.colors.accent,
    '--zine-color-background': page.backgroundColor || ds.tokens.colors.background,
    '--zine-color-surface': ds.tokens.colors.surface,
    '--zine-baseline': '8px',
  } as React.CSSProperties;

  return (
    <div 
      className="zine-page-frame w-full h-full relative overflow-hidden isolate"
      style={{
        ...tokenStyles,
        backgroundColor: page.backgroundColor || ds.tokens.colors.background,
      }}
    >
      {/* Layer 1: Background Pattern */}
      <BackgroundPattern pattern={page.backgroundPattern} />

      {/* Layer 2: Main Content Slot */}
      <div className="zine-content-slot w-full h-full relative z-10">
        {children}
      </div>

      {/* Layer 3: Global Folio (Anchor Lock) */}
      <GlobalFolio 
        page={page} 
        pageIndex={pageIndex} 
        totalPages={totalPages} 
        ds={ds} 
        counterStyle={counterStyle} 
      />

      {/* Layer 4: Debug Overlays */}
      {showGrid && <ModularGridOverlay />}
    </div>
  );
};
