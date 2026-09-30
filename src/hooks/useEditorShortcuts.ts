import { useEffect } from 'react';

export interface ShortcutHandlers {
  onSave: () => void;
  onSaveAs: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

// 全局键盘快捷键:Ctrl+S 保存、Ctrl+Shift+S 另存为、Ctrl+Z/Y 撤销重做
export function useEditorShortcuts(handlers: ShortcutHandlers): void {
  const { onSave, onSaveAs, onUndo, onRedo } = handlers;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) onSaveAs();
        else onSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSaveAs, onUndo, onRedo]);
}
