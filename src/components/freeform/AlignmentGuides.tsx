import React from 'react';
import { AlignmentGuide } from '../../utils/alignmentUtils';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ guides }) => {
  if (!guides || guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute bg-red-500 z-50 pointer-events-none"
          style={{
            left: guide.type === 'vertical' ? guide.position : guide.start,
            top: guide.type === 'horizontal' ? guide.position : guide.start,
            width: guide.type === 'vertical' ? 1 : guide.length,
            height: guide.type === 'horizontal' ? 1 : guide.length,
            opacity: 0.8,
          }}
        />
      ))}
    </>
  );
};