// src/workers/fontCalculator.ts

self.onmessage = (e) => {
  const { text, maxSize, lineHeight, maxLines, minSize, containerWidth } = e.data;
  
  if (!text || !containerWidth) {
    self.postMessage({ fontSize: maxSize });
    return;
  }

  let fontSize = maxSize;
  let range = { min: minSize, max: maxSize };
  let retryCount = 0;
  
  // 模拟计算逻辑：基于字符估算的二分查找
  while (retryCount <= 12 && range.max - range.min > 0.5) {
    const estimatedWidth = estimateTextWidth(text, fontSize);
    const estimatedHeight = (estimatedWidth / containerWidth) * fontSize * lineHeight;
    const maxHeight = fontSize * lineHeight * maxLines;

    // 如果估算高度超过最大允许高度，或者单行估算宽度过大（假设不换行时）
    // 这里采用保守策略
    if (estimatedHeight > maxHeight || (maxLines === 1 && estimatedWidth > containerWidth)) {
      const newMax = fontSize - 0.5;
      if (newMax <= range.min) break;
      
      range.max = newMax;
      fontSize = (range.min + range.max) / 2;
    } else {
      const newMin = fontSize + 0.5;
      if (newMin > range.max) break;
      
      range.min = newMin;
      fontSize = (range.min + range.max) / 2;
    }
    
    retryCount++;
  }
  
  self.postMessage({ fontSize: Math.floor(fontSize) });
};

function estimateTextWidth(text: string, fontSize: number): number {
  // 简化的文本宽度估算：中文字符算 1 个字号，英文字符算 0.6 个字号
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      width += fontSize * 0.6;
    } else {
      width += fontSize * 1.0;
    }
  }
  return width;
}
