import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VirtualScrollContainer from '../VirtualScrollContainer';
import React from 'react';

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize, getScrollElement, overscan }: any) => {
    // Simulate virtual items based on count
    const items = Array.from({ length: count }, (_, i) => ({
      key: i,
      index: i,
      start: i * estimateSize(),
      end: (i + 1) * estimateSize(),
      size: estimateSize(),
      lane: 0,
    }));

    return {
      getVirtualItems: () => items,
      getTotalSize: () => count * estimateSize(),
    };
  },
}));

describe('VirtualScrollContainer', () => {
  const defaultRenderItem = (index: number, style: React.CSSProperties) => (
    <div data-testid={`item-${index}`} style={style}>
      Item {index}
    </div>
  );

  it('renders a scrollable container with ref', () => {
    const { container } = render(
      <VirtualScrollContainer
        itemCount={10}
        itemHeight={50}
        gap={10}
        renderItem={defaultRenderItem}
      />
    );
    // The outer div should have overflow-y-auto
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).toContain('overflow-y-auto');
  });

  it('renders the correct number of virtual items', () => {
    render(
      <VirtualScrollContainer
        itemCount={5}
        itemHeight={50}
        gap={10}
        renderItem={defaultRenderItem}
      />
    );
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
    }
  });

  it('renders items with correct height style', () => {
    render(
      <VirtualScrollContainer
        itemCount={3}
        itemHeight={100}
        gap={0}
        renderItem={defaultRenderItem}
      />
    );
    const item = screen.getByTestId('item-0');
    expect(item.style.height).toBe('100px');
  });

  it('sets total container height based on item count', () => {
    const { container } = render(
      <VirtualScrollContainer
        itemCount={4}
        itemHeight={60}
        gap={20}
        renderItem={defaultRenderItem}
      />
    );
    // The inner positioned div should have total height
    const innerDiv = container.querySelector('[style*="position: relative"]') as HTMLElement;
    // estimateSize = itemHeight + gap = 80, count = 4 => total = 320
    expect(innerDiv.style.height).toBe('320px');
  });

  it('applies custom className', () => {
    const { container } = render(
      <VirtualScrollContainer
        itemCount={1}
        itemHeight={50}
        gap={10}
        renderItem={defaultRenderItem}
        className="custom-scroll"
      />
    );
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).toContain('custom-scroll');
  });

  it('positions items absolutely with translateY', () => {
    const { container } = render(
      <VirtualScrollContainer
        itemCount={2}
        itemHeight={50}
        gap={10}
        renderItem={defaultRenderItem}
      />
    );
    const items = container.querySelectorAll('[style*="position: absolute"]');
    expect(items.length).toBe(2);
    // First item should be at start=0, second at start=60 (50+10 gap)
    const firstItem = items[0] as HTMLElement;
    const secondItem = items[1] as HTMLElement;
    expect(firstItem.style.transform).toContain('translateY(0px)');
    expect(secondItem.style.transform).toContain('translateY(60px)');
  });

  it('renders no items when count is 0', () => {
    render(
      <VirtualScrollContainer
        itemCount={0}
        itemHeight={50}
        gap={10}
        renderItem={defaultRenderItem}
      />
    );
    expect(screen.queryByTestId('item-0')).not.toBeInTheDocument();
  });
});