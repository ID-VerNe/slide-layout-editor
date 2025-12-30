import React from 'react';

export const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#264376" floodOpacity="0.2"/>
      </filter>
    </defs>
    <rect x="8" y="8" width="20" height="20" rx="5" fill="#264376" fillOpacity={0.15} stroke="#264376" strokeWidth="1.5"/>
    <rect x="12" y="12" width="20" height="20" rx="5" fill="white" stroke="#264376" strokeWidth="2" filter="url(#logoShadow)"/>
    <path d="M18 22H26M22 18V26" stroke="#264376" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);