import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'alert' | 'confirm' | 'custom';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  maxWidth?: string;
}

/**
 * 升级版 Modal 组件
 * 使用 React Portal 确保弹窗始终渲染在 DOM 顶层，
 * 彻底解决由于父级容器 transform 导致的 fixed 定位失效和遮罩无法全屏的问题。
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
  maxWidth = 'max-w-md'
}: ModalProps) {
  // 确保在客户端环境下运行
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none">
          {/* 
            Backdrop: 强化模糊感与全屏覆盖 
            通过 Portal 渲染，现在它能真正覆盖整个页面（包括侧边栏）
          */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 pointer-events-auto`}
          >
            <div className="p-10">
              <div className="flex items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  {type !== 'custom' && (
                    <div className={`p-3 rounded-2xl ${type === 'confirm' ? 'bg-[#264376]/10 text-[#264376]' : 'bg-amber-50 text-amber-600'}`}>
                        {type === 'confirm' ? <HelpCircle size={28} /> : <AlertCircle size={28} />}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{title}</h3>
                    {message && <p className="text-sm font-medium text-slate-500 mt-1">{message}</p>}
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="custom-modal-content">
                {children}
              </div>
            </div>

            {(type === 'confirm' || type === 'alert') && (
              <div className="bg-slate-50/50 border-t border-slate-100 px-10 py-6 flex justify-end gap-4">
                  {type === 'confirm' && (
                  <button 
                      onClick={onClose}
                      className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                  >
                      {cancelText}
                  </button>
                  )}
                  <button 
                    onClick={() => {
                        if (onConfirm) onConfirm();
                        onClose();
                    }}
                    className="px-8 py-3 bg-[#264376] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#264376]/20 hover:brightness-110 transition-all active:scale-95"
                  >
                    {confirmText}
                  </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}