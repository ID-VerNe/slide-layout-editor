import React from 'react';
import { Type } from 'lucide-react';
import Editor from '../Editor';
import { PageData, CustomFont } from '../../types';

interface EditorPanelProps {
  currentPage: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentPage,
  onUpdatePage,
  customFonts,
  pages,
}) => {

  return (
    /*
      移除内部 motion 逻辑，转为固定宽度的 flex 容器
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
        <Editor
          page={currentPage}
          onUpdate={onUpdatePage}
          customFonts={customFonts}
          pages={pages}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
