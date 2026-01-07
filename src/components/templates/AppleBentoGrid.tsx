import React from 'react';
import { PageData, BentoItem, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideIcon } from '../ui/slide/SlideIcon';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * 辅助函数：安全渲染 LaTeX
 */
const renderLatex = (text: string | undefined) => {
  if (!text) return null;
  try {
    return { __html: katex.renderToString(text, { throwOnError: false, displayMode: false }) };
  } catch (e) {
    return { __html: text };
  }
};

const BentoCell = ({ item, page, typography }: { item: BentoItem; page: PageData; typography?: TypographySettings }) => {
  const cellStyle: React.CSSProperties = {
    gridColumnStart: item.x,
    gridColumnEnd: item.x + item.colSpan,
    gridRowStart: item.y,
    gridRowEnd: item.y + item.rowSpan,
  };

  const themeStyles: Record<string, string> = {
    light: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
    accent: 'bg-[#264376] text-white shadow-[0_20px_50px_rgba(38,67,118,0.2)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 text-slate-900',
  };
  const bgClass = themeStyles[item.theme || 'light'];

  const fz = item.fontSize || 1;

  const content = () => {
    switch (item.type) {
      case 'metric':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
             <SlideHeadline 
               page={{...page, title: item.value || '00'}} 
               typography={typography}
               maxSize={48 * fz} 
               minSize={24 * fz}
               className="!tracking-tighter !leading-none mb-3 !opacity-90 !normal-case"
             />
             <SlideSubHeadline 
               page={{...page, subtitle: item.title}} 
               typography={typography}
               size={`${10 * fz}px`}
               className="!font-black !uppercase !tracking-[0.2em] !opacity-60 line-clamp-1"
             />
             {item.subtitle && (
               <SlideSubHeadline 
                 page={{...page, subtitle: item.subtitle}} 
                 typography={typography}
                 size={`${8 * fz}px`}
                 className="!font-medium !opacity-40 mt-1 !leading-relaxed max-w-[90%] line-clamp-2"
               />
             )}
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full relative overflow-hidden group">
             {item.image ? (
               <SlideImage 
                 page={page} src={item.image} config={item.imageConfig}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 rounded="0" 
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-100/50 text-slate-300"><SlideIcon name="Image" size={32} * fz /></div>
             )}
             {item.title && (
               <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
                 <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-slate-900 shadow-xl border border-white/20">
                    <SlideSubHeadline 
                      page={{...page, subtitle: item.title}} 
                      typography={typography}
                      size={`${8 * fz}px`}
                      className="!font-black !tracking-tight !m-0 !p-0"
                    />
                 </div>
               </div>
             )}
          </div>
        );
      case 'icon-text':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 p-4">
             <div className={`p-3 rounded-xl transition-colors duration-500 ${item.theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                <SlideIcon name={item.icon || 'Box'} size={24 * fz} className={item.theme === 'dark' ? 'text-white' : 'text-[#264376]'} />
             </div>
             <div className="space-y-1">
               <SlideHeadline 
                 page={{...page, title: item.title}} 
                 typography={typography}
                 maxSize={14 * fz}
                 minSize={12 * fz}
                 className="!font-black !tracking-tight line-clamp-1 !normal-case"
               />
               <SlideSubHeadline 
                 page={{...page, subtitle: item.subtitle}} 
                 typography={typography}
                 size={`${8 * fz}px`}
                 className="!opacity-50 !font-medium !leading-relaxed px-2 line-clamp-2"
               />
             </div>
          </div>
        );
      case 'feature-list':
        return (
          <div className="flex flex-col justify-center h-full p-6 space-y-2 items-start text-left"> {/* 核心修正：强制左对齐 */}
             <SlideHeadline 
               page={{...page, title: item.title}} 
               typography={typography}
               maxSize={18 * fz}
               className="!font-black !tracking-tighter !leading-tight border-l-3 border-current pl-3 !normal-case"
               style={{ textAlign: 'left' }}
             />
             <SlideSubHeadline 
               page={{...page, subtitle: item.subtitle}} 
               typography={typography}
               size={`${10 * fz}px`}
               className="!opacity-70 !font-medium !leading-relaxed line-clamp-3"
               style={{ textAlign: 'left' }}
             />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      style={cellStyle}
      className={`rounded-[1.5rem] overflow-hidden transition-all hover:scale-[1.01] duration-500 border border-black/[0.03] ${bgClass}`}
    >
      {content()}
    </div>
  );
};

export default function AppleBentoGrid({ page, typography }: { page: PageData; typography?: TypographySettings }) {
  const items = page.bentoItems || [];
  const config = page.bentoConfig || { rows: 4, cols: 4 };
  const backgroundColor = page.backgroundColor || '#ffffff';

  const showTitle = page.visibility?.title !== false;
  const showSubtitle = page.visibility?.subtitle !== false;

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-16 transition-all duration-1000 isolate"
      style={{ backgroundColor }}
    >
      {/* 头部标题区 */}
      {(showTitle || showSubtitle) && (
        <div className="mb-10 text-center max-w-3xl flex flex-col items-center">
          {page.logo && page.visibility?.logo !== false && <img src={page.logo} className="h-10 mx-auto mb-4 drop-shadow-sm" alt="logo" />}
          {showTitle && (
            <SlideHeadline 
              page={page} 
              typography={typography} 
              maxSize={64} 
              minSize={32}
              className="!normal-case !tracking-tight mb-2"
            />
          )}
          {showSubtitle && (
            <SlideSubHeadline 
              page={page} 
              typography={typography}
              className="!text-lg !font-medium !tracking-wide"
            />
          )}
        </div>
      )}

      {/* 核心网格 */}
      <div 
        className="w-full max-w-[1280px] grid gap-4 auto-rows-fr h-full max-h-[750px]"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
          gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        }}
      >
        {items.map((item, idx) => (
          <BentoCell key={item.id || idx} item={item} page={page} typography={typography} />
        ))}

        {items.length === 0 && (
          <div 
            className="border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-300"
            style={{ gridColumn: `span ${config.cols}`, gridRow: `span ${config.rows}` }}
          >
            <SlideIcon name="LayoutGrid" size={48} />
            <p className="font-black uppercase tracking-widest text-sm">Design Layout in Editor</p>
          </div>
        )}
      </div>
    </div>
  );
}