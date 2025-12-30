import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';

export default function App() {
  return (
    <UIProvider>
      <BrowserRouter basename="/magazine">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </UIProvider>
  );
}
