import React from 'react';

export const Label = ({ children, icon: Icon, className = "" }: { children: React.ReactNode, icon?: any, className?: string }) => (
  <label className={`block text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-3 ${className}`}>
    {Icon && <Icon size={12} />}
    {children}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 ${props.className || ''}`}
  />
));
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={`w-full bg-slate-50 border-transparent focus:border-[#264376] focus:bg-white focus:ring-2 focus:ring-[#264376]/20 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition-all placeholder-slate-400 ${props.className || ''}`}
  />
));
TextArea.displayName = 'TextArea';

export const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`space-y-4 ${className}`}>
    {children}
  </section>
);

export const Slider = ({ label, value, min, max, step, onChange, unit = "" }: { label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void, unit?: string }) => (
  <div className="grid grid-cols-[110px_1fr_44px] items-center gap-2 group min-h-[24px]">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors truncate" title={label}>{label}</span>
    <div className="flex items-center h-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#264376] hover:brightness-110 transition-all"
      />
    </div>
    <div className="relative flex items-center h-full">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 focus:bg-white focus:border-[#264376] focus:ring-1 focus:ring-[#264376]/10 rounded px-1 py-0.5 text-[10px] font-bold font-mono text-slate-900 text-right focus:outline-none transition-all appearance-none" 
      />
    </div>
  </div>
);
