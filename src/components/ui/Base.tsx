import React from 'react';

export const Label = ({ children, icon: Icon, className = "" }: { children: React.ReactNode, icon?: any, className?: string }) => (
  <label className={`block text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${className}`}>
    {Icon && <Icon size={12} strokeWidth={3} />}
    {children}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={`w-full bg-white border border-slate-200 focus:border-slate-950 focus:ring-0 rounded-none px-3 py-2 text-xs font-bold text-slate-900 transition-all placeholder-slate-300 ${props.className || ''}`}
  />
));
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={`w-full bg-white border border-slate-200 focus:border-slate-950 focus:ring-0 rounded-none px-3 py-2 text-xs font-bold text-slate-900 transition-all placeholder-slate-300 no-scrollbar ${props.className || ''}`}
  />
));
TextArea.displayName = 'TextArea';

export const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`mb-12 last:mb-0 ${className}`}>
    {children}
  </section>
);

export const Slider = ({ label, value, min, max, step, onChange, unit = "" }: { label?: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void, unit?: string }) => (
  <div className={`grid ${label ? 'grid-cols-[120px_1fr_50px]' : 'grid-cols-[1fr_50px]'} items-center gap-4 group min-h-[32px]`}>
    {label && <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-slate-950 transition-colors truncate" title={label}>{label}</span>}
    <div className="flex items-center h-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(Number.isNaN(parsed) ? value : parsed);
        }}
        className="w-full h-[1px] bg-slate-200 appearance-none cursor-pointer accent-slate-950 hover:bg-slate-400 transition-all"
      />
    </div>
    <div className="relative flex items-center h-full">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(Number.isNaN(parsed) ? value : parsed);
        }}
        className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-950 rounded-none px-1 py-1 text-[11px] font-black font-mono text-slate-950 text-right focus:outline-none transition-all appearance-none"
      />
    </div>
  </div>
);
