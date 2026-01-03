import React from 'react';
import { PageData } from '../../../types';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface FieldWrapperProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  fieldKey?: keyof NonNullable<PageData['visibility']>;
  manualVisibility?: boolean;
  onToggle?: (isVisible: boolean) => void;
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * FieldWrapper 通用包装组件
 * 统一处理字段的可见性切换、标签渲染和布局结构，减少各 Field 组件的样板代码。
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({ 
  page, 
  onUpdate, 
  fieldKey, 
  manualVisibility,
  onToggle,
  label, 
  icon: Icon, 
  children,
  actions,
  className = ""
}) => {
  const isVisible = manualVisibility !== undefined 
    ? manualVisibility 
    : (fieldKey ? page.visibility?.[fieldKey] !== false : true);

  const toggle = () => {
    if (onToggle) {
      onToggle(!isVisible);
    } else if (fieldKey) {
      onUpdate({
        ...page,
        visibility: { ...(page.visibility || {}), [fieldKey]: !isVisible }
      });
    }
  };

  return (
    <div className={`space-y-2 relative ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggle}
            className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
            title={isVisible ? "Hide Field" : "Show Field"}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <div className="flex items-center gap-1.5">
            {Icon && <Icon size={12} className="text-slate-400" />}
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      
      <div className={`transition-all duration-300 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
};
