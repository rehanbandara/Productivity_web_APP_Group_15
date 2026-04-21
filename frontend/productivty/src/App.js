import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';

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
import Sidebar from './components/focus-wishwaka/Sidebar';
import Goals from './pages/focus-wishwaka/Goals';
import FocusTimer from './pages/focus-wishwaka/FocusTimer';
import Wellness from './pages/focus-wishwaka/Wellness';

// Settings
import SettingsPage from './pages/SettingsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    secondary: { main: '#3498db' },
    background: { default: '#f8fafc' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        <Box sx={{ display: 'flex' }}>
          
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: 3 }}>
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

              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;