import React from 'react';
import { Type } from 'lucide-react';
import Editor from '../Editor';
import { PageData, CustomFont } from '../../types';

interface EditorPanelProps {
  currentPage: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentPage,
  onUpdatePage,
  customFonts,
}) => {
  return (
    /* 
      移除内部 motion 逻辑，转为固定宽度的 flex 容器 
      确保内容在父级容器宽度变化时不会变形
    */
    <div className="w-[400px] h-full bg-white flex flex-col border-l border-neutral-200 shadow-[0_0_40px_rgba(0,0,0,0.05)]">
      <div className="h-16 px-6 border-b border-neutral-100 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Type size={18} className="text-slate-400" />
          Editor
        </h2>
      </div>
      
      <div id="editor-scroll-container" className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <Editor 
          page={currentPage} 
          onUpdate={onUpdatePage} 
          customFonts={customFonts} 
        />
      </div>
    </div>
  );
};

export default EditorPanel;
