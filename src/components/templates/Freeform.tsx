import React from 'react';
import { PageData, FreeformItem } from '../../types';
import { FreeformCanvas } from '../freeform/FreeformCanvas';
import { FreeformToolbar } from '../freeform/FreeformToolbar';

interface FreeformTemplateProps {
  page: PageData;
  onUpdate?: (page: PageData) => void;
}

const Freeform: React.FC<FreeformTemplateProps> = ({ page, onUpdate }) => {
  
  /**
   * handleAdd - 元素创建中心
   * 确保每个新元素都拥有 100% 完整的默认属性，防止渲染器报错
   */
  const handleAdd = (type: 'text' | 'image' | 'shape' | 'icon') => {
    if (!onUpdate) return;

    const newItem: FreeformItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 100, // 初始 X 坐标
      y: 100, // 初始 Y 坐标
      width: type === 'text' ? 400 : type === 'image' ? 300 : 150,
      height: type === 'text' ? 80 : type === 'image' ? 200 : 150,
      rotation: 0,
      opacity: 1,
      backgroundColor: type === 'shape' ? '#264376' : 'transparent',
      borderColor: '#000000',
      borderWidth: 0,
      borderRadius: 0,
      content: type === 'text' 
        ? { text: 'New Text Block' } 
        : type === 'icon' ? { icon: 'Star' } : {},
      typography: type === 'text' || type === 'icon' ? { 
        fontSize: type === 'icon' ? 48 : 24, 
        textAlign: 'left', 
        fontFamily: "'Inter', sans-serif",
        color: '#000000'
      } : {}
    };

    const currentItems = page.freeformItems || [];
    onUpdate({
      ...page,
      freeformItems: [...currentItems, newItem]
    });
  };

  const handleUpdateItems = (items: FreeformItem[]) => {
    if (onUpdate) onUpdate({ ...page, freeformItems: items });
  };

  const handleUpdateConfig = (config: any) => {
    if (onUpdate) onUpdate({ ...page, freeformConfig: config });
  };

  return (
    <div className="w-full h-full relative group bg-white shadow-inner">
      {/* 1. 画布主体 */}
      <FreeformCanvas 
        page={page}
        items={page.freeformItems || []}
        config={page.freeformConfig || { gridSize: 20, snapToGrid: true, showGridOverlay: false, showAlignmentGuides: true }}
        onUpdate={handleUpdateItems}
        onConfigUpdate={handleUpdateConfig}
      />

      {/* 2. 悬浮工具栏 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
        <FreeformToolbar onAdd={handleAdd} />
      </div>

      {/* 3. 页面底部的空状态提示（如果没有元素） */}
      {(!page.freeformItems || page.freeformItems.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-300">Empty Canvas • Hover to Add Components</p>
        </div>
      )}
    </div>
  );
};

export default Freeform;
