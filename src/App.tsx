import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const NotesPage = React.lazy(() => import('./pages/NotesPage').then(module => ({ default: module.NotesPage })));
const NoteDetailPage = React.lazy(() => import('./pages/NoteDetailPage').then(module => ({ default: module.NoteDetailPage })));
import { TopicsPage } from './pages/TopicsPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { LabsPage } from './pages/LabsPage';
import { LabDetailPage } from './pages/LabDetailPage';
const BoardPage = React.lazy(() => import('./pages/BoardPage').then(module => ({ default: module.BoardPage })));
import { MonitorPage } from './pages/MonitorPage';
import { AssistantPage } from './pages/AssistantPage';
import { TutorPage } from './pages/TutorPage';
import { AIAgentPage } from './pages/AIAgentPage';
import { DataJourneyPage } from './pages/DataJourneyPage';
import { TemplatesPage } from './pages/TemplatesPage';
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const TopicCreatorPage = React.lazy(() => import('./pages/TopicCreatorPage').then(module => ({ default: module.TopicCreatorPage })));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-background space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-primary tracking-widest uppercase animate-pulse">Syncing Mimiryx Subsystems...</span>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="notes/:id" element={<NoteDetailPage />} />
                <Route path="topics" element={<TopicsPage />} />
                <Route path="topics/:id" element={<TopicDetailPage />} />
                <Route path="labs" element={<LabsPage />} />
                <Route path="labs/:id" element={<LabDetailPage />} />
                <Route path="board" element={<BoardPage />} />
                <Route path="monitor" element={<MonitorPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="tutor" element={<TutorPage />} />
                <Route path="agent" element={<AIAgentPage />} />
                <Route path="data-journey" element={<DataJourneyPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="progress" element={<AnalyticsPage />} />
                <Route path="creator" element={<TopicCreatorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};
