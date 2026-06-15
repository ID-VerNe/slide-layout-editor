import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { PageData, DesignSystem } from '../types';
import { getTemplateById } from '../templates/registry';

interface PageFrameProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  children: React.ReactNode;
}

/** 将正整数转为罗马数字（支持 1~3999） */
function toRoman(num: number): string {
  if (num < 1) return String(num);
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

/** 将正整数转为 Alpha 序号（1→A, 26→Z, 27→AA, 28→AB … 类似 Excel 列名） */
function toAlpha(num: number): string {
  let result = '';
  while (num > 0) {
    num--; // 使 1-based 变为 0-based
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/**
 * PageFrame - 24x24 模块化网格容器
 * 负责：
 * 1. 注入 CSS 变量 (Design System Tokens)
 * 2. 渲染全局页码与元数据 (Global Folio)
 * 3. 渲染调试网格 (Alt+; 切换)
 * 4. 渲染背景纹理
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

/**
 * 24x24 物理网格与 8px 基线叠加层
 */
const ModularGridOverlay: React.FC = () => (
  <div 
    className="absolute inset-0 z-[100] pointer-events-none overflow-hidden select-none"
    data-testid="modular-grid-overlay"
  >
    {/* 24x24 Grid */}
    <div className="w-full h-full grid grid-cols-24 grid-rows-24 opacity-20">
      {Array.from({ length: 24 * 24 }).map((_, i) => (
        <div key={i} className="border-[0.5px] border-zine-accent/30" />
      ))}
    </div>
    
    {/* 8px Baseline Grid */}
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: 'linear-gradient(rgba(38, 67, 118, 0.1) 0.5px, transparent 0.5px)',
        backgroundSize: '100% 8px'
      }}
    />

    {/* Center Axis Indicators */}
    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zine-accent/20" />
    <div className="absolute left-0 right-0 top-1/2 h-px bg-zine-accent/20" />

    {/* Debug Label */}
    <div className="absolute top-2 left-2 bg-zine-accent text-white text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest rounded-sm opacity-80">
      24x24 Grid / 8px Baseline
    </div>
  </div>
);

/**
 * 全局 Folio 锁定层
 */
const GlobalFolio: React.FC<{ 
  page: PageData; 
  pageIndex: number; 
  totalPages: number; 
  ds: DesignSystem;
  counterStyle: string;
}> = ({ page, pageIndex, ds, counterStyle }) => {
  const customCounterColor = page.counterColor || ds.tokens.colors.secondary;
  
  const alignment = page.folioAlignment || 'auto';
  const isRight = alignment === 'auto' ? page.layoutVariant === 'right' : alignment === 'right';

  // 当模板未注册或注册字段中包含 footer 时，允许渲染页脚文字
  const templateConfig = getTemplateById(page.layoutId);
  const hasFooterField = !templateConfig || templateConfig.fields?.some((f: any) => f.key === 'footer');

  const renderCounter = () => {
    const style = counterStyle || page.counterStyle || 'number';
    const current = pageIndex + 1;

    switch (style) {
      case 'alpha': return toAlpha(current);
      case 'roman': return toRoman(current);
      case 'dots':
        return (
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: Math.floor(current / 10) }).map((_, i) => <div key={`t-${i}`} className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: customCounterColor }} />)}
            {Array.from({ length: current % 10 }).map((_, i) => <div key={`o-${i}`} className="w-1 h-1 rounded-none" style={{ backgroundColor: customCounterColor, opacity: 0.6 }} />)}
          </div>
        );
      default: return current.toString().padStart(2, '0');
    }
  };

  if (page.pageNumber === false) return null;

  // 使用 24x24 网格进行数学对齐：离开边框一个格子即 row: 23, col: 2 (左) 或 23 (右)
  return (
    <div className="absolute inset-0 grid grid-cols-24 grid-rows-24 z-50 pointer-events-none p-0">
      {/* 档案号/页脚文字 (FIG. XX) - 默认放置在页码对面 */}
      {page.footer && hasFooterField && (
        <div 
          className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-40 whitespace-pre-line flex items-end
            ${isRight ? 'text-left' : 'text-right'}`}
          style={{ 
            color: customCounterColor,
            gridRow: '23 / 24',
            gridColumn: isRight ? '2 / 8' : '18 / 24',
            justifyContent: isRight ? 'flex-start' : 'flex-end'
          }}
        >
          {page.footer}
        </div>
      )}

      {/* 页码显示 (Roman/Dots/Number) */}
      <div 
        className={`flex items-end`}
        style={{ 
          color: customCounterColor,
          gridRow: '23 / 24',
          gridColumn: isRight ? '23 / 24' : '2 / 3',
          justifyContent: isRight ? 'flex-end' : 'flex-start'
        }}
      >
        <span 
          className="font-black tracking-[0.3em]"
          style={{ 
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          {renderCounter()}
        </span>
      </div>
    </div>
  );
};

/**
 * 背景纹理渲染器
 */
const BackgroundPattern: React.FC<{ pattern?: string }> = ({ pattern }) => {
  if (!pattern || pattern === 'none') return null;
  
  let style: React.CSSProperties = {};
  switch (pattern) {
    case 'grid': style = { backgroundImage: `linear-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--zine-color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '48px 48px' }; break;
    case 'dots': style = { backgroundImage: `radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }; break;
    case 'diagonal': style = { backgroundImage: `repeating-linear-gradient(45deg, var(--zine-color-primary), var(--zine-color-primary) 0.5px, transparent 0.5px, transparent 12px)`, backgroundSize: '16px 16px' }; break;
    case 'cross': style = { backgroundImage: `radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px), radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px', backgroundPosition: '0 0, 16px 16px' }; break;
  }
  
  return <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={style} />;
};
