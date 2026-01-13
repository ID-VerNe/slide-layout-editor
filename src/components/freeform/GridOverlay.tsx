import React from 'react';

interface GridOverlayProps {
  size: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ size }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        opacity: 0.3,
      }}
    />
  );
};
