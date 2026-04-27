import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Smart Notes
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/notes-chamod/NotesPage';
import NoteEditorPage from './pages/notes-chamod/NoteEditorPage';
import TopicsPage from './pages/notes-chamod/TopicsPage';
import TagsPage from './pages/notes-chamod/TagsPage';

// Other Features
import VideoNotesPage from './pages/VideoNotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';

// Focus System
import Goals from './pages/focus-wishwaka/Goals';
import FocusTimer from './pages/focus-wishwaka/FocusTimer';
import Wellness from './pages/focus-wishwaka/Wellness';

// Planner (Rehan)
import PlannerDashboard from './pages/planner-rehan/Dashboard';

// Settings
import SettingsPage from './pages/SettingsPage';

// Layout
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Notes */}
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NoteEditorPage isNew />} />
        <Route path="/notes/:id" element={<NoteEditorPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/tags" element={<TagsPage />} />

        {/* Learning */}
        <Route path="/video-notes" element={<VideoNotesPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />

        {/* Focus */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/focus-timer" element={<FocusTimer />} />
        <Route path="/wellness" element={<Wellness />} />

        {/* Planner */}
        <Route path="/planner" element={<PlannerDashboard />} />
        <Route path="/planner/*" element={<PlannerDashboard />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;