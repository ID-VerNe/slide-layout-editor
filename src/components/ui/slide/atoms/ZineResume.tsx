import React from 'react';
import { PageData, DesignSystem, ProjectTheme } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { parseResumeContent, parseResumeDescription } from '../utils/resumeParser';

interface ZineResumeProps {
  page: PageData;
  className?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  [key: string]: any;
}

/**
 * ZineResume - 简历原子组件
 * 纯视图组件，渲染逻辑与 Markdown 语法解析彻底解耦 (SRP)
 */
export const ZineResume: React.FC<ZineResumeProps> = ({ 
  page, 
  className = "", 
  style: customStyle,
  designSystem: propsDs,
  theme: propsTheme,
  ...otherProps 
}) => {
  const storeTheme = useStore((state) => state.theme);
  const theme = propsTheme || storeTheme;
  
  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey: 'resume',
    props: otherProps,
    customStyle,
    className: `zine-resume ${className}`
  });

  const accentColor = style.color || theme.colors.accent || '#264376';

  const finalContainerStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    ...style,
  };

  const renderDescription = (text?: string) => {
    const bullets = parseResumeDescription(text);
    if (bullets.length === 0) return null;

    return (
      <ul className="space-y-2 mt-4">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-4 text-zine-secondary text-justify leading-[16px] mb-2 font-zine-body">
            {bullet.isBullet && <div className="mt-1.5 w-1 h-1 shrink-0" style={{ backgroundColor: accentColor }} />}
            <span
              className="text-[11px] tracking-tight"
              dangerouslySetInnerHTML={{ __html: parseResumeContent(bullet.cleanText, accentColor) }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col gap-16 overflow-y-auto no-scrollbar py-2 ${resolvedClassName}`} style={finalContainerStyle}>
      {(page.resumeSections || []).map((section) => (
        <section key={section.id} className="space-y-8">
          <div className="flex items-center gap-6">
            <h3 className="font-black uppercase tracking-[0.4em] whitespace-nowrap text-[14px] font-zine-sans" style={{ color: accentColor }}>
              {section.title}
            </h3>
            <div className="h-[1px] w-full bg-zine-accent/15" />
          </div>
          <div className="space-y-12 pl-1">
            {section.items.map((item) => (
              <div key={item.id} className="group">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-black text-zine-primary uppercase tracking-tight text-[13px] font-zine-sans">{item.title}</span>
                  <span className="font-black text-zine-secondary/60 tabular-nums uppercase text-[10px] font-zine-sans">{item.time}</span>
                </div>
                {(item.subtitle || item.location) && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-bold italic text-zine-secondary text-[11px] font-zine-serif">{item.subtitle}</span>
                    <span className="font-black text-zine-secondary/40 uppercase tracking-[0.2em] text-[9px] font-zine-sans">{item.location}</span>
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
