import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Trash2, Copy, Clock, Search, Layout } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { deleteProject, getProject, saveProject } from '../utils/db';
import { LAYOUT_CONFIG, AspectRatioType } from '../constants/layout';
import { TEMPLATES } from '../templates/registry';

const RECENT_PROJECTS_KEY = 'magazine_recent_projects';

export default function Dashboard() {
  const navigate = useNavigate();
  const { alert, confirm } = useUI();
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const sorted = parsed.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setProjects(sorted);
    }
  }, []);

  // 辅助函数：智能推断项目比例
  const getProjectRatio = (project: any): AspectRatioType => {
    // 1. 优先读取项目顶层保存的 aspectRatio
    if (project.aspectRatio) return project.aspectRatio;
    
    // 2. 如果是导入的数据，尝试读取 pages[0]
    if (project.pages && project.pages[0]?.aspectRatio) return project.pages[0].aspectRatio;

    // 3. 根据 layoutId 反向推导 (针对旧数据)
    // 比如 editorial-classic 肯定是 2:3
    const layoutId = project.type || project.pages?.[0]?.layoutId;
    if (layoutId) {
      const template = TEMPLATES.find(t => t.id === layoutId);
      if (template && template.supportedRatios.length === 1) {
        return template.supportedRatios[0];
      }
      // 如果模板支持多种，且包含 2:3，优先判定为 2:3 (针对 Editorial 系列)
      if (template?.category === 'Cover' || template?.category === 'Gallery') {
         if (template.supportedRatios.includes('2:3')) return '2:3';
      }
    }

    return '16:9'; // 默认回退
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const id = `proj-${Date.now()}`;
        
        // 导入时立即推断比例并保存
        const detectedRatio = data.aspectRatio || data.pages?.[0]?.aspectRatio || '16:9';

        await saveProject(id, { ...data, id, lastEdited: new Date().toISOString() });
        
        const newProject = {
          id,
          title: data.pages?.[0]?.title || 'Imported Project',
          date: new Date().toLocaleDateString(),
          type: data.pages?.[0]?.layoutId || 'Imported',
          aspectRatio: detectedRatio,
          thumbnail: null // 导入时不带缩略图，需重新生成
        };

        const updated = [newProject, ...projects];
        setProjects(updated);
        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated.slice(0, 24)));
        navigate(`/editor/${id}`);
      } catch (err) {
        alert("Import Error", "Failed to import project.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateNew = () => {
    const id = `proj-${Date.now()}`;
    navigate(`/editor/${id}?new=true`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm("Delete Project", "Are you sure you want to permanently delete this work?", async () => {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
      await deleteProject(id);
    });
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const original = await getProject(id);
    if (!original) return;

    const newId = `proj-${Date.now()}`;
    const copy = { 
      ...original, 
      id: newId, 
      title: `${original.title || 'Untitled'} (Copy)`,
      lastEdited: new Date().toISOString()
    };
    await saveProject(newId, copy);

    // 复制时保留比例元数据
    const firstPageRatio = original.pages?.[0]?.aspectRatio || '16:9';

    const newEntry = {
      id: newId,
      title: copy.title,
      date: new Date().toLocaleDateString(),
      type: original.pages?.[0]?.layoutId || 'Custom',
      thumbnail: original.thumbnail || null,
      aspectRatio: firstPageRatio
    };

    const updated = [newEntry, ...projects];
    setProjects(updated);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated.slice(0, 24)));
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800 pb-20">
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo className="w-10 h-10" />
          <span className="font-black text-lg tracking-widest text-slate-900 uppercase">SlideGrid</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#264376] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search works..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-[#264376] focus:ring-4 focus:ring-[#264376]/5 rounded-xl text-xs font-bold transition-all w-64"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#264376] hover:bg-[#264376]/5 transition-all rounded-xl"
          >
            <FolderOpen size={14} /> Import
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".slgrid,.wdzmaga" onChange={handleImport} />
        </div>
      </nav>

      <main className="w-[94%] mx-auto py-10 space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="text-[#264376]" size={20} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Works</h2>
          <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{projects.length}</span>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-4">
          <AnimatePresence mode='popLayout'>
            
            <motion.div 
              layout 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleCreateNew}
              className="group bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center h-[400px] gap-4 cursor-pointer hover:border-[#264376] hover:bg-[#264376]/5 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center text-slate-300 group-hover:text-[#264376] transition-all shadow-sm group-hover:shadow-lg">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">New Project</p>
                <p className="text-[10px] font-medium text-slate-400 italic">Start from scratch</p>
              </div>
            </motion.div>

            {filteredProjects.map((project) => {
              // 核心修复：使用增强版推断函数
              const ratio = getProjectRatio(project);
              const dims = LAYOUT_CONFIG[ratio] || LAYOUT_CONFIG['16:9'];
              const isLandscape = dims.width > dims.height;

              return (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  key={project.id} 
                  onClick={() => navigate(`/editor/${project.id}`)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-[400px]"
                >
                  <div className="h-[300px] bg-slate-50 relative border-b border-slate-50 flex items-center justify-center overflow-hidden p-8">
                    <div 
                      className={`relative bg-white rounded-sm shadow-2xl overflow-hidden transform group-hover:scale-105 transition-all duration-700 border border-slate-100/50 group-hover:rotate-0
                        ${isLandscape ? 'w-full aspect-video rotate-[1deg]' : 'h-full aspect-[2/3] rotate-[-1deg]'}`}
                    >
                      {project.thumbnail ? (
                        <img src={project.thumbnail} className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-all" alt={project.title} />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                          <Layout size={isLandscape ? 64 : 48} />
                        </div>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-30">
                      <button onClick={(e) => handleDelete(project.id, e)} className="p-2 bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 rounded-xl shadow-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={(e) => handleDuplicate(project.id, e)} className="p-2 bg-white/90 backdrop-blur-md text-slate-400 hover:text-[#264376] rounded-xl shadow-lg transition-colors">
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-[#264376]/0 group-hover:bg-[#264376]/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-[#264376] text-white px-5 py-2 rounded-full shadow-xl text-[10px] font-black uppercase tracking-widest scale-90 group-hover:scale-100 transition-transform">Resume</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <h3 className="font-black text-xs uppercase tracking-tight text-slate-900 line-clamp-1 mb-1">{project.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{project.date}</span>
                      <span className="text-[8px] font-black text-[#264376] uppercase px-1.5 py-0.5 bg-[#264376]/5 rounded-md">{project.type}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && searchQuery && (
          <div className="p-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center flex flex-col items-center gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No matching works found</p>
          </div>
        )}
      </main>
    </div>
  );
}