import { describe, it, expect } from 'vitest';
import {
  calculateCoverBounds,
  resolveSafePanOffset,
  parseSlideAspectRatio,
  getContainerAspectRatioFromPage,
} from '../imageGeometry';

describe('imageGeometry', () => {
  describe('calculateCoverBounds', () => {
    it('处理无效或零尺寸时返回空边界', () => {
      const bounds = calculateCoverBounds(0, 100, 200, 200);
      expect(bounds.canMoveHoriz).toBe(false);
      expect(bounds.canMoveVert).toBe(false);
      expect(bounds.maxShiftX).toBe(0);
    });

    it('横向图片放在正方形容器中：纵向无法移动，横向可安全移动', () => {
      // 容器 100x100 (ratio 1)，图片 200x100 (ratio 2)
      // 在 scale=1 时，图片渲染尺寸为 200x100，高度正好满，宽度两侧各溢出 50px
      const bounds = calculateCoverBounds(100, 100, 200, 100, 1);
      expect(bounds.canMoveVert).toBe(false);
      expect(bounds.maxShiftY).toBe(0);
      expect(bounds.canMoveHoriz).toBe(true);
      expect(bounds.maxShiftX).toBe(50);
    });

    it('纵向图片放在正方形容器中：横向无法移动，纵向可安全移动', () => {
      // 容器 100x100 (ratio 1)，图片 100x200 (ratio 0.5)
      // 在 scale=1 时，图片渲染尺寸为 100x200，宽度正好满，高度上下各溢出 50px
      const bounds = calculateCoverBounds(100, 100, 100, 200, 1);
      expect(bounds.canMoveHoriz).toBe(false);
      expect(bounds.maxShiftX).toBe(0);
      expect(bounds.canMoveVert).toBe(true);
      expect(bounds.maxShiftY).toBe(50);
    });

    it('比例完全一致的图片在 scale=1 时两个方向均无法移动', () => {
      const bounds = calculateCoverBounds(100, 100, 100, 100, 1);
      expect(bounds.canMoveHoriz).toBe(false);
      expect(bounds.canMoveVert).toBe(false);
      expect(bounds.maxShiftX).toBe(0);
      expect(bounds.maxShiftY).toBe(0);
    });

    it('放大 scale > 1 后两个方向均自动解锁', () => {
      const bounds = calculateCoverBounds(100, 100, 100, 100, 1.5);
      expect(bounds.canMoveHoriz).toBe(true);
      expect(bounds.canMoveVert).toBe(true);
      expect(bounds.maxShiftX).toBe(25);
      expect(bounds.maxShiftY).toBe(25);
    });
  });

  describe('resolveSafePanOffset', () => {
    it('当无法移动时强制位移为 0', () => {
      const bounds = {
        maxShiftX: 0,
        maxShiftY: 0,
        canMoveHoriz: false,
        canMoveVert: false,
        scaledWidth: 100,
        scaledHeight: 100,
      };
      const offset = resolveSafePanOffset(80, -50, bounds);
      expect(offset.shiftX).toBe(0);
      expect(offset.shiftY).toBe(0);
    });

    it('将 [-100, 100] 映射并截断在 [-maxShift, maxShift] 物理区间', () => {
      const bounds = {
        maxShiftX: 50,
        maxShiftY: 30,
        canMoveHoriz: true,
        canMoveVert: true,
        scaledWidth: 200,
        scaledHeight: 160,
      };
      // configX = 100 -> +50px
      expect(resolveSafePanOffset(100, 0, bounds).shiftX).toBe(50);
      // configX = -100 -> -50px
      expect(resolveSafePanOffset(-100, 0, bounds).shiftX).toBe(-50);
      // configX = 50 -> +25px
      expect(resolveSafePanOffset(50, 0, bounds).shiftX).toBe(25);
      // 超出范围时截断保护
      expect(resolveSafePanOffset(200, 0, bounds).shiftX).toBe(50);
    });
  });

  describe('parseSlideAspectRatio', () => {
    it('正确解析幻灯片宽高比', () => {
      expect(parseSlideAspectRatio('16:9')).toBeCloseTo(16 / 9);
      expect(parseSlideAspectRatio('3:4')).toBeCloseTo(3 / 4);
      expect(parseSlideAspectRatio('1:1')).toBe(1);
    });
  });

  describe('getContainerAspectRatioFromPage', () => {
    it('从模板中读取 modular 网格并计算容器宽高比', () => {
      const mockPage: any = {
        layoutId: 'bilingual-cover',
        aspectRatio: '3:4',
      };
      // bilingual-cover 中 image 的 modular 为 colSpan: 19, rowSpan: 12
      // 容器比率 = (19 / 12) * (3 / 4) = 19 / 16 = 1.1875
      const ratio = getContainerAspectRatioFromPage(mockPage, 'image');
      expect(ratio).toBeCloseTo(1.1875);
    });
  });
});
