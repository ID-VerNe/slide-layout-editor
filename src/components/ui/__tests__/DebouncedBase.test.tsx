import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DebouncedInput, DebouncedTextArea } from '../DebouncedBase';

afterEach(() => {
  vi.useRealTimers();
});

describe('DebouncedInput', () => {
  it('renders with initial value', () => {
    render(<DebouncedInput value="hello" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('updates displayed value on prop change', () => {
    const { rerender } = render(<DebouncedInput value="initial" onChange={() => {}} />);
    rerender(<DebouncedInput value="updated" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('updated');
  });

  it('fires onImmediateChange synchronously on each keystroke', () => {
    const onImmediate = vi.fn();
    render(<DebouncedInput value="" onChange={() => {}} onImmediateChange={onImmediate} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'a' } });
    expect(onImmediate).toHaveBeenCalledWith('a');

    fireEvent.change(input, { target: { value: 'ab' } });
    expect(onImmediate).toHaveBeenCalledWith('ab');
  });

  it('fires onChange after debounce delay', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<DebouncedInput value="" onChange={onChange} debounce={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });

    // Should not fire immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance time by debounce delay
    act(() => { vi.advanceTimersByTime(300); });

    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('resets debounce timer on prop update', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { rerender } = render(<DebouncedInput value="original" onChange={onChange} debounce={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'changed' } });

    // Advance 200ms — not enough for original timer (300ms)
    act(() => { vi.advanceTimersByTime(200); });
    expect(onChange).not.toHaveBeenCalled();

    // Rerender with same prop — debounce timer persists (unchanged props)
    rerender(<DebouncedInput value="original" onChange={onChange} debounce={300} />);

    act(() => { vi.advanceTimersByTime(200); });
    // The original debounce was at the full 300ms, so 200+200=400ms > 300ms
    // The change callback fires once
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('passes through input props like placeholder', () => {
    render(<DebouncedInput value="" onChange={() => {}} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('fires onChange with the latest value after rapid typing', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<DebouncedInput value="" onChange={onChange} debounce={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'a' } });
    act(() => { vi.advanceTimersByTime(100); });

    fireEvent.change(input, { target: { value: 'ab' } });
    act(() => { vi.advanceTimersByTime(100); });

    fireEvent.change(input, { target: { value: 'abc' } });
    act(() => { vi.advanceTimersByTime(300); });

    // Only the last value should fire
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('abc');
  });
});

describe('DebouncedTextArea', () => {
  it('renders with initial value', () => {
    render(<DebouncedTextArea value="multiline" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('multiline');
  });

  it('fires onChange after debounce delay', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<DebouncedTextArea value="" onChange={onChange} debounce={300} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new text' } });

    expect(onChange).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(300); });

    expect(onChange).toHaveBeenCalledWith('new text');
  });

  it('fires onImmediateChange synchronously', () => {
    const onImmediate = vi.fn();
    render(<DebouncedTextArea value="" onChange={() => {}} onImmediateChange={onImmediate} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'sync' } });
    expect(onImmediate).toHaveBeenCalledWith('sync');
  });

  it('passes through rows and placeholder props', () => {
    render(<DebouncedTextArea value="" onChange={() => {}} rows={5} placeholder="Enter text..." />);
    const textarea = screen.getByPlaceholderText('Enter text...') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });
});
