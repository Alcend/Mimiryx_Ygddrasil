import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Dynamic route-level code splitting for all pages
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const NotesPage = React.lazy(() => import('./pages/NotesPage').then(m => ({ default: m.NotesPage })));
const NoteDetailPage = React.lazy(() => import('./pages/NoteDetailPage').then(m => ({ default: m.NoteDetailPage })));
const TopicsPage = React.lazy(() => import('./pages/TopicsPage').then(m => ({ default: m.TopicsPage })));
const TopicDetailPage = React.lazy(() => import('./pages/TopicDetailPage').then(m => ({ default: m.TopicDetailPage })));
const LabsPage = React.lazy(() => import('./pages/LabsPage').then(m => ({ default: m.LabsPage })));
const LabDetailPage = React.lazy(() => import('./pages/LabDetailPage').then(m => ({ default: m.LabDetailPage })));
const BoardPage = React.lazy(() => import('./pages/BoardPage').then(m => ({ default: m.BoardPage })));
const MonitorPage = React.lazy(() => import('./pages/MonitorPage').then(m => ({ default: m.MonitorPage })));
const AssistantPage = React.lazy(() => import('./pages/AssistantPage').then(m => ({ default: m.AssistantPage })));
const TutorPage = React.lazy(() => import('./pages/TutorPage').then(m => ({ default: m.TutorPage })));
const AIAgentPage = React.lazy(() => import('./pages/AIAgentPage').then(m => ({ default: m.AIAgentPage })));
const DataJourneyPage = React.lazy(() => import('./pages/DataJourneyPage').then(m => ({ default: m.DataJourneyPage })));
const TemplatesPage = React.lazy(() => import('./pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const TopicCreatorPage = React.lazy(() => import('./pages/TopicCreatorPage').then(m => ({ default: m.TopicCreatorPage })));

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
