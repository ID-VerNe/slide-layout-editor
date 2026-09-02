import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Image } from '../Image';
import React from 'react';

describe('Image Component', () => {
  it('渲染基本图片元素并应用安全缩放', () => {
    render(
      <Image
        url="https://example.com/test.jpg"
        config={{ scale: 1.2, x: 0, y: 0 }}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/test.jpg');
    // 默认 cover 模式
    expect(img.style.objectFit).toBe('cover');
  });

  it('包含模式（contain）下允许缩放到 0.05', () => {
    render(
      <Image
        url="https://example.com/logo.png"
        config={{ scale: 0.1, x: 20, y: 10 }}
        style={{ objectFit: 'contain' }}
      />
    );
    const img = screen.getByRole('img');
    expect(img.style.objectFit).toBe('contain');
    expect(img.style.transform).toContain('scale(0.1)');
  });

  it('Cover 模式下 scale 强制不小于 1', () => {
    render(
      <Image
        url="https://example.com/photo.jpg"
        config={{ scale: 0.5, x: 0, y: 0 }}
      />
    );
    const img = screen.getByRole('img');
    expect(img.style.transform).toContain('scale(1)');
  });
});
