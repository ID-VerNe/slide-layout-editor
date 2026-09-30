import Modal from '../../Modal';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'pdf') => void;
}

// 导出格式选择弹窗:PNG 或 PDF
export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export" type="custom">
      <div className="grid grid-cols-2 gap-4 p-4">
        <button onClick={() => onExport('png')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all">
          <span className="text-xs font-black uppercase">Export PNG</span>
        </button>
        <button onClick={() => onExport('pdf')} className="p-8 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-[#264376] transition-all">
          <span className="text-xs font-black uppercase">Export PDF</span>
        </button>
      </div>
    </Modal>
  );
}
