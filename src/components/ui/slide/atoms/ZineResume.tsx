import React from 'react';
import { PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import DOMPurify from 'dompurify';
import { useModularStyle } from '../hooks/useModularStyle';

/**
 * ZineResume - 简历原子组件
 * 封装了 AcademicHybridResume 的核心渲染逻辑，使其可在 JSON Schema 中作为原子使用。
 */
export const ZineResume: React.FC<{ page: PageData; [key: string]: any }> = ({ 
  page, 
  className = "", 
  style: customStyle,
  ...otherProps 
}) => {
  const theme = useStore((state) => state.theme);
  
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey: 'resume',
    props: otherProps,
    customStyle,
    className: `zine-resume ${className}`
  });

  const accentColor = style.color || theme.colors.accent || '#264376';

  const parseContent = (text: string) => {
    let html = text
      .replace(/.*\[(.*?)\].*\((.*?)\)/g, `<a href="$2" class="resume-link hover:underline" data-url="$2" style="color: ${accentColor}">$1</a>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-950">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded-none text-[0.9em] font-mono">$1</code>');

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['strong', 'em', 'code', 'del', 'br', 'span', 'b', 'i', 'a'],
      ALLOWED_ATTR: ['class', 'style', 'href', 'data-url']
    });
  };

  const renderDescription = (text?: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <ul className="space-y-2 mt-4">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•');
          const cleanText = isBullet ? trimmed.substring(1).trim() : trimmed;
          return (
            <li key={i} className="flex items-start gap-4 text-slate-600 text-justify leading-[16px] mb-2 font-zine-body">
              {isBullet && <div className="mt-1.5 w-1 h-1 shrink-0" style={{ backgroundColor: accentColor }} />}
              <span className="text-[11px] tracking-tight" dangerouslySetInnerHTML={{ __html: parseContent(cleanText) }} />
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col gap-16 overflow-y-auto no-scrollbar py-2 ${resolvedClassName}`} style={style}>
      {(page.resumeSections || []).map((section) => (
        <section key={section.id} className="space-y-8">
          <div className="flex items-center gap-6">
            <h3 className="font-black uppercase tracking-[0.4em] whitespace-nowrap text-[14px] font-zine-sans" style={{ color: accentColor }}>
              {section.title}
            </h3>
            <div className="h-[1px] w-full bg-slate-950/10" />
          </div>
          <div className="space-y-12 pl-1">
            {section.items.map((item) => (
              <div key={item.id} className="group">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-black text-slate-950 uppercase tracking-tight text-[13px] font-zine-sans">{item.title}</span>
                  <span className="font-black text-slate-400 tabular-nums uppercase text-[10px] font-zine-sans">{item.time}</span>
                </div>
                {(item.subtitle || item.location) && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-bold italic text-slate-500 text-[11px] font-zine-serif">{item.subtitle}</span>
                    <span className="font-black text-slate-300 uppercase tracking-[0.2em] text-[9px] font-zine-sans">{item.location}</span>
                  </div>
                )}
                {renderDescription(item.description)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ZineResume;
