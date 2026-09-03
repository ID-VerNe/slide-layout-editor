import React, { useState } from 'react';
import { MetricData } from '../../../../types';
import { Plus, X } from 'lucide-react';
import { Input } from '../../../ui/Base';

interface BigDataMetricsVisualDesignerProps {
  rows: number;
  cols: number;
  currentMetrics: MetricData[];
  onSave: (metrics: MetricData[], config: { rows: number; cols: number }) => void;
}

/**
 * BigDataMetricsVisualDesigner - 全屏网格可视化设计与交互配置器
 */
export const BigDataMetricsVisualDesigner: React.FC<BigDataMetricsVisualDesignerProps> = ({
  rows,
  cols,
  currentMetrics,
  onSave,
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
      setMetrics([...metrics, { id: crypto.randomUUID(), label: 'NEW METRIC', value: '00', unit: '' }]);
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
                min={1}
                max={10}
                value={gridRows}
                onChange={(e) => setGridRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-slate-400">Cols</span>
              <Input
                type="number"
                min={1}
                max={10}
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
          type="button"
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
          minHeight: '400px',
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
                        type="button"
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
                        type="button"
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
          type="button"
          onClick={addMetric}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold uppercase text-xs hover:border-[#264376] hover:text-[#264376] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Metric ({metrics.length}/{totalCells})
        </button>
      )}
    </div>
  );
};
