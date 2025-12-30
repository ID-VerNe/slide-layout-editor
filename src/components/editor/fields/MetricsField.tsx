import React from 'react';
import { PageData, MetricData } from '../../../types';
import { Eye, EyeOff, TrendingUp, Plus, X } from 'lucide-react';
import { Label, Input } from '../../ui/Base';

interface FieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

export const MetricsField: React.FC<FieldProps> = ({ page, onUpdate }) => {
  const isVisible = page.visibility?.metrics !== false;

  const toggle = () => {
    onUpdate({
      ...page,
      visibility: { ...(page.visibility || {}), metrics: !isVisible }
    });
  };

  const handleMetricChange = (index: number, field: keyof MetricData, value: string) => {
    const newMetrics = [...(page.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onUpdate({ ...page, metrics: newMetrics });
  };

  const addMetric = () => {
    const currentMetrics = page.metrics || [];
    if (currentMetrics.length >= 6) return; 
    onUpdate({
      ...page, 
      metrics: [...currentMetrics, { label: 'New Metric', value: '0', unit: '', subLabel: '' }]
    });
  };

  const removeMetric = (index: number) => {
    const currentMetrics = page.metrics || [];
    onUpdate({
      ...page,
      metrics: currentMetrics.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <button 
          onClick={toggle}
          className={`p-1.5 rounded-md transition-all ${isVisible ? 'text-[#264376] bg-[#264376]/10' : 'text-slate-300 bg-slate-50'}`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Label icon={TrendingUp} className="mb-0">Big Data Metrics</Label>
      </div>
      
      <div className={`space-y-6 ${!isVisible ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {(page.metrics || []).map((m, idx) => (
          <div key={idx} className="relative group p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-transparent hover:border-slate-200 transition-all shadow-sm">
            <button 
              onClick={() => removeMetric(idx)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-100 shadow-md rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
              <X size={14} />
            </button>

            {/* 数值主输入区 */}
            <div className="space-y-1">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Big Value</span>
               <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. 2.2x" 
                    value={m.value || ''} 
                    onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                    className="text-lg font-black text-[#264376] bg-white border-slate-100"
                  />
                  <div className="relative w-24">
                    <Input 
                        placeholder="Unit" 
                        value={m.unit || ''} 
                        onChange={(e) => handleMetricChange(idx, 'unit', e.target.value)}
                        className="text-xs font-mono bg-white border-slate-100"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 pointer-events-none uppercase">TeX</div>
                  </div>
               </div>
            </div>

            {/* 描述辅助区 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</span>
                <Input 
                    placeholder="Description..." 
                    value={m.label || ''} 
                    onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                    className="text-[10px] font-bold bg-white"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-label</span>
                <Input 
                    placeholder="Context..." 
                    value={m.subLabel || ''} 
                    onChange={(e) => handleMetricChange(idx, 'subLabel', e.target.value)}
                    className="text-[10px] bg-white"
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addMetric}
          disabled={(page.metrics?.length || 0) >= 6}
          className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-[#264376] hover:border-[#264376] hover:bg-[#264376]/10 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Add Metric
        </button>
      </div>
    </div>
  );
};