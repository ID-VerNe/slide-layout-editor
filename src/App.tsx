import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
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
