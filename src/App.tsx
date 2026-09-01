import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { nativeFs } from './utils/native-fs';

// 预加载常用模板
const preloadCommonTemplates = () => {
  const commonTemplates = [
    () => import('./templates/schemas/Universal-Product/modern-feature'),
    () => import('./templates/schemas/Universal-Marketing/platform-hero'),
    () => import('./templates/schemas/Universal-General/table-of-contents'),
  ];
  
  // 使用 requestIdleCallback 或 setTimeout 来在空闲时预加载
  const loader = () => {
    commonTemplates.forEach(importFn => {
      importFn().catch(err => console.warn('Failed to preload template:', err));
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(loader);
  } else {
    setTimeout(loader, 2000);
  }
};

// @lat: [[app]]
export default function App() {
  useEffect(() => {
    preloadCommonTemplates();

    // 核心修复：应用启动时立即同步 Workspace 到主进程
    // 解决刷新编辑器页面或重启开发服务器后资产路径丢失的问题
    const savedWorkspace = localStorage.getItem('slidegrid_workspace');
    if (savedWorkspace && nativeFs.isElectron()) {
      nativeFs.setActiveWorkspace(savedWorkspace);
    }
  }, []);

  return (
    <UIProvider>
      {/* @ts-ignore */}
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </UIProvider>
  );
}
