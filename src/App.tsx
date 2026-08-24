import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NotesPage } from './pages/NotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { TopicsPage } from './pages/TopicsPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { LabsPage } from './pages/LabsPage';
import { LabDetailPage } from './pages/LabDetailPage';
import { BoardPage } from './pages/BoardPage';
import { MonitorPage } from './pages/MonitorPage';
import { AssistantPage } from './pages/AssistantPage';
import { TutorPage } from './pages/TutorPage';
import { AIAgentPage } from './pages/AIAgentPage';
import { DataJourneyPage } from './pages/DataJourneyPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TopicCreatorPage } from './pages/TopicCreatorPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AppProvider>
  );
};
