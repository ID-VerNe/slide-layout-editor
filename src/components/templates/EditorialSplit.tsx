import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideLogo } from '../ui/slide/SlideLogo';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideSubHeadline } from '../ui/slide/SlideSubHeadline';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { ArrowRight } from 'lucide-react';

/**
 * EditorialSplit - 杂志风格分屏布局
 * 修复版：将误用的 footer 字段迁移至 paragraph 字段，实现单页数据独立。
 */
export default function EditorialSplit({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const isVariantRight = page.layoutVariant !== 'left'; 
  const isVisible = (key: keyof NonNullable<PageData['visibility']>) => page.visibility?.[key] !== false;

  return (
    <div 
      className={`w-full h-full flex p-20 relative overflow-hidden transition-all duration-700 gap-16 isolate ${isVariantRight ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
    >
      {/* Side Sidebar: 文字展示区 */}
      <div className="w-[32%] h-full flex flex-col justify-between py-12 z-10 text-left">
        
        <div className="space-y-6">
          <SlideLogo page={page} className="mb-4" />
          
          {/* 
            核心修复：改用 paragraph 字段渲染元数据
            这样可以避免全局页脚内容的冲突，并支持多行编辑。
          */}
          <SlideSubHeadline 
            page={{...page, subtitle: page.paragraph || 'EDITORIAL METADATA\nLOCATED IN TOKYO, JAPAN\nREF. 2025-SLE'}}
            typography={typography}
            className="!text-[8px] !font-medium !tracking-[0.2em] !leading-loose !uppercase !opacity-40 !m-0"
          />
          
          {/* 导航列表 */}
          {isVisible('bullets' as any) && (page.bullets?.length || 0) > 0 && (
            <div className="pt-8 space-y-3">
              {page.bullets?.map((item, idx) => (
                <SlideBlockLabel 
                  key={idx}
                  page={page}
                  typography={typography}
                  text={item}
                  className="!text-[10px] !font-bold !tracking-widest !text-slate-900/60 !opacity-100 block hover:!text-[#264376] cursor-pointer transition-colors"
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部品牌区 */}
        <div className="space-y-4">
          <div className="space-y-1">
            <SlideSubHeadline 
              page={page} 
              typography={typography}
              className="!text-[10px] !font-black !uppercase !tracking-[0.4em] !text-[#264376]"
            />
            <SlideHeadline 
              page={page} 
              typography={typography}
              maxSize={72} 
              className="text-slate-900 !font-black !tracking-tighter" 
            />
          </div>
          <div className="h-px w-16 bg-slate-200" />
          <SlideBlockLabel 
            page={page} 
            typography={typography} 
            text="PUBLISHED EDITION" 
            className="!text-[9px] !font-medium !uppercase !tracking-[0.5em] !text-slate-300" 
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 h-full relative group">
        <SlideImage 
          page={page} 
          className="w-full h-full shadow-2xl" 
          rounded="3.5rem"
        />

        {/* Floating Info Panel */}
        {isVisible('imageLabel') && (page.imageLabel || page.imageSubLabel) && (
          <div className={`absolute bottom-12 ${isVariantRight ? 'right-12' : 'left-12'} bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-[380px] animate-in fade-in slide-in-from-bottom-6 duration-700 z-30`}>
            <div className="flex items-center gap-4 mb-4">
              <SlideBlockLabel 
                page={page} 
                typography={typography}
                text={page.imageSubLabel || 'Information'}
                className="!text-[11px] !font-black !uppercase !tracking-[0.2em] !text-slate-900"
              />
            </div>
            
            <SlideSubHeadline 
              page={{...page, subtitle: page.imageLabel}}
              typography={typography}
              className="!text-sm !font-bold !text-slate-900 !leading-relaxed mb-8"
            />
            
            {isVisible('actionText') && page.actionText && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button className="flex items-center gap-3 text-slate-900 hover:text-[#264376] transition-all group/more">
                  <div className="w-6 h-6 rounded-full bg-[#264376] flex items-center justify-center text-white scale-90 group-hover/more:scale-110 transition-transform">
                    <ArrowRight size={14} />
                  </div>
                  <SlideBlockLabel 
                    page={page} 
                    typography={typography}
                    text={page.actionText}
                    className="!text-[10px] !font-black !uppercase !tracking-[0.2em]"
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}