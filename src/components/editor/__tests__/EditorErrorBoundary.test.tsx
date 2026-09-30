import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EditorErrorBoundary } from '../EditorErrorBoundary';

const Thrower: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

describe('EditorErrorBoundary', () => {
  it('子组件抛错时渲染降级 UI 且不清空父级', () => {
    const { container } = render(
      <div data-testid="parent">
        <EditorErrorBoundary>
          <Thrower message="boom" />
        </EditorErrorBoundary>
      </div>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    // 父级存活:未发生整树替换
    expect(container.querySelector('[data-testid="parent"]')).not.toBeNull();
  });

  it('点击 Retry 后重置错误态并尝试重新渲染子组件', () => {
    render(
      <EditorErrorBoundary>
        <Thrower message="boom" />
      </EditorErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Retry/));
    // Retry 后子组件再次抛错,Boundary 应仍能捕获并渲染降级 UI
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('key 变化时重新挂载,清空历史错误态', () => {
    const Good: React.FC = () => <div data-testid="good">ok</div>;
    const { rerender } = render(
      <EditorErrorBoundary key="p1">
        <Thrower message="boom" />
      </EditorErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <EditorErrorBoundary key="p2">
        <Good />
      </EditorErrorBoundary>
    );
    // key 变化触发重挂,Good 正常渲染
    expect(screen.getByTestId('good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
