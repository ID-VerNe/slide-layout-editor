import React from 'react';
import { PageData, TestimonialData, CustomFont } from '../../../types';
import { Eye, EyeOff, MessageSquare, Plus, X, User } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Label, Input, TextArea } from '../../ui/Base';
import IconPicker from '../../ui/IconPicker';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

export const TestimonialsField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
  const isVisible = page.visibility?.testimonials !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), testimonials: !isVisible }
    });
  };

  const handleTestimonialChange = (index: number, field: keyof TestimonialData, value: string) => {
    const newTestimonials = [...(page.testimonials || [])];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onUpdate({ ...page, testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    const current = page.testimonials || [];
    if (current.length >= 8) return;
    onUpdate({
      ...page,
      testimonials: [...current, { name: 'User Name', quote: 'User feedback text...', avatar: 'person' }]
    });
  };

  const removeTestimonial = (index: number) => {
    const current = page.testimonials || [];
    onUpdate({
      ...page,
      testimonials: current.filter((_, i) => i !== index)
    });
  };

  const updateFontSize = (field: 'testimonialName' | 'testimonialQuote', delta: number) => {
    const defaultSize = field === 'testimonialName' ? 14 : 12;
    const currentSize = page.styleOverrides?.[field]?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [field]: {
          ...(page.styleOverrides?.[field] || {}),
          fontSize: Math.max(8, (currentSize || defaultSize) + delta)
        }
      }
    });
  };

  const handleFontChange = (field: 'testimonialName' | 'testimonialQuote', font: string) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        [field]: {
          ...(page.styleOverrides?.[field] || {}),
          // 这里借用这个字段存字体，虽然 type 里没定义，但在 JS 环境中可行，后续统一
          fontFamily: font
        }
      }
    } as any);
  };

  const renderCellPreview = (val: string) => {
    if (!val) return <Plus size={14} />;
    const isImg = val.startsWith('data:image') || val.includes('http');
    if (isImg) return <img src={val} className="w-full h-full object-cover rounded-md" />;
    const isMaterial = val.includes('_') || /^[a-z]/.test(val);
    if (isMaterial) return <span className="material-symbols-outlined notranslate text-[18px]" style={{ textTransform: 'none' }}>{val.toLowerCase()}</span>;
    try {
      const PascalName = val.charAt(0).toUpperCase() + val.slice(1);
      const Icon = (LucideIcons as any)[PascalName] || (LucideIcons as any)[val] || LucideIcons.User;
      return <Icon size={18} strokeWidth={2.5} />;
    } catch (e) {
      return <LucideIcons.User size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <button onClick={toggle} className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}>
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={MessageSquare} className="mb-0">Testimonials</Label>
      </div>
      
      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {(page.testimonials || []).map((t, idx) => (
          <div key={idx} className="relative group p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-transparent hover:border-slate-200 transition-all shadow-sm">
            <button onClick={() => removeTestimonial(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10">
              <X size={14} />
            </button>
            <div className="flex justify-between items-center border-b border-white pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#264376] shadow-sm"><User size={12}/></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Feedback {idx + 1}</span>
              </div>
              <IconPicker 
                value={t.avatar || ''} 
                onChange={(val) => handleTestimonialChange(idx, 'avatar', val)}
                trigger={<button className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden shadow-md hover:border-[#264376] transition-all">{renderCellPreview(t.avatar)}</button>}
              />
            </div>

            <div className="space-y-3">
              {/* Name Field with Toolbar */}
              <div className="relative group/field">
                <FieldToolbar 
                  onIncrease={() => updateFontSize('testimonialName', 1)} 
                  onDecrease={() => updateFontSize('testimonialName', -1)}
                  customFonts={customFonts}
                  currentFont={(page.styleOverrides as any)?.testimonialName?.fontFamily}
                  onFontChange={(font) => handleFontChange('testimonialName', font)}
                />
                <Input 
                  placeholder="User Name" 
                  value={t.name || ''} 
                  onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)} 
                  className="text-xs font-bold bg-white" 
                  style={{ fontFamily: (page.styleOverrides as any)?.testimonialName?.fontFamily }}
                />
              </div>

              {/* Quote Field with Toolbar */}
              <div className="relative group/field">
                <FieldToolbar 
                  onIncrease={() => updateFontSize('testimonialQuote', 1)} 
                  onDecrease={() => updateFontSize('testimonialQuote', -1)}
                  customFonts={customFonts}
                  currentFont={(page.styleOverrides as any)?.testimonialQuote?.fontFamily}
                  onFontChange={(font) => handleFontChange('testimonialQuote', font)}
                />
                <TextArea 
                  placeholder="Testimonial Quote" 
                  value={t.quote || ''} 
                  rows={3} 
                  onChange={(e) => handleTestimonialChange(idx, 'quote', e.target.value)} 
                  className="text-[11px] leading-relaxed bg-white" 
                  style={{ fontFamily: (page.styleOverrides as any)?.testimonialQuote?.fontFamily }}
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addTestimonial}
          disabled={(page.testimonials?.length || 0) >= 8}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Add Testimonial
        </button>
      </div>
    </div>
  );
};
