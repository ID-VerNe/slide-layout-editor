import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';

/**
 * TypographyHero - 文字主角模板
 * 终极加固版：全原子化渲染，极致光学对齐。
 */
export default function TypographyHero({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const displayTitle = page.title || 'THE UNSPOKEN LANGUAGE';
  const displaySubtitle = page.subtitle || '"Through the mask, the soul speaks louder than words ever could."';
  const displayLabel = page.imageLabel || 'CHAPTER 02';

  const backgroundColor = page.backgroundColor || '#FAFAF9';
  const accentColor = page.accentColor || '#000000';

  return (
    <div 
      className="w-full h-full p-16 flex flex-col justify-center transition-all duration-700 overflow-hidden isolate"
      style={{ backgroundColor }}
    >
      
      <div className="w-full flex flex-col items-center">
        
        {/* 顶部线条 */}
        <div className="w-full h-[1px] mb-8 opacity-60" style={{ backgroundColor: accentColor }} />

        {/* 1. 核心大标题 */}
        <div className="w-full mb-4 pl-6">
          <SlideHeadline 
            page={{...page, title: displayTitle}} 
            typography={typography}
            maxSize={72} 
            minSize={32}
            weight={300}
            italic={true}
            className="!tracking-[0.3em] !normal-case leading-tight"
            style={{ 
              color: accentColor,
              textAlign: 'center'
            }}
          />
        </div>

        {/* 2. 副标题 / 引言 */}
        <div className="w-[70%] text-center mt-8">
          <SlideSubHeadline 
            page={{...page, subtitle: displaySubtitle}}
            typography={typography}
            className="!tracking-[0.1em] !font-light leading-relaxed !not-italic"
            size="1.15rem" 
            color="#4b5563"
            style={{ 
              lineHeight: 2.0 
            }}
          />
        </div>

        {/* 中间/底部线条 */}
        <div className="w-full h-[1px] mt-8 mb-12 opacity-60" style={{ backgroundColor: accentColor }} />

        {/* 3. 极稀疏元数据 - 核心修正：接入 SlideBlockLabel */}
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
           <SlideBlockLabel 
             page={page}
             typography={typography}
             text={displayLabel}
             className="!uppercase !tracking-[0.5em] !font-black !opacity-25"
             color={accentColor}
             style={{ fontSize: '8px' }}
           />
        </div>

      </div>

    </div>
  );
}