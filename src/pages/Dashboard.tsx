import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, FolderOpen, Settings, Layout, FileText, Map as MapIcon, Clock, ChevronRight, HardDrive, AlertCircle, Trash2, HelpCircle } from 'lucide-react';
import { nativeFs } from '../utils/native-fs';

const RECENT_KEY = 'magazine_recent_projects';

export default function Dashboard() {
  const navigate = useNavigate();
  const { createProject, loadProject, setCurrentFilePath } = useStore();
  const [workspace, setWorkspace] = useState<string | null>(localStorage.getItem('slidegrid_workspace'));
  const [projects, setProjects] = useState<any[]>([]);

  const refreshProjects = () => {
    const saved = localStorage.getItem(RECENT_KEY);
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch (e) { setProjects([]); }
    }
  };

  useEffect(() => {
    refreshProjects();
    if (workspace) nativeFs.setActiveWorkspace(workspace);
  }, []);

  const handleSetWorkspace = async () => {
    const result = await nativeFs.selectDirectory();
    if (result.success && result.path) {
      setWorkspace(result.path);
      localStorage.setItem('slidegrid_workspace', result.path);
      await nativeFs.setActiveWorkspace(result.path);
    }
  };

  const handleRemoveRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remove this project from recent list?")) {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const recent = JSON.parse(saved);
        const filtered = recent.filter((p: any) => p.id !== id);
        localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
        setProjects(filtered);
      }
    }
  };

  const handleNewProject = () => {
    if (!workspace) { alert("Please set a Workspace directory first."); return; }
    const id = createProject("New Slide", 'standard');
    navigate(`/editor/${id}?new=true`);
  };

  const handleOpenProject = async () => {
    if (!workspace) { alert("Please set a Workspace directory first."); return; }
    const result = await nativeFs.openProject();
    if (result.success && result.content) {
      try {
        const projectData = JSON.parse(result.content);
        if (!projectData.id) projectData.id = crypto.randomUUID();
        
        const saved = localStorage.getItem(RECENT_KEY);
        let recent = saved ? JSON.parse(saved) : [];
        const entry = {
          id: projectData.id,
          title: projectData.projectTitle || projectData.title || 'Imported Project',
          date: new Date().toLocaleDateString(),
          lastModified: Date.now(),
          type: projectData.pages?.[0]?.layoutId || 'standard',
          aspectRatio: projectData.pages?.[0]?.aspectRatio || '16:9',
          thumbnail: projectData.thumbnail || null,
          filePath: result.filePath // 核心修复：记录物理文件路径
        };
        recent = [entry, ...recent.filter((p: any) => p.id !== projectData.id)].slice(0, 48);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
        setProjects(recent);

        // 先加载数据，再显式设置路径
        await loadProject(projectData);
        if (result.filePath) setCurrentFilePath(result.filePath);
        
        navigate(`/editor/${projectData.id}`);
      } catch (e) { alert("Failed to parse project file."); }
    }
  };

  const handleProjectClick = async (project: any) => {
    // 关键修复：直接调用 loadProject 并在跳转前锁定路径
    await loadProject(project.id, null, project.filePath);
    navigate(`/editor/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#264376] rounded-xl flex items-center justify-center shadow-lg shadow-[#264376]/20">
              <Layout size={20} className="text-white" />
            </div>
            <span className="text-base font-black uppercase tracking-tighter text-slate-900">SlideGrid Studio</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button onClick={handleNewProject} className="flex items-center gap-2 px-5 py-2.5 bg-[#264376] text-white rounded-[0.9rem] shadow-lg shadow-[#264376]/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">
              <Plus size={14} /> New Slide
            </button>
            <button onClick={handleOpenProject} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-[0.9rem] hover:bg-slate-100 transition-all text-[10px] font-black uppercase tracking-widest">
              <FolderOpen size={14} /> Open Archive
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSetWorkspace} className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${workspace ? 'bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900' : 'bg-amber-50 border-amber-200 text-amber-600 ring-4 ring-amber-500/10'}`}>
            <HardDrive size={14} className={workspace ? 'text-slate-300' : 'text-amber-500'} />
            {workspace ? `Workspace: ${workspace.split('\\').pop()}` : 'Setup Workspace'}
          </button>
          <div className="h-6 w-px bg-slate-100 mx-2" />
          <div className="flex items-center gap-1">
            <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><HelpCircle size={20} /></button>
            <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><Settings size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-12 space-y-10">
        {!workspace && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20"><AlertCircle size={24} /></div>
              <div><h4 className="text-sm font-black text-amber-900 uppercase">Workspace Not Configured</h4><p className="text-xs text-amber-700/70 font-medium">To enable asset persistence and SLGRID exports, please choose a folder as your workspace.</p></div>
            </div>
            <button onClick={handleSetWorkspace} className="px-8 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Configure Now</button>
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4"><h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">Recent Projects</h2><span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black">{projects.length} Files</span></div>
          </div>

          {projects.length === 0 ? (
            <div className="h-96 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-slate-300 grayscale opacity-50 bg-white"><Layout size={64} strokeWidth={1} /><div className="text-center space-y-2"><p className="text-xs font-black uppercase tracking-widest">No projects found</p><p className="text-[10px] font-bold">Start by creating a new slide in the navigation bar above.</p></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {projects.map(project => (
                <div key={project.id} onClick={() => handleProjectClick(project)} className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:border-[#264376] hover:shadow-2xl hover:shadow-[#264376]/5 transition-all cursor-pointer flex flex-col h-full">
                  <button onClick={(e) => handleRemoveRecord(e, project.id)} className="absolute top-8 right-8 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all z-10 border border-slate-100"><Trash2 size={16} /></button>
                  <div className="aspect-[3/4] bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-50 relative shrink-0">
                    {project.thumbnail ? <img src={project.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center opacity-5 bg-gradient-to-br from-slate-900 to-transparent"><Layout size={64} /></div>}
                    <div className="absolute inset-0 bg-[#264376]/0 group-hover:bg-[#264376]/5 transition-colors" />
                  </div>
                  <div className="flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 mb-1.5 line-clamp-2 leading-tight uppercase">{project.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Edited {project.date}</p>
                      {project.filePath && <p className="text-[7px] text-slate-300 truncate mt-1 max-w-full opacity-0 group-hover:opacity-100 transition-opacity">Mapped to slgrid</p>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex gap-1.5"><span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase">{project.aspectRatio}</span></div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#264376] group-hover:text-white transition-all"><ChevronRight size={16} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
