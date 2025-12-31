import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, LUCIDE_ICON_MAP, Search, Trash2, History, LayoutGrid, Upload, Globe, ImageIcon } from '../../constants/icons';
import Modal from '../Modal';
import { CATEGORIZED_ICONS } from '../../constants/icons';
import { compressImage } from '../../utils/db';

export type AssetTab = 'icons' | 'upload';

interface IconPickerProps {
  value: string;
  onChange: (val: string) => void;
  trigger?: React.ReactNode;
  allowedTabs?: AssetTab[];
  className?: string;
}

const RECENT_STORAGE_KEY = 'magazine_editor_recent_assets';

/**
 * IconPicker 组件 (原 AssetPicker)
 * 统一处理图标库选择和本地图片上传/URL加载。
 */
export default function IconPicker({ 
  value, 
  onChange, 
  trigger, 
  allowedTabs = ['icons', 'upload'],
  className = ""
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetTab>(allowedTabs[0]);
  const [search, setSearch] = useState('');
  const [recentAssets, setRecentAssets] = useState<string[]>([]);

  // Load recent assets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_STORAGE_KEY);
    if (saved) {
      try {
        setRecentAssets(JSON.parse(saved));
      } catch (e) {
        setRecentAssets([]);
      }
    }
  }, [isOpen]);

  const saveToRecent = (asset: string) => {
    // 修复：不要将巨大的 Base64 字符串存入 LocalStorage，防止 QuotaExceededError
    if (!asset || asset.includes('example_pic') || asset.startsWith('data:')) return;
    const newRecent = [asset, ...recentAssets.filter(a => a !== asset)].slice(0, 18);
    setRecentAssets(newRecent);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(newRecent));
  };

  const clearRecent = () => {
    setRecentAssets([]);
    localStorage.removeItem(RECENT_STORAGE_KEY);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    saveToRecent(val);
    setIsOpen(false);
  };

  const renderIcon = (name: string, type: 'material' | 'lucide', size = 20) => {
    if (!name) return <HelpCircle size={size} className="opacity-20" />;
    if (type === 'material') {
      return <span className="material-symbols-outlined shrink-0 notranslate" style={{ fontSize: `${size}px`, textTransform: 'none !important' as any, fontStyle: 'normal' }}>{name.toLowerCase()}</span>;
    }
    const Icon = LUCIDE_ICON_MAP[name] || LUCIDE_ICON_MAP[name.charAt(0).toUpperCase() + name.slice(1)] || HelpCircle;
    return <Icon size={size} strokeWidth={2.5} className="shrink-0" />;
  };

  const isImage = (val: string) => val && (val.startsWith('data:image') || val.includes('http') || val.includes('.png') || val.includes('.jpg'));

  const filteredCategories = useMemo(() => {
    return CATEGORIZED_ICONS.map(cat => ({
      ...cat,
      icons: cat.icons.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()))
    })).filter(cat => cat.icons.length > 0);
  }, [search]);

  const [visibleCount, setVisibleCount] = useState(2);
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisibleCount(filteredCategories.length), 500);
      return () => clearTimeout(timer);
    } else {
      setVisibleCount(2);
    }
  }, [isOpen, filteredCategories.length]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.material-symbols-outlined { text-transform: none !important; font-variant: normal !important; font-feature-settings: "liga" 1 !important; }` }} />
      
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} className={`cursor-pointer flex ${className}`}>
        {trigger ? trigger : (
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-lg hover:border-[#264376] transition-all group">
             {isImage(value) ? <img src={value} className="w-4 h-4 object-contain rounded-sm" /> : renderIcon(value, 'lucide', 16)}
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Asset</span>
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modern Asset Library" type="custom" maxWidth="max-w-[90vw]">
        <div className="flex flex-col h-[80vh]">
          {/* Tabs Navigation */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 shrink-0">
            <div className="flex gap-6">
              {allowedTabs.includes('icons') && (
                <button onClick={() => setActiveTab('icons')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'icons' ? 'border-[#264376] text-[#264376]' : 'border-transparent text-slate-400'}`}>
                  <div className="flex items-center gap-2"><LayoutGrid size={14} /> Icon Library</div>
                </button>
              )}
              {allowedTabs.includes('upload') && (
                <button onClick={() => setActiveTab('upload')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'upload' ? 'border-[#264376] text-[#264376]' : 'border-transparent text-slate-400'}`}>
                  <div className="flex items-center gap-2"><Upload size={14} /> Custom Uploads</div>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            {/* Search Bar (Only for Icons) */}
            {activeTab === 'icons' && (
              <div className="relative shrink-0"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input type="text" placeholder="Search across 500+ curated icons..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-[#264376]/20 transition-all outline-none" autoFocus /></div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-10">
              
              {/* Recent Assets Section (Always show if not empty) */}
              {recentAssets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                      <History size={14} className="text-[#264376]" /> Recently Used
                    </div>
                    <button onClick={clearRecent} className="text-[9px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                      <Trash2 size={10} /> Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                    {recentAssets.map((asset, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelect(asset)}
                        className="aspect-square bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center hover:border-[#264376] hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center text-[#264376] transition-transform group-hover:scale-110">
                          {isImage(asset) ? <img src={asset} className="w-full h-full object-cover rounded-md" /> : renderIcon(asset, asset.includes('_') ? 'material' : 'lucide', 24)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'icons' ? (
                <div className="space-y-12">
                  {filteredCategories.slice(0, visibleCount).map(cat => (
                    <div key={cat.category} className="space-y-5">
                      <div className="flex items-center gap-3 px-2 border-b border-slate-100 pb-3"><cat.icon size={18} className="text-[#264376]" /><h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{cat.category}</h4><span className="text-[10px] font-bold text-slate-300 ml-auto">{cat.icons.length} Items</span></div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                        {cat.icons.map(icon => (
                          <button 
                            key={icon.name}
                            onClick={() => handleSelect(icon.name)} 
                            className={`group flex flex-col items-center justify-center p-4 rounded-2xl transition-all gap-3 border-2 ${value === icon.name ? 'bg-[#264376]/10 border-[#264376] text-[#264376] shadow-md' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-400'}`}
                          >
                            <div className="h-8 flex items-center transition-transform group-hover:scale-110">
                              {renderIcon(icon.name, icon.type as any, 32)}
                            </div>
                            <span className="text-[7px] font-bold uppercase truncate w-full text-center opacity-60 px-1">
                              {(icon.name || '').replace(/_/g, ' ')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 gap-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-48 h-48 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white relative">
                    {isImage(value) ? <img src={value} className="w-full h-full object-contain" /> : <ImageIcon size={64} className="text-slate-200" />}
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    <label className="cursor-pointer px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-slate-200 flex items-center gap-3">
                      <Upload size={16} /> Upload Local Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => { 
                        const file = e.target.files?.[0]; 
                        if (file) { 
                          compressImage(file).then(handleSelect).catch(err => {
                            console.error("Compression failed", err);
                            // Fallback if compression fails
                            const reader = new FileReader(); 
                            reader.onloadend = () => handleSelect(reader.result as string); 
                            reader.readAsDataURL(file);
                          });
                        } 
                      }} />
                    </label>
                    
                    <div className="flex items-center gap-3 w-full max-w-sm">
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full max-w-md">
                      <div className="pl-3 text-slate-400"><Globe size={14} /></div>
                      <input 
                        type="text" 
                        placeholder="Paste image URL here..." 
                        className="flex-1 bg-transparent border-none outline-none text-xs py-2 px-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSelect((e.target as HTMLInputElement).value);
                        }}
                      />
                      <button 
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition-colors"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          if (input.value) handleSelect(input.value);
                        }}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                  {isImage(value) && <button onClick={() => onChange('')} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Remove Current Image</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}