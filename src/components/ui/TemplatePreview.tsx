import React, { useMemo } from 'react';
import { AspectRatioType, LAYOUT_CONFIG } from '../../constants/layout';
import { TEMPLATES } from '../../templates/registry';

interface TemplatePreviewProps {
  layoutId: string;
  aspectRatio: AspectRatioType;
  className?: string;
}

/**
 * TemplatePreview 6.0 - 自动化蓝图渲染引擎
 * 原理：直接实例化真实模板组件，通过 CSS 强行进行“蓝图化”处理。
 * 优势：100% 还原真实排版，新增模板无需手动编写预览。
 */
export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ layoutId, aspectRatio, className = "" }) => {
  // 1. 获取模板配置
  const template = useMemo(() => TEMPLATES.find(t => t.id === layoutId), [layoutId]);
  const config = LAYOUT_CONFIG[aspectRatio] || LAYOUT_CONFIG['16:9'];

  // 2. 构造 Mock 数据，确保组件渲染“饱满”
  const mockPage = useMemo(() => ({
    id: 'mock',
    layoutId,
    aspectRatio,
    title: 'LOREM IPSUM HEADLINE',
    subtitle: 'Dolor sit amet consectetur',
    paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    image: 'mock',
    gallery: ['mock', 'mock', 'mock'],
    bullets: ['Feature Point One', 'Feature Point Two', 'Feature Point Three'],
    features: [{ title: 'F1', desc: 'Desc' }, { title: 'F2', desc: 'Desc' }],
    metrics: [{ label: 'Metric', value: '100%' }],
    mosaic: [{ icon: 'Box' }, { icon: 'Box' }],
    backgroundColor: '#ffffff',
    accentColor: '#2a4a82',
    visibility: { logo: true },
    // 简历专用 Mock
    resumeSections: [
      { title: 'EXPERIENCE', items: [{ title: 'Job', subtitle: 'Company', date: '2020', description: 'desc' }] },
      { title: 'EDUCATION', items: [{ title: 'Degree', subtitle: 'Uni', date: '2018', description: 'desc' }] }
    ]
  }), [layoutId, aspectRatio]);

  if (!template) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />;

  // 3. 计算缩放比例 (将几千像素的真实页面缩小到 200px 左右)
  const scale = 200 / Math.max(config.width, config.height);

  return (
    <div className={`aspect-square w-full bg-white rounded-[2rem] overflow-hidden flex items-center justify-center p-0 border-2 border-slate-100 group-hover:border-[#2a4a82]/30 group-hover:shadow-2xl transition-all duration-500 relative ${className}`}>
      
      {/* 缩放容器：将真实组件包裹在内 */}
      <div 
        style={{
          width: config.width,
          height: config.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
        className="wireframe-mode shadow-sm"
      >
        <template.component page={mockPage} />
      </div>

      {/* 遮罩层：防止预览图内部产生滚动或点击交互 */}
      <div className="absolute inset-0 z-10" />
    </div>
  );
};
