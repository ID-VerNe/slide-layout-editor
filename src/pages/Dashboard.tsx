import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, FolderOpen, Settings, Layout, FileText, Map as MapIcon, Clock, ChevronRight, HardDrive, AlertCircle, Trash2, HelpCircle } from 'lucide-react';
import { nativeFs } from '../utils/native-fs';
import { deleteProject } from '../utils/db';
import { useUI } from '../context/UIContext';

const RECENT_KEY = 'magazine_recent_projects';

export default function Dashboard() {
  const navigate = useNavigate();
  const { alert, confirm } = useUI();
  const { createProject, loadProject, setCurrentFilePath } = useStore();
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // 初始化默认 Workspace
  useEffect(() => {
    const initWorkspace = async () => {
      let savedWorkspace = localStorage.getItem('slidegrid_workspace');
      
      if (nativeFs.isElectron()) {
        const paths = await nativeFs.getAppPaths();
        const defaultWs = (paths as any)?.defaultWorkspace || (paths as any)?.localWorkspace || (paths?.userData ? `${paths.userData}/Projects` : null);
        if (!savedWorkspace || savedWorkspace.endsWith('/Projects') || savedWorkspace.endsWith('\\Projects')) {
          // 优先使用探测到的实际工作区路径（如 ./workspace）
          savedWorkspace = defaultWs;
          if (savedWorkspace) localStorage.setItem('slidegrid_workspace', savedWorkspace);
        }
      }
      
      setWorkspace(savedWorkspace);
    };
    
    initWorkspace();
  }, []);

  const refreshProjects = async () => {
    const uniqueMap = new Map();

    // 1. 如果是 Electron 环境，从物理工作区目录扫描（多源发现）
    if (nativeFs.isElectron()) {
      try {
        const workspaceProjects = await nativeFs.listProjects();
        if (workspaceProjects && workspaceProjects.length > 0) {
          workspaceProjects.forEach(p => {
            const existing = uniqueMap.get(p.id);
            if (!existing || (p.lastModified || 0) > (existing.lastModified || 0)) {
              uniqueMap.set(p.id, p);
            }
          });
        }
      } catch (e) {
        console.error("Failed to scan workspace:", e);
      }
    }

    // 2. 合并 LocalStorage 历史记录 (保证 Web 与迁移记录不丢失)
    const saved = localStorage.getItem(RECENT_KEY);
    if (saved) {
      try { 
        const recent = JSON.parse(saved);
        recent.forEach((p: any) => {
          if (!uniqueMap.has(p.id)) {
            uniqueMap.set(p.id, p);
          }
        });
      } catch (e) {
        console.error("Failed to parse recent localStorage:", e);
      }
    }

    const mergedList = Array.from(uniqueMap.values()).sort((a: any, b: any) => (b.lastModified || 0) - (a.lastModified || 0));
    setProjects(mergedList);

    // 同步写回 LocalStorage 做持久化缓存备份
    if (mergedList.length > 0) {
      localStorage.setItem(RECENT_KEY, JSON.stringify(mergedList.slice(0, 48)));
    }
  };

  useEffect(() => {
    const init = async () => {
      if (workspace) await nativeFs.setActiveWorkspace(workspace);
      await refreshProjects();
    };
    init();
  }, [workspace]);

  const handleSetWorkspace = async () => {
    const result = await nativeFs.selectDirectory();
    if (result.success && result.path) {
      setWorkspace(result.path);
      localStorage.setItem('slidegrid_workspace', result.path);
      await nativeFs.setActiveWorkspace(result.path);
      // 切换目录后立即刷新
      const workspaceProjects = await nativeFs.listProjects();
      const uniqueMap = new Map();
      workspaceProjects.forEach(p => {
        const existing = uniqueMap.get(p.id);
        if (!existing || p.lastModified > existing.lastModified) {
          uniqueMap.set(p.id, p);
        }
      });
      setProjects(Array.from(uniqueMap.values()));
    }
  };

  const handleRemoveRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    confirm('Remove Record', 'Remove this project from recent list?', () => {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const recent = JSON.parse(saved);
        const filtered = recent.filter((p: any) => p.id !== id);
        localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
        setProjects(filtered);
      }
    });
  };

  const handleDeleteProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    confirm('Delete Project', `Permanently delete "${project.title}"? This cannot be undone.`, async () => {
      try {
        if (nativeFs.isElectron() && project.filePath) {
          const result = await nativeFs.deleteProject(project.filePath);
          if (result.success) {
            handleRemoveRecord(e, project.id);
            await refreshProjects();
          } else {
            alert('Delete Failed', `Failed to delete project: ${result.error}`);
          }
        } else {
          await deleteProject(project.id);
          handleRemoveRecord(e, project.id);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Delete Failed', 'Failed to delete project');
      }
    });
  };

  const handleNewProject = () => {
    if (!workspace) {
      alert('Workspace Not Configured', 'Workspace is not initialized. Please restart the application.');
      return;
    }
    const id = createProject("New Slide", 'modern-feature');
    navigate(`/editor/${id}?new=true`);
  };

  const handleOpenProject = async () => {
    if (!workspace) {
      alert('Workspace Not Configured', 'Workspace is not initialized. Please restart the application.');
      return;
    }
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
          filePath: result.filePath
        };
        recent = [entry, ...recent.filter((p: any) => p.id !== projectData.id)].slice(0, 48);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
        setProjects(recent);

        await loadProject(projectData);
        if (result.filePath) setCurrentFilePath(result.filePath);
        navigate(`/editor/${projectData.id}`);
      } catch (e) {
        alert('Open Failed', 'Failed to parse project file.');
      }
    }
  };

  const handleProjectClick = async (project: any) => {
    try {
      if (nativeFs.isElectron() && project.filePath) {
        const result = await nativeFs.readProject(project.filePath);
        if (result.success && result.content) {
          try {
            const projectData = JSON.parse(result.content);
            await loadProject(projectData, null, project.filePath);
            navigate(`/editor/${projectData.id}`);
            return;
          } catch (e) {
            console.error("Failed to parse project from disk", e);
          }
        }
      }
      await loadProject(project.id, null, project.filePath);
      navigate(`/editor/${project.id}`);
    } catch (error) {
      console.error('Failed to open project:', error);
      alert('Open Failed', 'Could not open the selected project.');
    }
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
                  <button onClick={(e) => handleDeleteProject(e, project)} className="absolute top-8 right-8 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all z-10 border border-slate-100"><Trash2 size={16} /></button>
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
