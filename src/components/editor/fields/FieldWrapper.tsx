import React, { useState, useRef, useEffect } from 'react';
import { PageData, CustomFont } from '../../../types';
import { Eye, EyeOff, LucideIcon, Settings2, X } from 'lucide-react';
import { ZineStylePanel } from '../zine/ZineStylePanel';

interface FieldWrapperProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  fieldKey?: keyof PageData; // 修正类型
  manualVisibility?: boolean;
  onToggle?: (isVisible: boolean) => void;
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  showStyleConfig?: boolean;
  styleMode?: 'text' | 'image' | 'divider';
  customFonts?: CustomFont[];
}

/**
 * FieldWrapper 通用包装组件 - 已增强：支持 Zine Style Panel 与 虚拟化层级修复
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
  className = "",
  showStyleConfig = false,
  styleMode,
  customFonts = []
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelDirection, setPanelDirection] = useState<'up' | 'down'>('down');
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // 1. 点击空白处关闭 & 提升虚拟化行层级
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    // 提升父级虚拟化行的 z-index，防止被下一行遮挡
    const row = wrapperRef.current?.closest('[data-index]');
    const originalZIndex = row ? (row as HTMLElement).style.zIndex : '';
    if (row) (row as HTMLElement).style.zIndex = '100';

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (row) (row as HTMLElement).style.zIndex = originalZIndex;
    };
  }, [isPanelOpen]);

  const isVisible = manualVisibility !== undefined 
    ? manualVisibility 
    : (fieldKey ? (page.visibility as any)?.[fieldKey] !== false : true);

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

  const togglePanel = () => {
    if (!isPanelOpen) {
      // 智能定位：检测下方空间，如果不足 400px 则向上彈出
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setPanelDirection(spaceBelow < 400 ? 'up' : 'down');
      }
    }
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <div ref={wrapperRef} className={`space-y-2 relative ${className}`}>
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
        
        <div className="flex items-center gap-2">
          {showStyleConfig && isVisible && fieldKey && (
            <div className="relative">
              <button
                onClick={togglePanel}
                className={`p-1.5 rounded-md transition-all ${isPanelOpen ? 'bg-zine-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Style Settings"
              >
                <Settings2 size={14} />
              </button>
              
              {isPanelOpen && (
                <div 
                  className={`absolute right-0 z-[100] ${panelDirection === 'up' ? 'bottom-full mb-4' : 'top-10'}`}
                >
                  <div className="relative">
                    <ZineStylePanel 
                      page={page} 
                      fieldKey={fieldKey as string} 
                      onUpdate={onUpdate}
                      customFonts={customFonts}
                      mode={styleMode}
                    />
                    <button 
                      onClick={() => setIsPanelOpen(false)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {actions}
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
};
