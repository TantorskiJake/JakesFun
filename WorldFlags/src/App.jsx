import { useState, useEffect, useCallback } from 'react';
import { useProgress } from './hooks/useProgress.js';
import { useStreak } from './hooks/useStreak.js';
import { buildSession } from './hooks/useQuiz.js';
import { countries } from './data/countries.js';
import { masteryLevel, isDue } from './utils/sm2.js';
import { checkBadges } from './data/badges.js';
import Header from './components/Header.jsx';
import HomeView from './components/HomeView.jsx';
import QuizView from './components/QuizView.jsx';
import StatsView from './components/StatsView.jsx';
import Confetti from './components/Confetti.jsx';
import BadgeUnlock from './components/BadgeUnlock.jsx';

const DARK_KEY = 'world-flags-dark-mode';
const BADGES_KEY = 'world-flags-badges-v1';
const SIZE_KEY = 'world-flags-session-size';
const MODE_KEY = 'world-flags-mode';

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
};

export default function App() {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(() => load(DARK_KEY, true));
  const [selectedRegions, setSelectedRegions] = useState(['all']);
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'normal');
  const [sessionSize, setSessionSize] = useState(() => load(SIZE_KEY, 20));
  const [session, setSession] = useState([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState(() => load(BADGES_KEY, []));
  const [newBadges, setNewBadges] = useState([]);

  const { progress, recordAnswer, resetProgress } = useProgress();
  const { streak, recordStudy } = useStreak();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(DARK_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  const handleToggleDark = useCallback(() => setDarkMode(d => !d), []);

  const handleSetMode = useCallback((m) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  }, []);

  const handleSetSessionSize = useCallback((s) => {
    setSessionSize(s);
    localStorage.setItem(SIZE_KEY, JSON.stringify(s));
  }, []);

  const handleNavigate = useCallback((target) => {
    setView(target);
    if (target === 'home') {
      setSession([]);
      setSessionIndex(0);
      setShowConfetti(false);
    }
  }, []);

  const handleStartQuiz = useCallback(() => {
    const s = buildSession(selectedRegions, progress, sessionSize, mode === 'confusables');
    if (s.length === 0) return;
    setSession(s);
    setSessionIndex(0);
    setShowConfetti(false);
    setView('quiz');
  }, [selectedRegions, progress, sessionSize, mode]);

  const handleAnswer = useCallback((code, correct) => {
    recordAnswer(code, correct);
  }, [recordAnswer]);

  const handleNext = useCallback(() => setSessionIndex(i => i + 1), []);

  // Called by QuizView with the final results array when session ends
  const handleDone = useCallback((results) => {
    setSessionIndex(s => s + 1); // triggers isDone in QuizView
    recordStudy();

    const correct = results.filter(r => r.correct).length;
    const pct = results.length === 0 ? 0 : Math.round((correct / results.length) * 100);
    if (pct >= 80) setShowConfetti(true);

    // Check for newly earned badges (progress state is current here via closure)
    setEarnedBadges(prev => {
      const newStreak = streak + (streak === 0 ? 1 : 1); // approximate; real value updates async
      const newly = checkBadges(progress, newStreak, results, prev);
      if (newly.length > 0) {
        const updated = [...prev, ...newly.map(b => b.id)];
        localStorage.setItem(BADGES_KEY, JSON.stringify(updated));
        setNewBadges(newly);
        return updated;
      }
      return prev;
    });
  }, [recordStudy, streak, progress]);

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
        streak={streak}
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
            onResetProgress={resetProgress}
            progress={progress}
            mode={mode}
            onModeChange={handleSetMode}
            sessionSize={sessionSize}
            onSessionSizeChange={handleSetSessionSize}
            streak={streak}
          />
        )}
        {view === 'quiz' && (
          <QuizView
            key={session.map(c => c.code).join(',')}
            session={session}
            sessionIndex={sessionIndex}
            progress={progress}
            selectedRegions={selectedRegions}
            mode={mode}
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
            earnedBadges={earnedBadges}
            streak={streak}
          />
        )}
      </main>
    </div>
  );
}
