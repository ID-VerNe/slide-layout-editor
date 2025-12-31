import React, { useState, useEffect, useRef } from 'react';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({ 
  value: initialValue, 
  onChange, 
  debounce = 300, 
  ...props 
}) => {
  const [value, setValue] = useState(initialValue);
  const isMounted = useRef(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);

    return () => clearTimeout(handler);
  }, [value, debounce, onChange, initialValue]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 ${props.className || ''}`}
    />
  );
};

interface DebouncedTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({ 
  value: initialValue, 
  onChange, 
  debounce = 300, 
  ...props 
}) => {
  const [value, setValue] = useState(initialValue);
  const isMounted = useRef(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);

    return () => clearTimeout(handler);
  }, [value, debounce, onChange, initialValue]);

  return (
    <textarea
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 min-h-[100px] ${props.className || ''}`}
    />
  );
};
