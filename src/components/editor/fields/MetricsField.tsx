import React from 'react';
import { PageData, MetricData } from '../../../types';
import { Activity, Plus, X, Type } from 'lucide-react';
import { Input } from '../../ui/Base';
import { FieldWrapper } from './FieldWrapper';
import { FieldToolbar } from './FieldToolbar';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const MetricsField: React.FC<FieldProps> = React.memo(({ page, onUpdate }) => {
  const metrics = page.metrics || [];

  const updateMetrics = (newMetrics: MetricData[]) => {
    onUpdate({ ...page, metrics: newMetrics });
  };

  const addItem = () => {
    updateMetrics([...metrics, { label: 'New Metric', value: '00', unit: '' }]);
  };

  const updateItem = (idx: number, updates: Partial<MetricData>) => {
    const newMetrics = [...metrics];
    newMetrics[idx] = { ...newMetrics[idx], ...updates };
    updateMetrics(newMetrics);
  };

  const removeItem = (idx: number) => {
    updateMetrics(metrics.filter((_, i) => i !== idx));
  };

  const updateFontSize = (delta: number) => {
    const currentSize = page.styleOverrides?.metrics?.fontSize;
    onUpdate({
      ...page,
      styleOverrides: {
        ...(page.styleOverrides || {}),
        metrics: {
          ...(page.styleOverrides?.metrics || {}),
          fontSize: Math.max(12, (currentSize || 72) + delta)
        }
      }
    });
  };

  return (
    <FieldWrapper page={page} onUpdate={onUpdate} fieldKey="metrics" label="Big Data Metrics" icon={Activity}>
      <div className="space-y-4">
        {/* 全局控制 metrics 大小 */}
        <div className="relative group/field mb-2 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
           <span className="text-[9px] font-black uppercase text-slate-400 ml-2">Global Metrics Size</span>
           <div className="scale-90 origin-right">
             <FieldToolbar onIncrease={() => updateFontSize(4)} onDecrease={() => updateFontSize(-4)} />
           </div>
        </div>

        {metrics.map((m, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 relative group">
            <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X size={14}/></button>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Value (e.g. 99)" value={m.value} onChange={(e) => updateItem(idx, { value: e.target.value })} className="font-bold text-lg" />
              <Input placeholder="Unit (LaTeX support)" value={m.unit} onChange={(e) => updateItem(idx, { unit: e.target.value })} />
            </div>
            <Input placeholder="Label (e.g. Accuracy)" value={m.label} onChange={(e) => updateItem(idx, { label: e.target.value })} className="text-[10px] uppercase font-black tracking-widest" />
          </div>
        ))}
        <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold uppercase text-xs hover:border-[#264376] hover:text-[#264376] transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add Metric</button>
      </div>
    </FieldWrapper>
  );
});
