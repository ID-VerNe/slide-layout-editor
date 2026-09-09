import { breakLines, adjustmentRatios, MaxAdjustmentExceededError, InputItem, Box, Penalty, Glue, MIN_COST, MAX_COST } from 'tex-linebreak';

export interface KPWorkerRequest {
  id: number;
  text: string;
  fontFamily: string;
  maxSize: number;
  minSize: number;
  lineHeight: number;
  maxLines: number;
  containerWidth: number;
  align: 'left' | 'center' | 'right' | 'justify';
}

export interface KPLine {
  text: string;
  boxW: number;
  ratio: number;
  last: boolean;
}

export interface KPWorkerResponse {
  id: number;
  fontSize: number;
  lines: KPLine[];
  success: boolean;
}

// Reuse the canvas context to avoid overhead
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

function getContext(): OffscreenCanvasRenderingContext2D {
  if (!canvas || !ctx) {
    canvas = new OffscreenCanvas(1, 1);
    ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  }
  return ctx;
}

function measureText(text: string, font: string): number {
  const c = getContext();
  c.font = font;
  return c.measureText(text).width;
}

// We use Intl.Segmenter for robust CJK word boundaries.
const segmenter = new Intl.Segmenter('en', { granularity: 'word' });

function box(width: number, text: string): Box & { text: string } {
  return { type: 'box', width, text };
}

function glue(width: number, stretch: number, shrink: number): Glue {
  return { type: 'glue', width, stretch, shrink };
}

function penalty(width: number, cost: number, flagged: boolean): Penalty {
  return { type: 'penalty', width, cost, flagged };
}

/**
 * Tokenize string into tex-linebreak Items
 */
function createItems(text: string, font: string): InputItem[] {
  const items: InputItem[] = [];
  const spaceWidth = measureText(' ', font);
  
  const segments = Array.from(segmenter.segment(text));

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (seg.isWordLike) {
      items.push(box(measureText(seg.segment, font), seg.segment));

      const nextSeg = segments[i + 1];
      if (nextSeg && nextSeg.isWordLike) {
        const isCJK = /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(seg.segment) || 
                      /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(nextSeg.segment);
        if (isCJK) {
          items.push(penalty(0, 0, false));
        }
      }
    } else {
      if (seg.segment.trim() === '') {
        items.push(glue(spaceWidth, spaceWidth * 0.5, spaceWidth * 0.33));
      } else {
        items.push(box(measureText(seg.segment, font), seg.segment));
        const nextSeg = segments[i + 1];
        if (nextSeg && nextSeg.segment.trim() !== '') {
          items.push(penalty(0, 50, false)); 
        }
      }
    }
  }

  items.push(glue(0, 100000, 0));
  items.push(penalty(0, MIN_COST, true)); // force break

  return items;
}

function attemptLayout(
  text: string,
  fontSize: number,
  fontFamily: string,
  containerWidth: number
): { lines: KPLine[]; maxRatio: number; lineCount: number } | null {
  const font = `${fontSize}px ${fontFamily}`;
  const items = createItems(text, font);

  try {
    const breakpoints = breakLines(items, containerWidth, {
      maxAdjustmentRatio: 3.0, 
      doubleHyphenPenalty: 10000
    });

    const ratios = adjustmentRatios(items, containerWidth, breakpoints);

    let lineCount = 0;
    const kpLines: KPLine[] = [];
    
    let start = 0;
    let maxRatioFound = 0;

    for (let i = 0; i < breakpoints.length; i++) {
      const bp = breakpoints[i];
      const ratio = ratios[i] || 0;
      if (Math.abs(ratio) > maxRatioFound) maxRatioFound = Math.abs(ratio);

      const lineItems = items.slice(start, bp + 1);
      
      let lineText = '';
      let boxW = 0;
      let isLast = i === breakpoints.length - 1;

      for (let j = 0; j < lineItems.length; j++) {
        const item = lineItems[j];
        if (item.type === 'box') {
          lineText += (item as any).text || '';
          boxW += item.width;
        } else if (item.type === 'glue') {
          if (!isLast || j !== lineItems.length - 2) { 
             lineText += ' '; 
          }
        }
      }

      lineText = lineText.trim();
      if (lineText) {
        kpLines.push({
          text: lineText,
          boxW,
          ratio: ratio,
          last: isLast
        });
        lineCount++;
      }
      start = bp + 1;
    }

    return {
      lines: kpLines,
      maxRatio: maxRatioFound,
      lineCount
    };
  } catch (e) {
    if (e instanceof MaxAdjustmentExceededError) {
      return null;
    }
    return null;
  }
}

self.onmessage = (e: MessageEvent<KPWorkerRequest>) => {
  const req = e.data;
  
  if (!req.text || !req.containerWidth) {
    self.postMessage({ id: req.id, fontSize: req.maxSize, lines: [], success: false });
    return;
  }

  let bestSize = req.minSize;
  let bestLines: KPLine[] = [];
  let bestMaxRatio = Infinity;

  let low = req.minSize;
  let high = req.maxSize;
  let hasFoundFit = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const result = attemptLayout(req.text, mid, req.fontFamily, req.containerWidth);

    if (result && result.lineCount <= req.maxLines) {
      hasFoundFit = true;
      if (result.maxRatio < bestMaxRatio || mid > bestSize) {
        bestSize = mid;
        bestLines = result.lines;
        bestMaxRatio = result.maxRatio;
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (!hasFoundFit) {
    bestSize = req.minSize;
    const fallback = attemptLayout(req.text, req.minSize, req.fontFamily, req.containerWidth);
    if (fallback) {
      bestLines = fallback.lines;
    }
  }

  self.postMessage({
    id: req.id,
    fontSize: bestSize,
    lines: bestLines,
    success: hasFoundFit
  });
};
