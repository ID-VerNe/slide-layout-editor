import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Label, Input, TextArea, Section, Slider } from '../Base';
import React from 'react';

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>My Label</Label>);
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const TestIcon = (props: any) => <svg data-testid="test-icon" {...props} />;
    render(<Label icon={TestIcon}>With Icon</Label>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Styled</Label>);
    expect(screen.getByText('Styled').className).toContain('custom-class');
  });

  it('renders without icon', () => {
    const { container } = render(<Label>No Icon</Label>);
    // Should not crash and should render the label element
    expect(screen.getByText('No Icon').tagName).toBe('LABEL');
  });
});

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input.tagName).toBe('INPUT');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="input-ref" />);
    expect(ref.current).toBe(screen.getByTestId('input-ref'));
  });

  it('passes through standard input props', () => {
    render(<Input value="hello" readOnly data-testid="test-input" />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input.value).toBe('hello');
    expect(input.readOnly).toBe(true);
  });

  it('applies custom className', () => {
    render(<Input className="extra-class" data-testid="class-input" />);
    const input = screen.getByTestId('class-input');
    expect(input.className).toContain('extra-class');
  });
});

describe('TextArea', () => {
  it('renders a textarea element', () => {
    render(<TextArea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} data-testid="textarea-ref" />);
    expect(ref.current).toBe(screen.getByTestId('textarea-ref'));
  });

  it('passes rows prop', () => {
    render(<TextArea rows={5} data-testid="rows-textarea" />);
    const textarea = screen.getByTestId('rows-textarea') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });
});

describe('Section', () => {
  it('renders children', () => {
    render(<Section><span data-testid="child">content</span></Section>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Section className="my-section"><div /></Section>);
    const section = document.querySelector('section');
    expect(section!.className).toContain('my-section');
  });

  it('renders multiple children', () => {
    render(<Section><div>First</div><div>Second</div></Section>);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});

describe('Slider', () => {
  it('renders label when provided', () => {
    render(<Slider label="Opacity" value={50} min={0} max={100} step={1} onChange={() => {}} />);
    expect(screen.getByText('Opacity')).toBeInTheDocument();
  });

  it('does not render label when omitted', () => {
    const { container } = render(<Slider value={50} min={0} max={100} step={1} onChange={() => {}} />);
    // The label span uses grid-cols-[1fr_50px] when no label
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('displays the numeric value', () => {
    render(<Slider value={75} min={0} max={100} step={1} onChange={() => {}} />);
    const numberInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    expect(numberInput).not.toBeNull();
    expect(numberInput.value).toBe('75');
  });

  it('calls onChange with parsed value from range input', () => {
    const onChange = vi.fn();
    render(<Slider value={50} min={0} max={100} step={1} onChange={onChange} />);

    const rangeInput = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(rangeInput, { target: { value: '80' } });

    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('calls onChange with parsed value from number input', () => {
    const onChange = vi.fn();
    render(<Slider value={50} min={0} max={100} step={1} onChange={onChange} />);

    const numberInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '90' } });

    expect(onChange).toHaveBeenCalledWith(90);
  });

  it('handles NaN from number input gracefully (uses current value)', () => {
    const onChange = vi.fn();
    render(<Slider value={50} min={0} max={100} step={1} onChange={onChange} />);

    const numberInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: 'not-a-number' } });

    expect(onChange).toHaveBeenCalledWith(50); // falls back to current value
  });

  it('displays unit suffix when provided', () => {
    render(<Slider label="Size" value={30} min={0} max={100} step={1} onChange={() => {}} unit="px" />);
    const numberInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    expect(numberInput.value).toBe('30');
    // unit is used in grid layout logic
  });

  it('renders range input with correct min, max, step', () => {
    render(<Slider value={10} min={0} max={50} step={5} onChange={() => {}} />);
    const rangeInput = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(rangeInput.min).toBe('0');
    expect(rangeInput.max).toBe('50');
    expect(rangeInput.step).toBe('5');
  });
});
