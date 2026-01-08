import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';

/**
 * App 根组件
 * 核心修复：迁移至 HashRouter 以支持 Electron 的 file:// 协议
 */
export default function App() {
  return (
    <UIProvider>
      {/* 移除 basename，HashRouter 不需要它 */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
        </Routes>
      </HashRouter>
    </UIProvider>
  );
}