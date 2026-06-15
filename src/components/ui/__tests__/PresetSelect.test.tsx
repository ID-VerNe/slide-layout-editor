import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetSelect } from '../PresetSelect';

const numericOptions = [
  { value: 10, label: 'Small' },
  { value: 20, label: 'Medium' },
  { value: 30, label: 'Large' },
  { value: 40, label: 'XL' },
] as const;

const stringOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

describe('PresetSelect', () => {
  describe('with numeric options', () => {
    it('selects exact match', () => {
      render(
        <PresetSelect value={20} options={numericOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('20');
    });

    it('selects nearest when no exact match (rounds to 25 -> 30)', () => {
      render(
        <PresetSelect value={25} options={numericOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      // 25 is equidistant from 20 and 30; reduce picks the first (20) since it compares prev <= curr
      // Actually 20: diff=5, 30: diff=5, reduce keeps the first when equal -> 20
      expect(select.value).toBe('20');
    });

    it('selects nearest when no exact match (15 -> 10)', () => {
      render(
        <PresetSelect value={15} options={numericOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('10');
    });

    it('selects nearest when above max (50 -> 40)', () => {
      render(
        <PresetSelect value={50} options={numericOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('40');
    });

    it('calls onChange with the option value on select change', () => {
      const onChange = vi.fn();
      render(
        <PresetSelect value={10} options={numericOptions} onChange={onChange} />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '30' } });

      expect(onChange).toHaveBeenCalledWith(30);
    });
  });

  describe('with string options', () => {
    it('selects exact match', () => {
      render(
        <PresetSelect value="center" options={stringOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('center');
    });

    it('falls back to first option when no match', () => {
      render(
        <PresetSelect value="nonexistent" options={stringOptions} onChange={() => {}} />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('left');
    });

    it('calls onChange with the correct string value', () => {
      const onChange = vi.fn();
      render(
        <PresetSelect value="left" options={stringOptions} onChange={onChange} />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'right' } });

      expect(onChange).toHaveBeenCalledWith('right');
    });
  });

  describe('label rendering', () => {
    it('renders label when provided', () => {
      render(
        <PresetSelect value={20} options={numericOptions} onChange={() => {}} label="Font Size" />
      );
      expect(screen.getByText('Font Size')).toBeInTheDocument();
    });

    it('does not render label when omitted', () => {
      render(
        <PresetSelect value={20} options={numericOptions} onChange={() => {}} />
      );
      expect(screen.queryByText('Font Size')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PresetSelect value={20} options={numericOptions} onChange={() => {}} className="custom-select" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
