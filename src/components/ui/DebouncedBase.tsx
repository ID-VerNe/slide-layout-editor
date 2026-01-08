import React, { useState, useEffect, useRef } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    if (onImmediateChange) {
      onImmediateChange(newVal);
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    if (onImmediateChange) {
      onImmediateChange(newVal);
    }
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
