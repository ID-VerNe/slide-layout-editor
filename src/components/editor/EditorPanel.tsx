import React from 'react';
import { Type } from 'lucide-react';
import Editor from '../Editor';
import { PageData, CustomFont } from '../../types';
import { EditorErrorBoundary } from './EditorErrorBoundary';

interface EditorPanelProps {
  currentPage?: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
  onOpenLayoutBrowser?: (mode: 'create' | 'change') => void;
}

const EditorPanel = React.memo(function EditorPanel({
  currentPage,
  onUpdatePage,
  customFonts,
  pages,
  onOpenLayoutBrowser,
}: EditorPanelProps) {

  return (
    /*
      移除内部 motion 逻辑,转为固定宽度的 flex 容器
      确保内容在父级容器宽度变化时不会变形
    */
    <div className="w-[400px] h-full bg-white flex flex-col border-l border-slate-950">
      <div className="h-16 px-6 border-b border-slate-950 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-black text-slate-950 flex items-center gap-3 uppercase text-sm tracking-[0.2em]">
          <Type size={16} strokeWidth={3} className="text-slate-950" />
          Editor
        </h2>
      </div>

      <div id="editor-scroll-container" className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
        {/* 切页时通过 key 重置 Boundary 错误态,避免上一页的错误连累新页。
            currentPage 在 loadProject 异步恢复前可能为 undefined(reload 场景),
            用可选链读取 id 避免 .id 抛错冒泡到顶层 ErrorBoundary 而中断恢复。 */}
        <EditorErrorBoundary key={currentPage?.id}>
          {currentPage ? (
            <Editor
              page={currentPage}
              onUpdate={onUpdatePage}
              customFonts={customFonts}
              pages={pages}
              onOpenLayoutBrowser={onOpenLayoutBrowser}
            />
          ) : null}
        </EditorErrorBoundary>
      </div>
    </div>
  );
});

export default EditorPanel;
