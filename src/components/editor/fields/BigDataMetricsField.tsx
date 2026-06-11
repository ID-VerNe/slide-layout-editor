import React, { useState } from 'react';
import { PageData, MetricData, CustomFont } from '../../../types';
import { Activity, Plus, X, Grid3X3, MousePointer2, Type, RotateCcw } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import { PresetSelect } from '../../ui/PresetSelect';
import { FONT_SIZE_PRESETS } from '../../../constants/editorPresets';
import Modal from '../../Modal';
import { FontSelect } from '../../ui/FontSelect';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}

const MetricsStylePanel: React.FC<{
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
}> = ({ page, onUpdate, customFonts }) => {
  const styles = page.styleOverrides?.bigDataMetrics || {};
  
  const updateStyle = (part: 'value' | 'label' | 'unit', key: string, value: any) => {
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        bigDataMetrics: {
          ...styles,
          [part]: {
            ...(styles[part] || {}),
            [key]: value
          }
        }
      }
    });
  };

  const resetAll = () => {
    const nextOverrides = { ...(page.styleOverrides || {}) };
    delete nextOverrides.bigDataMetrics;
    onUpdate({ ...page, styleOverrides: nextOverrides });
  };

  const valueStyle = styles.value || {};
  const labelStyle = styles.label || {};
  const unitStyle = styles.unit || {};

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Type size={14} className="text-zine-accent" />
          <span className="text-[10px] font-black uppercase tracking-wider">Metrics Style</span>
        </div>
        {Object.keys(styles).length > 0 && (
          <button onClick={resetAll} className="text-[8px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
            <RotateCcw size={10} /> RESET
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] font-black uppercase text-slate-500">Value (数值)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Size (x8px)</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button 
                onClick={() => updateStyle('value', 'size', Math.max(0.5, (valueStyle.size || 3.5) - 0.5))}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >-</button>
              <span className="w-full text-center text-[10px] font-black">{valueStyle.size || 3.5}</span>
              <button 
                onClick={() => updateStyle('value', 'size', (valueStyle.size || 3.5) + 0.5)}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >+</button>
            </div>
          </div>
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Font</label>
            <FontSelect 
              value={valueStyle.fontFamily}
              onChange={(v) => updateStyle('value', 'fontFamily', v)}
              customFonts={customFonts}
              compact
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateStyle('value', 'bold', !valueStyle.bold)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${valueStyle.bold ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Bold</button>
          <button
            onClick={() => updateStyle('value', 'italic', !valueStyle.italic)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${valueStyle.italic ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Italic</button>
          <input
            type="color"
            value={valueStyle.color || '#000000'}
            onChange={(e) => updateStyle('value', 'color', e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
            title="Color"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] font-black uppercase text-slate-500">Label (标签)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Size (x8px)</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button 
                onClick={() => updateStyle('label', 'size', Math.max(0.5, (labelStyle.size || 2.25) - 0.25))}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >-</button>
              <span className="w-full text-center text-[10px] font-black">{labelStyle.size || 2.25}</span>
              <button 
                onClick={() => updateStyle('label', 'size', (labelStyle.size || 2.25) + 0.25)}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >+</button>
            </div>
          </div>
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Font</label>
            <FontSelect 
              value={labelStyle.fontFamily}
              onChange={(v) => updateStyle('label', 'fontFamily', v)}
              customFonts={customFonts}
              compact
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateStyle('label', 'bold', !labelStyle.bold)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${labelStyle.bold ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Bold</button>
          <button
            onClick={() => updateStyle('label', 'italic', !labelStyle.italic)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${labelStyle.italic ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Italic</button>
          <input
            type="color"
            value={labelStyle.color || '#000000'}
            onChange={(e) => updateStyle('label', 'color', e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
            title="Color"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[9px] font-black uppercase text-slate-500">Unit (单位)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Size (x8px)</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button 
                onClick={() => updateStyle('unit', 'size', Math.max(0.5, (unitStyle.size || 1.5) - 0.25))}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >-</button>
              <span className="w-full text-center text-[10px] font-black">{unitStyle.size || 1.5}</span>
              <button 
                onClick={() => updateStyle('unit', 'size', (unitStyle.size || 1.5) + 0.25)}
                className="w-full py-1 text-xs font-black hover:bg-slate-50 rounded"
              >+</button>
            </div>
          </div>
          <div>
            <label className="text-[8px] font-bold text-slate-400 ml-1">Font</label>
            <FontSelect 
              value={unitStyle.fontFamily}
              onChange={(v) => updateStyle('unit', 'fontFamily', v)}
              customFonts={customFonts}
              compact
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateStyle('unit', 'bold', !unitStyle.bold)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${unitStyle.bold ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Bold</button>
          <button
            onClick={() => updateStyle('unit', 'italic', !unitStyle.italic)}
            className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${unitStyle.italic ? 'bg-zine-accent text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
          >Italic</button>
          <input
            type="color"
            value={unitStyle.color || '#000000'}
            onChange={(e) => updateStyle('unit', 'color', e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
            title="Color"
          />
        </div>
      </div>
    </div>
  );
};


export const BigDataMetricsField: React.FC<FieldProps> = ({ page, onUpdate, customFonts }) => {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  
  const metrics = page.metrics || [];
  const gridConfig = page.bigDataMetricsConfig || { rows: 3, cols: 2 };

  const updateMetrics = (newMetrics: MetricData[]) => {
    const updatedPage = { ...page, metrics: newMetrics };
    onUpdate(updatedPage);
  };

  const updateGridConfig = (updates: Partial<{ rows: number; cols: number }>) => {
    const newConfig = { ...gridConfig, ...updates };
    onUpdate({ 
      ...page, 
      bigDataMetricsConfig: newConfig
    });
  };

  const updateFontSize = (idx: number, value: number) => {
    const newMetrics = [...metrics];
    newMetrics[idx] = { ...newMetrics[idx], fontSize: value };
    updateMetrics(newMetrics);
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

        {/* 网格配置 */}
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

        {/* 可视化编辑器按钮 */}
        <button 
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
              // 一次性更新 metrics 和 config，避免两次 onUpdate 导致数据覆盖
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

// 可视化编辑器组件
const BigDataMetricsVisualDesigner = ({ 
  rows, 
  cols, 
  currentMetrics, 
  onSave 
}: { 
  rows: number; 
  cols: number; 
  currentMetrics: MetricData[]; 
  onSave: (metrics: MetricData[], config: { rows: number; cols: number }) => void;
}) => {
  const [metrics, setMetrics] = useState<MetricData[]>(currentMetrics);
  const [gridRows, setGridRows] = useState(rows);
  const [gridCols, setGridCols] = useState(cols);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const totalCells = gridRows * gridCols;

  const handleSave = () => {
    const savedMetrics = metrics.slice(0, totalCells);
    const savedConfig = { rows: gridRows, cols: gridCols };
    onSave(savedMetrics, savedConfig);
  };

  const addMetric = () => {
    if (metrics.length < totalCells) {
      setMetrics([...metrics, { label: 'NEW METRIC', value: '00', unit: '' }]);
    }
  };

  const updateMetric = (idx: number, updates: Partial<MetricData>) => {
    const newMetrics = [...metrics];
    newMetrics[idx] = { ...newMetrics[idx], ...updates };
    setMetrics(newMetrics);
  };

  const removeMetric = (idx: number) => {
    setMetrics(metrics.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 顶部控制栏 */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Grid Configuration</h4>
          <div className="flex gap-4">
            <div>
              <span className="text-[8px] font-black uppercase text-slate-400">Rows</span>
              <Input 
                type="number" 
                min={1} max={10}
                value={gridRows}
                onChange={(e) => setGridRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-slate-400">Cols</span>
              <Input 
                type="number" 
                min={1} max={10}
                value={gridCols}
                onChange={(e) => setGridCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 font-mono text-xs font-bold"
              />
            </div>
            <div className="flex items-end">
              <span className="text-xs text-slate-500 font-mono">
                Total: {totalCells} cells
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          className="px-8 py-2.5 bg-[#264376] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#264376]/20 transition-all hover:brightness-110"
        >
          Save & Exit
        </button>
      </div>

      {/* 网格预览 */}
      <div 
        className="grid gap-3 bg-slate-100 p-6 rounded-3xl"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          minHeight: '400px'
        }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const metric = metrics[idx];
          const hasMetric = idx < metrics.length;
          const isEditing = editingIdx === idx;
          
          return (
            <div 
              key={idx}
              className={`rounded-xl p-4 border-2 transition-all ${
                hasMetric 
                  ? isEditing
                    ? 'bg-blue-50 border-blue-500 shadow-lg'
                    : 'bg-white border-[#264376] shadow-md cursor-pointer hover:shadow-lg'
                  : 'bg-slate-50 border-dashed border-slate-300'
              }`}
              onClick={() => hasMetric && setEditingIdx(isEditing ? null : idx)}
            >
              {hasMetric ? (
                isEditing ? (
                  // 编辑模式
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black uppercase text-slate-400">Editing</span>
                      <button 
                        onClick={() => removeMetric(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <Input
                      placeholder="Value"
                      value={metric.value}
                      onChange={(e) => updateMetric(idx, { value: e.target.value })}
                      className="font-bold text-sm"
                    />
                    <Input
                      placeholder="Unit"
                      value={metric.unit || ''}
                      onChange={(e) => updateMetric(idx, { unit: e.target.value })}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Label"
                      value={metric.label}
                      onChange={(e) => updateMetric(idx, { label: e.target.value })}
                      className="text-[8px] uppercase font-black"
                    />
                  </div>
                ) : (
                  // 预览模式
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl font-black">{metric.value}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMetric(idx);
                        }}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    {metric.unit && <span className="text-xs opacity-60">{metric.unit}</span>}
                    <p className="text-[8px] uppercase font-black tracking-widest opacity-50">
                      {metric.label}
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 text-xs">
                  Empty
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 添加按钮 */}
      {metrics.length < totalCells && (
        <button 
          onClick={addMetric}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold uppercase text-xs hover:border-[#264376] hover:text-[#264376] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Metric ({metrics.length}/{totalCells})
        </button>
      )}
    </div>
  );
};
