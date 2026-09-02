import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontSelect } from '../FontSelect';

const mockFonts = [
  { id: 'font-1', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'font-2', name: 'Playfair Display', family: "'Playfair Display', serif" },
];

describe('FontSelect', () => {
  it('renders with a value selected', () => {
    render(
      <FontSelect
        value="'Inter', sans-serif"
        onChange={() => {}}
        customFonts={mockFonts}
      />
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe("'Inter', sans-serif");
  });

  it('renders label when not compact and label provided', () => {
    render(
      <FontSelect
        value=""
        onChange={() => {}}
        customFonts={mockFonts}
        label="Headline Font"
      />
    );
    expect(screen.getByText('Headline Font')).toBeInTheDocument();
  });

  it('does not render label in compact mode even when label provided', () => {
    render(
      <FontSelect
        value=""
        onChange={() => {}}
        customFonts={mockFonts}
        label="Headline Font"
        compact
      />
    );
    expect(screen.queryByText('Headline Font')).not.toBeInTheDocument();
  });

  it('calls onChange with new value on selection', () => {
    const onChange = vi.fn();
    render(
      <FontSelect
        value=""
        onChange={onChange}
        customFonts={mockFonts}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: "'Inter', sans-serif" } });

    expect(onChange).toHaveBeenCalledWith("'Inter', sans-serif");
  });

  it('renders with first option when value is empty string', () => {
    render(
      <FontSelect
        value=""
        onChange={() => {}}
        customFonts={mockFonts}
      />
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    // HTML select defaults to first option when value doesn't match
    expect(select.value).toBeTruthy();
  });

  it('applies compact class', () => {
    const { container } = render(
      <FontSelect
        value=""
        onChange={() => {}}
        customFonts={mockFonts}
        compact
      />
    );
    const select = container.querySelector('select');
    expect(select?.className).toContain('py-1');
  });

  it('applies default non-compact class', () => {
    const { container } = render(
      <FontSelect
        value=""
        onChange={() => {}}
        customFonts={mockFonts}
      />
    );
    const select = container.querySelector('select');
    expect(select?.className).toContain('py-2.5');
  });

  it('正确渲染 customFonts 选项组', () => {
    const customList = [
      { name: 'MyHandwriting', family: 'custom-handwriting-123' },
      { name: 'CorporateSans', family: 'custom-corp-456' },
    ];
    render(
      <FontSelect
        value="custom-handwriting-123"
        onChange={() => {}}
        customFonts={customList}
      />
    );
    expect(screen.getByText('MyHandwriting')).toBeInTheDocument();
    expect(screen.getByText('CorporateSans')).toBeInTheDocument();
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('custom-handwriting-123');
  });

  it('支持字体名称规范化匹配（无引号或不同 fallback）', () => {
    render(
      <FontSelect
        value="Playfair Display"
        onChange={() => {}}
        customFonts={[]}
      />
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe("'Playfair Display', serif");
  });
});

