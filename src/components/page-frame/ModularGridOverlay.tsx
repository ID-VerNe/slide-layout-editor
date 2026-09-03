import React from 'react';

/**
 * ModularGridOverlay - 24x24 物理网格与 8px 基线叠加层
 */
export const ModularGridOverlay: React.FC = () => (
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
