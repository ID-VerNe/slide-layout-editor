import { FreeformItem } from '../types/freeform.types';

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  length: number; // 视觉长度（用于画线）
  start: number;  // 线条起始位置
}

interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

/**
 * 计算吸附后的坐标和辅助线
 * @param activeItem 当前正在拖拽/调整的组件（包含新的预测坐标）
 * @param otherItems 画布上的其他组件
 * @param threshold 吸附阈值（像素）
 */
export function calculateSnapping(
  activeItem: FreeformItem,
  otherItems: FreeformItem[],
  threshold: number = 5
): SnapResult {
  let { x, y, width, height } = activeItem;
  const guides: AlignmentGuide[] = [];

  // 关键点：左、中、右
  const xPoints = [x, x + width / 2, x + width];
  // 关键点：上、中、下
  const yPoints = [y, y + height / 2, y + height];

  let snappedX = x;
  let snappedY = y;
  let snapXDiff = Infinity;
  let snapYDiff = Infinity;

  otherItems.forEach((target) => {
    const targetXPoints = [target.x, target.x + target.width / 2, target.x + target.width];
    const targetYPoints = [target.y, target.y + target.height / 2, target.y + target.height];

    // --- 水平吸附 (调整 X) ---
    // 比较 active 的左/中/右 与 target 的左/中/右
    xPoints.forEach((activeX, activeIdx) => {
      targetXPoints.forEach((targetX, targetIdx) => {
        const diff = Math.abs(activeX - targetX);
        if (diff < threshold && diff < Math.abs(snapXDiff)) {
          snapXDiff = targetX - activeX; // 需要移动的距离
          
          // 根据是哪个点吸附，反推 x 的位置
          // activeIdx: 0=Left, 1=Center, 2=Right
          let newX = targetX;
          if (activeIdx === 1) newX = targetX - width / 2;
          if (activeIdx === 2) newX = targetX - width;
          
          snappedX = newX;
          
          // 生成垂直辅助线
          guides.push({
            type: 'vertical',
            position: targetX,
            start: Math.min(y, target.y),
            length: Math.max(y + height, target.y + target.height) - Math.min(y, target.y)
          });
        }
      });
    });

    // --- 垂直吸附 (调整 Y) ---
    yPoints.forEach((activeY, activeIdx) => {
      targetYPoints.forEach((targetY, targetIdx) => {
        const diff = Math.abs(activeY - targetY);
        if (diff < threshold && diff < Math.abs(snapYDiff)) {
          snapYDiff = targetY - activeY;

          let newY = targetY;
          if (activeIdx === 1) newY = targetY - height / 2;
          if (activeIdx === 2) newY = targetY - height;

          snappedY = newY;

          // 生成水平辅助线
          guides.push({
            type: 'horizontal',
            position: targetY,
            start: Math.min(x, target.x),
            length: Math.max(x + width, target.x + target.width) - Math.min(x, target.x)
          });
        }
      });
    });
  });

  // 如果没有吸附，保持原值；如果有吸附，返回吸附值
  // 注意：这里简单的逻辑只支持最近的一个吸附。
  // 实际上 guides 数组可能包含多余的线，通常我们只保留产生吸附的那根。
  // 为了简化，上面的循环可能会产生多条线，UI 层需要过滤只显示当前生效的。
  
  // 修正：我们只应用最小的位移
  if (snapXDiff !== Infinity) {
    x = snappedX;
  }
  if (snapYDiff !== Infinity) {
    y = snappedY;
  }

  // 过滤 guides: 只保留经过我们最终 x 或 y 的线
  const activeGuides = guides.filter(g => {
    if (g.type === 'vertical') return Math.abs(g.position - x) < 1 || Math.abs(g.position - (x + width/2)) < 1 || Math.abs(g.position - (x + width)) < 1;
    if (g.type === 'horizontal') return Math.abs(g.position - y) < 1 || Math.abs(g.position - (y + height/2)) < 1 || Math.abs(g.position - (y + height)) < 1;
    return false;
  });

  return { x, y, guides: activeGuides };
}