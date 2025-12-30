import React from 'react';
import Preview from '../Preview';
import { PageData } from '../../types';

interface PreviewAreaProps {
  pages: PageData[];
  currentPageIndex: number;
  previewZoom: number;
  previewRef: React.RefObject<HTMLDivElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  enforceA4: boolean;
  onOverflowChange: (pageId: string, isOverflowing: boolean) => void;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  pages,
  currentPageIndex,
  previewZoom,
  previewRef,
  previewContainerRef,
}) => {
  return (
    <div className="flex-1 overflow-auto p-12 no-scrollbar bg-neutral-200/50 flex items-center justify-center" ref={previewContainerRef}>
      <div 
        className="flex flex-col items-center gap-12 origin-center"
        ref={previewRef}
        style={{ transform: `scale(${previewZoom})` }}
      >
        {pages[currentPageIndex] && (
          <div 
            key={pages[currentPageIndex].id} 
            className="magazine-page-container block shadow-2xl shadow-slate-300/50"
          >
            <Preview 
              page={pages[currentPageIndex]} 
              pageIndex={currentPageIndex}
              totalPages={pages.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewArea;
