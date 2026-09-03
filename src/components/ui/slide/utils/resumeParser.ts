import DOMPurify from 'dompurify';

/** Parses inline markdown syntax (links, bold, italic, code) into sanitized HTML */
export function parseResumeContent(text: string, accentColor: string = '#264376'): string {
  if (!text) return '';

  const html = text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      // 防止 javascript: 伪协议注入
      const safeUrl = String(url).trim().toLowerCase().startsWith('javascript:') ? '#' : url;
      return `<a href="${safeUrl}" class="resume-link hover:underline" data-url="${safeUrl}" style="color: ${accentColor}">${text}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-zine-primary">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-zine-accent/10 px-1 rounded-none text-[0.9em] font-mono text-zine-primary">$1</code>');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'del', 'br', 'span', 'b', 'i', 'a'],
    ALLOWED_ATTR: ['class', 'style', 'href', 'data-url']
  });
}

export interface ParsedResumeBullet {
  isBullet: boolean;
  cleanText: string;
}

/** Splits and formats multi-line description text into structured list items */
export function parseResumeDescription(text?: string): ParsedResumeBullet[] {
  if (!text) return [];

  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(trimmed => {
      const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•');
      const cleanText = isBullet ? trimmed.substring(1).trim() : trimmed;
      return { isBullet, cleanText };
    });
}
