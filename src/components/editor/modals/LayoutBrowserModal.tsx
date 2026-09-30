import { Monitor, Smartphone, Square, FileUser } from 'lucide-react';
import { AspectRatioType, LAYOUT_CONFIG, OrientationType } from '../../../constants/layout';
import { TEMPLATES } from '../../../templates/registry';
import { TemplatePreview } from '../../ui/TemplatePreview';
import Modal from '../../Modal';

interface OrientationCardProps {
  icon: typeof Monitor;
  label: string;
  desc: string;
  onClick: () => void;
}

const OrientationCard = ({ icon: Icon, label, desc, onClick }: OrientationCardProps) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-slate-100 hover:border-[#264376] hover:bg-slate-50 transition-all shadow-sm hover:shadow-2xl"><div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 group-hover:bg-[#264376] transition-all"><Icon size={40} className="text-[#264376] group-hover:text-white transition-colors" /></div><div className="text-center"><span className="block text-lg font-black uppercase text-slate-900 mb-1">{label}</span><span className="text-xs font-bold text-slate-400">{desc}</span></div></button>
);

export interface LayoutBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: 'create' | 'change';
  creationStage: 'orientation' | 'ratio' | 'template';
  selectedOrientation: OrientationType;
  selectedRatio: AspectRatioType;
  onSelectOrientation: (ori: OrientationType) => void;
  onSelectRatio: (ratio: AspectRatioType) => void;
  onBackToOrientation: () => void;
  onBackToRatio: () => void;
  onFinalize: (layoutId: string) => void;
}

// 3 步模板创建/切换弹窗:orientation -> ratio -> template
export function LayoutBrowserModal({
  isOpen, onClose, modalMode, creationStage, selectedOrientation, selectedRatio,
  onSelectOrientation, onSelectRatio, onBackToOrientation, onBackToRatio, onFinalize,
}: LayoutBrowserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalMode === 'create' ? "Add New Slide" : "Change Layout"} type="custom" maxWidth="max-w-6xl">
      <div className="min-h-[70vh] flex flex-col p-6">
        {creationStage === 'orientation' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Step 1: Canvas Orientation</h3>
            </div>
            <div className="flex gap-8">
              <OrientationCard icon={Monitor} label="Landscape" desc="Slides" onClick={() => onSelectOrientation('landscape')} />
              <OrientationCard icon={Smartphone} label="Portrait" desc="Magazine" onClick={() => onSelectOrientation('portrait')} />
              <OrientationCard icon={Square} label="Square" desc="Posts" onClick={() => onSelectOrientation('square')} />
              <OrientationCard icon={FileUser} label="Resume" desc="Career Docs" onClick={() => onSelectOrientation('resume')} />
            </div>
          </div>
        )}

        {creationStage === 'ratio' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in slide-in-from-right-4">
            <div className="w-full flex items-center justify-between border-b pb-6">
              <button onClick={onBackToOrientation} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Orientation</button>
              <div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 2: Specific Ratio</h3></div>
              <div className="w-24" />
            </div>
            <div className="flex gap-6 flex-wrap justify-center">
              {Object.entries(LAYOUT_CONFIG).filter(([_, cfg]) => cfg.orientation === selectedOrientation).map(([key, cfg]) => (
                <button key={key} onClick={() => onSelectRatio(key as AspectRatioType)} className={`group relative flex flex-col items-center gap-3 p-8 rounded-[2.5rem] border-2 transition-all ${selectedRatio === key ? 'border-[#2a4a82] bg-[#2a4a82]/5 shadow-lg' : 'border-slate-100 hover:border-[#2a4a82]/30'}`}>
                  <div className={`bg-white rounded shadow-md border ${cfg.width > cfg.height ? 'w-24 h-14' : cfg.width === cfg.height ? 'w-16 h-16' : key === '3:4' ? 'w-15 h-20' : 'w-14 h-21'}`} />
                  <div className="text-center">
                    <span className="block text-sm font-black uppercase text-slate-900">{key}</span>
                    <span className="block text-[10px] font-bold text-slate-400">{cfg.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {creationStage === 'template' && (
          <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 overflow-hidden">
            <div className="flex items-center justify-between border-b pb-6">
              <button onClick={selectedOrientation === 'resume' ? onBackToOrientation : onBackToRatio} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">← Back</button>
              <div className="text-center"><h3 className="text-xl font-black uppercase text-slate-900">Step 3: Select Template</h3></div>
              <div className="w-24" />
            </div>
            <div className="space-y-12 max-h-[60vh] overflow-y-auto no-scrollbar pr-2 pb-10">
              {Array.from(new Set(TEMPLATES.filter(t => t.supportedRatios.includes(selectedRatio)).map(t => t.category))).map(cat => (
                <div key={cat} className="space-y-8">
                  <div className="flex items-center gap-3 px-1 border-b pb-4">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">{cat}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {TEMPLATES.filter(t => t.category === cat && t.supportedRatios.includes(selectedRatio))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(t => (
                        <button key={t.id} onClick={() => onFinalize(t.id)} className="flex flex-col gap-4 group">
                          <TemplatePreview layoutId={t.id} aspectRatio={selectedRatio} />
                          <div className="text-left space-y-1 px-1">
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 group-hover:text-[#2a4a82] transition-colors">{t.name}</span>
                            <p className="text-[9px] text-slate-400 leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-all">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
