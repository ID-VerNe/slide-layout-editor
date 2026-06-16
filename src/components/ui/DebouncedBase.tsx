import React from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onImmediateChange?: (value: string) => void;
  debounce?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value: initialValue,
  onChange,
  onImmediateChange,
  debounce = 300,
  ...props
}) => {
  const [value, setValue] = useDebouncedValue(
    initialValue,
    onChange,
    debounce,
    onImmediateChange,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 ${props.className || ''}`}
    />
  );
};

interface DebouncedTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onImmediateChange?: (value: string) => void;
  debounce?: number;
}

export const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  value: initialValue,
  onChange,
  onImmediateChange,
  debounce = 300,
  ...props
}) => {
  const [value, setValue] = useDebouncedValue(
    initialValue,
    onChange,
    debounce,
    onImmediateChange,
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <textarea
      {...props}
      value={value}
      onChange={handleChange}
      className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 min-h-[100px] ${props.className || ''}`}
    />
  );
};
