import React from 'react';
import { Type, Image as ImageIcon, Square, Star } from 'lucide-react';

interface FreeformToolbarProps {
  // 核心修复：只传递类型，创建逻辑交给容器
  onAdd: (type: 'text' | 'image' | 'shape' | 'icon') => void;
}

/**
 * FreeformToolbar - 纯 UI 工具栏
 */
export const FreeformToolbar: React.FC<FreeformToolbarProps> = ({ onAdd }) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl px-6 py-3 flex gap-6 z-50 border border-slate-200/50 animate-in slide-in-from-top-4 duration-500">
      <ToolbarButton 
        icon={Type} 
        label="Text" 
        onClick={() => onAdd('text')} 
      />
      <ToolbarButton 
        icon={ImageIcon} 
        label="Image" 
        onClick={() => onAdd('image')} 
      />
      <ToolbarButton 
        icon={Square} 
        label="Shape" 
        onClick={() => onAdd('shape')} 
      />
      <ToolbarButton 
        icon={Star} 
        label="Icon" 
        onClick={() => onAdd('icon')} 
      />
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: any; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#264376] transition-all hover:scale-110 active:scale-90 group"
    title={label}
  >
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#264376]/5 transition-colors">
      <Icon size={20} />
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
