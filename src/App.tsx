import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { nativeFs } from './utils/native-fs';

// @lat: [[app]]
export default function App() {
  useEffect(() => {
    // 应用启动时立即同步工作区路径到主进程
    // 解决刷新编辑器页面或重启开发服务器后资产路径丢失的问题
    const savedWorkspace = localStorage.getItem('slidegrid_workspace');
    if (savedWorkspace && nativeFs.isElectron()) {
      nativeFs.setActiveWorkspace(savedWorkspace);
    }
  }, []);

  return (
    <UIProvider>
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
