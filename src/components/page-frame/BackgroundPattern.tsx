import React from 'react';

interface BackgroundPatternProps {
  pattern?: string;
}

/**
 * BackgroundPattern - 背景纹理渲染器
 */
export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ pattern }) => {
  if (!pattern || pattern === 'none') return null;

  let style: React.CSSProperties = {};
  switch (pattern) {
    case 'grid':
      style = {
        backgroundImage: `linear-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--zine-color-primary) 0.5px, transparent 0.5px)`,
        backgroundSize: '48px 48px',
      };
      break;
    case 'dots':
      style = {
        backgroundImage: `radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px)`,
        backgroundSize: '24px 24px',
      };
      break;
    case 'diagonal':
      style = {
        backgroundImage: `repeating-linear-gradient(45deg, var(--zine-color-primary), var(--zine-color-primary) 0.5px, transparent 0.5px, transparent 12px)`,
        backgroundSize: '16px 16px',
      };
      break;
    case 'cross':
      style = {
        backgroundImage: `radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px), radial-gradient(var(--zine-color-primary) 0.5px, transparent 0.5px)`,
        backgroundSize: '32px 32px',
        backgroundPosition: '0 0, 16px 16px',
      };
      break;
  }

  return <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={style} />;
};
