import React, { useState } from 'react';
import { PageData, CustomFont } from '../../../types';
import { Activity, Grid3X3, MousePointer2 } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import Modal from '../../Modal';
import { MetricsStylePanel } from './big-data-metrics/MetricsStylePanel';
import { BigDataMetricsVisualDesigner } from './big-data-metrics/BigDataMetricsVisualDesigner';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

/**
 * BigDataMetricsField - 大数据指标矩阵字段主入口
 * 职责：连接页面状态、网格尺寸调整、编排样式面板与可视化设计器弹窗
 */
export const BigDataMetricsField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  
  const metrics = page.metrics || [];
  const gridConfig = page.bigDataMetricsConfig || { rows: 3, cols: 2 };

  const updateGridConfig = (updates: Partial<{ rows: number; cols: number }>) => {
    const newConfig = { ...gridConfig, ...updates };
    onUpdate({ 
      ...page, 
      bigDataMetricsConfig: newConfig
    });
  };

  return (
    <FieldWrapper 
      page={page} 
      onUpdate={onUpdate} 
      fieldKey="bigDataMetrics" 
      label="Big Data Metrics" 
      icon={Activity}
    >
      <div className="space-y-4">
        {/* 样式控制面板 */}
        <MetricsStylePanel page={page} onUpdate={onUpdate} customFonts={customFonts} />

        {/* 网格行与列尺寸配置 */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4">
          <Grid3X3 size={16} className="text-slate-400" />
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Columns</span>
              <Input 
                type="number" 
                min={1} max={10}
                value={gridConfig.cols} 
                onChange={(e) => updateGridConfig({ cols: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })} 
                className="font-mono text-xs font-bold py-1"
              />
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Rows</span>
              <Input 
                type="number" 
                min={1} max={10}
                value={gridConfig.rows} 
                onChange={(e) => updateGridConfig({ rows: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })} 
                className="font-mono text-xs font-bold py-1"
              />
            </div>
          </div>
        </div>

        {/* 可视化编辑器唤起按钮 */}
        <button 
          type="button"
          onClick={() => setIsVisualEditorOpen(true)} 
          className="w-full py-4 bg-[#264376] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#264376]/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <MousePointer2 size={16} /> Open Visual Grid Designer
        </button>

        {/* 可视化编辑器模态窗 */}
        <Modal 
          isOpen={isVisualEditorOpen} 
          onClose={() => setIsVisualEditorOpen(false)} 
          title="Big Data Metrics Grid Designer" 
          maxWidth="max-w-5xl" 
          type="custom"
        >
          <BigDataMetricsVisualDesigner 
            rows={gridConfig.rows} 
            cols={gridConfig.cols} 
            currentMetrics={metrics}
            onSave={(newMetrics, newConfig) => {
              onUpdate({
                ...page,
                metrics: newMetrics,
                bigDataMetricsConfig: newConfig
              });
              setIsVisualEditorOpen(false);
            }}
          />
        </Modal>
      </div>
    </FieldWrapper>
  );
};
