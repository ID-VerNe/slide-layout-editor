import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Layout, FileText, ArrowRight, Trash2, Download, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { saveProject, deleteProjectData, getProject } from '../utils/db';
import { useUI } from '../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../components/ui/BrandLogo';

const TEMPLATES = [
  { 
    id: 'modern-feature', 
    name: 'Modern Feature', 
    category: 'Slide', 
    description: 'Minimalist product feature showcase with bold typography.', 
    previewColor: 'bg-white', 
    previewImage: `${import.meta.env.BASE_URL}/previews/modern.png`
  },
  { 
    id: 'platform-hero', 
    name: 'Platform Hero', 
    category: 'Slide', 
    description: 'Platform landing page with centralized hero and feature grid.', 
    previewColor: 'bg-white', 
    previewImage: `${import.meta.env.BASE_URL}/previews/classic.png`
  },
];

const RECENT_PROJECTS_KEY = 'magazine_recent_projects';

// Custom hook to detect current grid column count based on Tailwind breakpoints
function useGridColumns() {
  const [columns, setColumns] = useState(6);

  const updateColumns = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1280) setColumns(6);
    else if (width >= 1024) setColumns(4);
    else if (width >= 768) setColumns(3);
    else if (width >= 640) setColumns(2);
    else setColumns(1);
  }, []);

  useEffect(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [updateColumns]);

  return columns;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { alert, confirm } = useUI();
  const columns = useGridColumns();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState(false);
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (saved) {
      setRecentProjects(JSON.parse(saved));
    }
  }, []);

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const project = JSON.parse(event.target?.result as string);
        const projectId = `proj-${Date.now()}`;
        await saveProject(projectId, { ...project, id: projectId, lastEdited: new Date().toISOString() });
        const projectSummary = { id: projectId, title: project.pages?.[0]?.titleEn || 'Imported Project', date: new Date().toLocaleDateString(), type: project.pages?.[0]?.layoutId || project.pages?.[0]?.type || 'Imported' };
        const updated = [projectSummary, ...recentProjects];
        setRecentProjects(updated);
        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated.slice(0, 12)));
        navigate(`/editor/${projectId}`);
      } catch (err) {
        alert("Import Error", "Failed to import project.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateNew = (templateId: string) => {
    const newProjectId = `proj-${Date.now()}`;
    navigate(`/editor/${newProjectId}?template=${templateId}`);
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm("Delete Project", "Are you sure?", async () => {
      const updated = recentProjects.filter(p => p.id !== id);
      setRecentProjects(updated);
      localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
      await deleteProjectData(id);
    });
  };

  const duplicateProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const original = await getProject(id);
    if (!original) return;
    const newId = `proj-${Date.now()}`;
    const newProject = { ...original, id: newId, title: `${original.title || 'Untitled'} (Copy)`, lastEdited: new Date().toISOString() };
    await saveProject(newId, newProject);
    const projectSummary = { id: newId, title: newProject.title, date: new Date().toLocaleDateString(), type: original.pages?.[0]?.layoutId || original.pages?.[0]?.type || 'Custom', thumbnail: original.thumbnail || null };
    const updated = [projectSummary, ...recentProjects];
    setRecentProjects(updated);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated.slice(0, 12)));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800 pb-20">
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 pr-8 shadow-sm">
        <div className="flex items-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <BrandLogo className="w-10 h-10" />
          </div>
          <span className="font-black text-lg tracking-widest text-slate-900 uppercase ml-2">SlideGrid</span>
        </div>
      </nav>

      <main className="w-[94%] mx-auto py-6 space-y-10">
        
        {/* Recent Works Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="text-[#264376]" size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Works</h2>
            </div>
            <div className="flex items-center gap-4">
              {recentProjects.length > columns && (
                <button onClick={() => setIsRecentExpanded(!isRecentExpanded)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#264376] transition-all">
                  {isRecentExpanded ? 'Show One Row' : `View All (${recentProjects.length})`}
                </button>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#264376] hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <Download size={12} /> Import
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".wdzmaga" onChange={handleImportProject} />
            </div>
          </div>

          <div className={`transition-all duration-500 overflow-hidden ${!isRecentExpanded ? 'max-h-[410px]' : 'max-h-[2000px]'}`}>
            {recentProjects.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-4">
                <AnimatePresence mode='popLayout'>
                  {recentProjects.map((project) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={project.id} onClick={() => navigate(`/editor/${project.id}`)}
                      className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-[400px]"
                    >
                      <div className="h-[300px] bg-slate-50 relative border-b border-slate-50 flex items-center justify-center overflow-hidden">
                        <div className="relative w-44 h-[248px] bg-white rounded-sm shadow-2xl overflow-hidden transform rotate-[-1deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-700 border border-slate-100/50">
                          {project.thumbnail ? <img src={project.thumbnail} className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-all" alt={project.title} /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><FileText size={48} /></div>}
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-30">
                          <button onClick={(e) => { e.stopPropagation(); deleteProject(project.id, e); }} className="p-2 bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 rounded-xl shadow-lg"><Trash2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateProject(project.id, e); }} className="p-2 bg-white/90 backdrop-blur-md text-slate-400 hover:text-[#264376] rounded-xl shadow-lg"><Copy size={16} /></button>
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
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="p-20 bg-white rounded-3xl border border-slate-100 border-dashed text-center flex flex-col items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Archive Empty</p>
              </div>
            )}
          </div>
        </section>

        {/* New Project Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-slate-900">
              <Plus className="text-[#264376]" size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">New Project</h2>
            </div>
            {TEMPLATES.length > columns && (
              <button onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#264376] bg-white border border-slate-200 rounded-xl hover:border-[#264376] transition-all shadow-sm active:scale-95">
                {isTemplatesExpanded ? 'Show One Row' : `View All Templates (${TEMPLATES.length})`}
              </button>
            )}
          </div>

          <div className={`transition-all duration-500 overflow-hidden ${!isTemplatesExpanded ? 'max-h-[410px]' : 'max-h-[2000px]'}`}>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-4">
              <AnimatePresence mode='popLayout'>
                {TEMPLATES.map((template) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key={template.id} onClick={() => handleCreateNew(template.id)}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-[400px]"
                  >
                    <div className="h-[300px] bg-white relative border-b border-slate-50 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-4 left-4 z-20">
                        <span className={`px-2 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest shadow-sm ${template.category === 'Cover' ? 'bg-slate-900 text-white' : 'bg-#264376 text-white'}`}>{template.category}</span>
                      </div>
                      <div className="relative w-44 h-[248px] bg-white rounded-sm shadow-2xl overflow-hidden transform rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-700 border border-slate-100/50">
                        <img src={template.previewImage} className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-all" alt={template.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x565?text=Template'; }} />
                      </div>
                      <div className="absolute inset-0 bg-[#264376]/0 group-hover:bg-[#264376]/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-[#264376] text-white px-6 py-2.5 rounded-full shadow-2xl text-[10px] font-black uppercase tracking-widest">Select</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 font-medium italic">{template.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}
