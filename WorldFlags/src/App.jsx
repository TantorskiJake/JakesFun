import { useState, useEffect, useCallback } from 'react';
import { useProgress } from './hooks/useProgress.js';
import { useStreak } from './hooks/useStreak.js';
import { useProfileSync } from './hooks/useProfileSync.js';
import { buildSession, buildTrickySession, buildReviewSession } from './hooks/useQuiz.js';
import { countries } from './data/countries.js';
import { masteryLevel, isDue } from './utils/sm2.js';
import { checkBadges } from './data/badges.js';
import Header from './components/Header.jsx';
import HomeView from './components/HomeView.jsx';
import QuizView from './components/QuizView.jsx';
import StatsView from './components/StatsView.jsx';
import WorldMapView from './components/WorldMapView.jsx';
import SettingsView from './components/SettingsView.jsx';
import Confetti from './components/Confetti.jsx';
import BadgeUnlock from './components/BadgeUnlock.jsx';

const DARK_KEY = 'world-flags-dark-mode';
const QUIZ_MODE_KEY = 'world-flags-quiz-mode';
const BADGES_KEY = 'world-flags-badges-v1';
const SIZE_KEY = 'world-flags-session-size';

function loadDark() {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return true;
}

function loadQuizMode() {
  const stored = localStorage.getItem(QUIZ_MODE_KEY);
  return ['classic', 'reverse', 'typing', 'capitals', 'confusables'].includes(stored) ? stored : 'classic';
}

function loadEarned() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); } catch { return []; }
}

function loadSessionSize() {
  return parseInt(localStorage.getItem(SIZE_KEY) || '20', 10);
}

export default function App() {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(loadDark);
  const [quizMode, setQuizMode] = useState(loadQuizMode);
  const [sessionSize, setSessionSize] = useState(loadSessionSize);
  const [selectedRegions, setSelectedRegions] = useState(['all']);
  const [session, setSession] = useState([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState(loadEarned);
  const [newBadges, setNewBadges] = useState([]);

  const { progress, recordAnswer, resetProgress, replaceProgress } = useProgress();
  const streak = useStreak();
  const profile = useProfileSync({
    progress,
    streakData: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastPracticeDate: streak.lastPracticeDate,
      totalXP: streak.totalXP,
      level: streak.level,
    },
    replaceProgress,
    replaceStreak: streak.replaceStreak,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(DARK_KEY, String(darkMode));
  }, [darkMode]);

  const handleToggleDark = useCallback(() => setDarkMode(d => !d), []);

  const handleSetQuizMode = useCallback((mode) => {
    setQuizMode(mode);
    localStorage.setItem(QUIZ_MODE_KEY, mode);
  }, []);

  const handleSetSessionSize = useCallback((s) => {
    setSessionSize(s);
    localStorage.setItem(SIZE_KEY, String(s));
  }, []);

  const handleNavigate = useCallback((target) => {
    setView(target);
    if (target === 'home') {
      setSession([]);
      setSessionIndex(0);
      setSessionResults([]);
      setShowConfetti(false);
    }
  }, []);

  const startSession = useCallback((regions = selectedRegions, mode = quizMode, size = sessionSize) => {
    const isConfusables = mode === 'confusables';
    const s = buildSession(regions, progress, size, isConfusables);
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setShowConfetti(false);
    setView('quiz');
  }, [selectedRegions, quizMode, sessionSize, progress]);

  const handleStartQuiz = useCallback(() => {
    startSession();
  }, [startSession]);

  const handleMapPractice = useCallback((regions) => {
    setSelectedRegions(regions);
    startSession(regions, quizMode, sessionSize);
  }, [startSession, quizMode, sessionSize]);

  const handleStartTrickyDrill = useCallback(() => {
    const s = buildTrickySession(progress, selectedRegions);
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setShowConfetti(false);
    setView('quiz');
  }, [progress, selectedRegions]);

  const handleReviewMissed = useCallback((codes) => {
    const s = buildReviewSession(codes);
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setShowConfetti(false);
    setView('quiz');
  }, []);

  const handleAnswer = useCallback((code, correct) => {
    recordAnswer(code, correct);
    setSessionResults(prev => [...prev, { code, correct }]);
  }, [recordAnswer]);

  const handleNext = useCallback(() => setSessionIndex(i => i + 1), []);

  const handleDone = useCallback(() => {
    setSessionIndex(s => s + 1);
  }, []);

  const handleSessionComplete = useCallback((correct, total) => {
    streak.recordSession(correct, total);

    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    if (pct >= 80) setShowConfetti(true);

    // Check for new badges using latest progress from state
    setEarnedBadges(prev => {
      const results = Array.from({ length: total }, (_, i) => ({ correct: i < correct }));
      const newly = checkBadges(progress, streak.currentStreak + 1, results, prev);
      if (newly.length > 0) {
        const updated = [...prev, ...newly.map(b => b.id)];
        localStorage.setItem(BADGES_KEY, JSON.stringify(updated));
        setNewBadges(newly);
        return updated;
      }
      return prev;
    });
  }, [streak, progress]);

  const dueCount = countries.filter(c => isDue(progress[c.code])).length;
  const masteredCount = countries.filter(c => masteryLevel(progress[c.code]) === 3).length;

  return (
    <div id="app" data-theme={darkMode ? 'dark' : 'light'}>
      <Confetti active={showConfetti} />
      <BadgeUnlock badges={newBadges} onDismiss={() => setNewBadges([])} />
      <Header
        view={view}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={handleToggleDark}
        streak={streak.currentStreak}
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
            streak={streak}
            quizMode={quizMode}
            onQuizModeChange={handleSetQuizMode}
            sessionSize={sessionSize}
            onSessionSizeChange={handleSetSessionSize}
          />
        )}
        {view === 'quiz' && (
          <QuizView
            session={session}
            sessionIndex={sessionIndex}
            sessionResults={sessionResults}
            progress={progress}
            selectedRegions={selectedRegions}
            quizMode={quizMode}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onDone={handleDone}
            onSessionComplete={handleSessionComplete}
            onHome={() => handleNavigate('home')}
            onRestartQuiz={handleStartQuiz}
            onReviewMissed={handleReviewMissed}
          />
        )}
        {view === 'stats' && (
          <StatsView
            progress={progress}
            earnedBadges={earnedBadges}
            streak={streak}
          />
        )}
        {view === 'map' && (
          <WorldMapView
            progress={progress}
            onPracticeRegions={handleMapPractice}
          />
        )}
        {view === 'settings' && (
          <SettingsView
            profile={profile}
            darkMode={darkMode}
            onToggleDark={handleToggleDark}
            quizMode={quizMode}
            onQuizModeChange={handleSetQuizMode}
            sessionSize={sessionSize}
            onSessionSizeChange={handleSetSessionSize}
            selectedRegions={selectedRegions}
            onRegionsChange={setSelectedRegions}
            onResetProgress={resetProgress}
          />
        )}
      </main>
    </div>
  );
}
