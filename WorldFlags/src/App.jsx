import { useState, useEffect, useCallback } from 'react';
import { useProgress } from './hooks/useProgress.js';
import { buildSession, buildTrickySession } from './hooks/useQuiz.js';
import { countries } from './data/countries.js';
import { masteryLevel, isDue } from './utils/sm2.js';
import Header from './components/Header.jsx';
import HomeView from './components/HomeView.jsx';
import QuizView from './components/QuizView.jsx';
import StatsView from './components/StatsView.jsx';

const DARK_KEY = 'world-flags-dark-mode';

function loadDark() {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return true; // default dark
}

export default function App() {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(loadDark);
  const [selectedRegions, setSelectedRegions] = useState(['all']);
  const [session, setSession] = useState([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);

  const { progress, recordAnswer, resetProgress } = useProgress();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(DARK_KEY, String(darkMode));
  }, [darkMode]);

  const handleToggleDark = useCallback(() => {
    setDarkMode(d => !d);
  }, []);

  const handleNavigate = useCallback((target) => {
    setView(target);
    if (target === 'home') {
      setSession([]);
      setSessionIndex(0);
      setSessionResults([]);
    }
  }, []);

  const handleStartQuiz = useCallback(() => {
    const s = buildSession(selectedRegions, progress);
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setView('quiz');
  }, [selectedRegions, progress]);

  const handleStartTrickyDrill = useCallback(() => {
    const s = buildTrickySession(progress, selectedRegions);
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setView('quiz');
  }, [progress, selectedRegions]);

  const handleAnswer = useCallback((code, correct) => {
    recordAnswer(code, correct);
    setSessionResults(prev => [...prev, { code, correct }]);
  }, [recordAnswer]);

  const handleNext = useCallback(() => {
    setSessionIndex(i => i + 1);
  }, []);

  const handleDone = useCallback(() => {
    // Stay in quiz view to show results — QuizView handles this
    setSessionIndex(session.length);
  }, [session.length]);

  // Derived stats for HomeView
  const dueCount = countries.filter(c => isDue(progress[c.code])).length;
  const masteredCount = countries.filter(c => masteryLevel(progress[c.code]) === 3).length;

  return (
    <div id="app" data-theme={darkMode ? 'dark' : 'light'}>
      <Header
        view={view}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={handleToggleDark}
      />
      <main className="main-content">
        {view === 'home' && (
          <HomeView
            dueCount={dueCount}
            masteredCount={masteredCount}
            totalCount={countries.length}
            selectedRegions={selectedRegions}
            onRegionsChange={setSelectedRegions}
            onStartQuiz={handleStartQuiz}
            onStartTrickyDrill={handleStartTrickyDrill}
            onResetProgress={resetProgress}
            progress={progress}
          />
        )}
        {view === 'quiz' && (
          <QuizView
            session={session}
            sessionIndex={sessionIndex}
            sessionResults={sessionResults}
            progress={progress}
            selectedRegions={selectedRegions}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onDone={handleDone}
            onHome={() => handleNavigate('home')}
            onRestartQuiz={handleStartQuiz}
          />
        )}
        {view === 'stats' && (
          <StatsView
            progress={progress}
          />
        )}
      </main>
    </div>
  );
}
