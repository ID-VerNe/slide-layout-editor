import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideParagraph } from '../ui/slide/SlideParagraph';
import { useStore } from '../../store/useStore';

/**
 * SincerityPortrait - 挚诚 / 亲密肖像模板
 * Micro Anchor 的变体：针对 2:3 竖屏优化，非对称平衡设计。
 */
export default function SincerityPortrait({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  // 核心设置
  const backgroundColor = page.backgroundColor || theme.colors.background || '#FFFFFF';
  const imageWidth = '70%'; // 占据页面约 70%，形成强烈冲击
  
  const displayTopText = page.title || 'THE SILENCE OF THE FRAME';

  return (
    <div 
      className="w-full h-full relative p-12 transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      {/* 1. 顶部装饰性背景文字 - 继承自 MicroAnchor 的风格 */}
      <div className="absolute top-[20%] left-0 w-full text-center px-24 pointer-events-none z-0">
        <SlideBlockLabel 
          page={page}
          typography={typography}
          text={displayTopText}
          className="!italic !uppercase !font-bold !tracking-[0.5em] !opacity-[0.15] !border-none"
          color={theme.colors.primary}
          style={{ 
            fontSize: page.styleOverrides?.title?.fontSize ? `${page.styleOverrides.title.fontSize}px` : '14px',
            textAlign: 'center'
          }}
        />
      </div>

      {/* 2. 文字布局 - 左上/左中区域，对角线平衡 */}
      <div className="relative z-10 mt-24 ml-8 max-w-[60%] animate-in fade-in slide-in-from-left-8 duration-1000">
        <SlideHeadline 
          page={page}
          typography={typography}
          className="!text-left !tracking-widest !mb-6 !normal-case"
          maxSize={42}
          minSize={24}
          color={theme.colors.primary}
          style={{ 
            fontFamily: page.styleOverrides?.title?.fontFamily || theme.typography.headingFont || "'Playfair Display', serif",
            fontWeight: 400,
            lineHeight: 1.2
          }}
        />
        
        <SlideSubHeadline 
          page={page}
          typography={typography}
          className="!text-left !tracking-[0.1em] !opacity-90 !mb-8 !italic"
          color={theme.colors.secondary}
          size="1.1rem"
        />

        <SlideParagraph 
          page={page}
          typography={typography}
          className="!text-left !opacity-70"
          size="0.95rem"
          color={theme.colors.secondary}
        />
      </div>

      {/* 3. 图片布局 - 右下角对齐 */}
      <div 
        className="absolute bottom-20 right-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10"
        style={{ width: imageWidth }}
      >
        <div className="aspect-[3/4] bg-white shadow-[0_50px_140px_rgba(0,0,0,0.1)] overflow-hidden border-[1px] border-slate-100/30">
          <SlideImage page={page} className="w-full h-full object-cover" rounded="0" backgroundColor="transparent" />
        </div>
        
        {/* 图片下方的标签 */}
        <div className="mt-4 text-right opacity-40">
           <SlideBlockLabel 
            page={page}
            typography={typography}
            fieldKey="imageLabel"
            className="!p-0 !border-none !italic !text-[10px] !tracking-widest"
            color={theme.colors.secondary}
          />
        </div>
      </div>

      {/* 页码 (V) 由 MetadataOverlay 自动渲染，此处无需额外代码 */}
    </div>
  );
}
