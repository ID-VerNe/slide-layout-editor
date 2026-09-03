// src/workers/fontCalculator.ts

self.onmessage = (e) => {
  const { id, text, maxSize, maxLines, minSize, containerWidth } = e.data;
  
  if (!text || !containerWidth) {
    self.postMessage({ id, fontSize: maxSize });
    return;
  }

  const charWeight = estimateTextUnitWeight(text);
  if (charWeight <= 0) {
    self.postMessage({ id, fontSize: maxSize });
    return;
  }

  // 闭式代数推导：fontSize * charWeight <= containerWidth * maxLines
  const maxAllowed = Math.floor((containerWidth * maxLines) / charWeight);
  const clampedSize = Math.max(minSize, Math.min(maxSize, maxAllowed));

  self.postMessage({ id, fontSize: clampedSize });
};

/** 计算字符总宽度权重（ASCII 0.6，CJK 1.0）*/
function estimateTextUnitWeight(text: string): number {
  let weight = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      weight += 0.6;
    } else {
      weight += 1.0;
    }
  }
  return weight;
}
