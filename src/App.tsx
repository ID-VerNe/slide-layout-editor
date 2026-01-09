import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';

// 预加载常用模板
const preloadCommonTemplates = () => {
  const commonTemplates = [
    () => import('./components/templates/ModernFeature'),
    () => import('./components/templates/PlatformHero'),
    () => import('./components/templates/TableOfContents'),
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

export default function App() {
  useEffect(() => {
    preloadCommonTemplates();
  }, []);

  console.log('[App] Rendering main structure');
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
