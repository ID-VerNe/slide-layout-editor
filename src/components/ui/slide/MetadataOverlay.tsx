import React from 'react';
import { PageData, ProjectTheme } from '../../../types';

interface MetadataOverlayProps {
  page: PageData;
  pageIndex: number;
  minimalCounter: boolean;
  theme?: ProjectTheme;
}

const MetadataOverlay: React.FC<MetadataOverlayProps> = ({ page, pageIndex, minimalCounter }) => {
  const customCounterColor = page.counterColor || '#64748b';
  const isMinimal = minimalCounter; // 纯净的布尔值

  // 1. 渲染页码逻辑
  const renderCounter = () => {
    const style = page.counterStyle || 'number';
    const current = pageIndex + 1;

    switch (style) {
      case 'alpha': return String.fromCharCode(64 + current).toUpperCase();
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
      default: return current.toString().padStart(2, '0');
    }
  };

  // 2. 渲染背景纹理逻辑
  const renderBackgroundPattern = () => {
    const pattern = page.backgroundPattern || 'none';
    if (pattern === 'none') return null;
    let style: React.CSSProperties = {};
    switch (pattern) {
      case 'grid': style = { backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '60px 60px' }; break;
      case 'dots': style = { backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '30px 30px' }; break;
      case 'diagonal': style = { backgroundImage: `repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 15px)`, backgroundSize: '20px 20px' }; break;
      case 'cross': style = { backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }; break;
    }
    return <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={style} />;
  };

  // 3. 构建容器类名：彻底分离 Minimal 样式
  // 普通模式：有背景、有模糊、有边框、有阴影
  const standardCounterClass = "gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 shadow-sm";
  // 极简模式：完全透明，无任何装饰
  const minimalCounterClass = "";

  const containerClass = `text-[10px] font-black uppercase tracking-widest flex items-center transition-all duration-500 ${isMinimal ? minimalCounterClass : standardCounterClass}`;

  return (
    <>
      {/* Layer 1: Background Pattern (最底层) */}
      {renderBackgroundPattern()}

      {/* Layer 2: Metadata Footer (最顶层悬浮) */}
      <div className={`absolute bottom-10 left-16 right-16 flex justify-between items-center z-50 pointer-events-none ${page.layoutVariant === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Footer Text */}
        <div 
          className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-pre-line transition-all duration-500 ${page.layoutVariant === 'right' ? 'text-right' : 'text-left'}`} 
          style={{ color: customCounterColor, opacity: 0.4 }}
        >
          {page.footer}
        </div>

        {/* Page Number Counter */}
        {page.pageNumber !== false && (
          <div className={containerClass} style={{ color: customCounterColor }}>
            {renderCounter()}
          </div>
        )}
        
      </div>
    </>
  );
};

export default MetadataOverlay;
