import React, { useMemo, useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { PageData } from '../../types';
import { useStore } from '../../store/useStore';

interface AcademicHybridResumeProps {
  page: PageData;
  typography?: any;
  pageIndex?: number;
  totalPages?: number;
}

const AcademicHybridResume: React.FC<AcademicHybridResumeProps> = ({ 
  page, pageIndex = 0, totalPages = 1 
}) => {
  const theme = useStore((state) => state.theme);
  const accentColor = theme.colors.accent || '#264376';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const isNameVisible = page.visibility?.title !== false;
  const isSubtitleVisible = page.visibility?.subtitle !== false;

  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.scrollHeight;
      setIsOverflowing(height > 1754);
    }
  }, [page.resumeSections, page.title, page.subtitle]);

  const nameVariants = useMemo(() => {
    const rawName = page.title?.trim();
    if (!rawName) return [];
    const parts = rawName.split(/\s+/);
    if (parts.length < 2) return [rawName];
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const fInitial = firstName.charAt(0);
    const variants = new Set([
      rawName, [...parts].reverse().join(' '),
      `${fInitial}. ${lastName}`, `${lastName}, ${fInitial}.`, `${lastName} ${fInitial}.`,
    ]);
    return Array.from(variants).sort((a, b) => b.length - a.length);
  }, [page.title]);

  const parseContent = (text: string) => {
    let html = text
      // 1. 链接支持 [Text](URL) -> 核心修复：添加 resume-link 类名供 PDF 导出引擎识别
      .replace(/.*\[(.*?)\].*\((.*?)\)/g, '<a href="$2" class="resume-link text-[#264376] hover:underline" data-url="$2">$1</a>')
      // 2. 基础格式化
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-950">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded text-[0.9em] font-mono">$1</code>');

    // 3. 姓名高亮
    if (nameVariants.length > 0) {
      const escapedVariants = nameVariants.map(v => v.replace(/[.*+?^${}()|[\\]/g, '\\$&'));
      const namePattern = new RegExp(`(${escapedVariants.join('|')})`, 'gi');
      html = html.replace(/<[^>]+>|([^<]+)/g, (match, textContent) => {
        if (match.startsWith('<')) return match;
        return textContent.replace(namePattern, (nameMatch: string) => 
          `<strong class="font-extrabold text-slate-900 border-b-[1.5px] border-slate-300 pb-[0.5px]">${nameMatch}</strong>`
        );
      });
    }

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['strong', 'em', 'code', 'del', 'br', 'span', 'b', 'i', 'a'],
      ALLOWED_ATTR: ['class', 'style', 'href', 'data-url']
    });
  };

  const renderDescription = (text?: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <ul className="space-y-2 mt-3">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•');
          const cleanText = isBullet ? trimmed.substring(1).trim() : trimmed;
          return (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-justify leading-relaxed">
              {isBullet && <div className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />}
              <span style={{ fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: parseContent(cleanText) }} />
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full p-[60px] flex flex-col bg-white text-slate-800 transition-all duration-500 relative
        ${isOverflowing ? 'ring-8 ring-red-500/20' : ''}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {isOverflowing && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase z-[100]">Content Overflow!</div>}

      {(isNameVisible || isSubtitleVisible) && (
        <header className="mb-12 flex flex-col items-center text-center">
          {isNameVisible && page.title && <h1 className="font-black tracking-tighter uppercase mb-4" style={{ fontSize: '38px', color: theme.colors.primary }}>{page.title}</h1>}
          {isSubtitleVisible && page.subtitle && (
            <div className="font-bold text-slate-500 uppercase tracking-widest leading-relaxed whitespace-pre-line" style={{ fontSize: '11px' }}>
              {/* 这里手动识别并转换 Header 里的链接 (如 GitHub) */}
              <span dangerouslySetInnerHTML={{ __html: parseContent(page.subtitle) }} />
            </div>
          )}
        </header>
      )}

      <div className="flex-1 space-y-12">
        {(page.resumeSections || []).map((section) => (
          <Section key={section.id} title={section.title} accent={accentColor}>
            <div className="space-y-8">
              {section.items.map((item) => (
                <div key={item.id} className="group">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-black text-slate-900 uppercase tracking-tight" style={{ fontSize: '14px' }}>{item.title}</span>
                    <span className="font-black text-slate-400 tabular-nums uppercase" style={{ fontSize: '11px' }}>{item.time}</span>
                  </div>
                  {(item.subtitle || item.location) && (
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="font-bold italic text-slate-600 underline decoration-slate-100 underline-offset-4" style={{ fontSize: '12px' }}>{item.subtitle}</span>
                      <span className="font-bold text-slate-300 uppercase tracking-[0.15em]" style={{ fontSize: '10px' }}>{item.location}</span>
                    </div>
                  )}
                  {renderDescription(item.description)}
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>

      <footer className="mt-auto pt-8 flex justify-between items-center opacity-20 text-[10px] uppercase font-black tracking-[0.4em]">
        <span>CV — {page.title || 'NAME'}</span>
        <span className="bg-slate-900 text-white px-2 py-0.5 rounded-sm tabular-nums">Page {String(pageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
      </footer>
    </div>
  );
};

const Section = ({ title, accent, children }: any) => (
  <section className="space-y-6"><div className="flex items-center gap-5"><h3 className="font-black uppercase tracking-[0.3em] whitespace-nowrap" style={{ fontSize: '16px', color: accent }}>{title}</h3><div className="h-[2px] w-full bg-slate-100" /></div>{children}</section>
);

export default AcademicHybridResume;