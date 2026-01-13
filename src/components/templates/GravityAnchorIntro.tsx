import React from 'react';
import { PageData, TypographySettings } from '../../types';
import { SlideImage } from '../ui/slide/SlideImage';
import { SlideHeadline } from '../ui/slide/SlideHeadline';
import { SlideParagraph } from '../ui/slide/SlideParagraph';
import { SlideBlockLabel } from '../ui/slide/SlideBlockLabel';
import { useStore } from '../../store/useStore';

/**
 * GravityAnchorIntro - 定场镜头 / 序言页
 * 核心：上白下屏，重力沉底。
 */
export default function GravityAnchorIntro({ page, typography }: { page: PageData, typography?: TypographySettings }) {
  const theme = useStore((state) => state.theme);
  
  const displayTitle = page.title || 'CASE FILE : AKO';
  
  // 核心修复：改用反引号以支持多行默认文本
  const displayIntro = page.paragraph || `In the calculated silence of the room,
the distance is measured not in meters,
but in heartbeats.`;

  const displayMeta = page.imageLabel || '08:42 AM · CROWNE PLAZA';

  return (
    <div className="w-full h-full relative bg-white flex flex-col overflow-hidden isolate">
      
      {/* 1. 上半部分：极简序言区 (45%) */}
      <div className="h-[45%] w-full flex flex-col items-center justify-center px-24 space-y-10">
        
        {/* 章节标题：极细、极宽、全大写 */}
        <div className="w-full text-center">
          <SlideHeadline 
            page={{ ...page, title: displayTitle }}
            typography={typography}
            maxSize={12}
            minSize={10}
            weight={900}
            className="!tracking-[0.6em] !text-slate-400 !normal-case"
          />
        </div>

        {/* 序言文本：衬线斜体，居中流式 */}
        <div className="w-full max-w-lg">
          <SlideParagraph 
            page={{ ...page, paragraph: displayIntro }}
            typography={typography}
            className="!text-center !italic !leading-loose !text-slate-600 opacity-90"
            size="1.1rem"
          />
        </div>
      </div>

      {/* 2. 下半部分：沉底大图 (55%) */}
      <div className="h-[55%] w-full relative group">
        <SlideImage 
          page={page}
          className="w-full h-full"
          rounded="0"
          backgroundColor="#f1f1f1"
        />

        {/* 3. 图片内部元数据：左下角 Monospace */}
        <div className="absolute bottom-12 left-16 z-20 mix-blend-difference">
          <SlideBlockLabel 
            page={page}
            typography={typography}
            text={displayMeta}
            className="!font-mono !text-[10px] !tracking-[0.2em] !text-white !opacity-70 !border-none !p-0"
          />
        </div>

        {/* 视觉呼吸线 (可选) */}
        <div className="absolute top-0 inset-x-0 h-px bg-slate-50 z-10" />
      </div>

      {/* 装订位暗示 (左侧留白引导) */}
      <div className="absolute inset-y-0 left-0 w-8 bg-black/5 pointer-events-none z-50 opacity-0 group-hover:opacity-10 transition-opacity" />

    </div>
  );
}