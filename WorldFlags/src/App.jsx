import { useState, useEffect, useCallback } from 'react';
import { useProgress } from './hooks/useProgress.js';
import { useStreak } from './hooks/useStreak.js';
import { useProfileSync } from './hooks/useProfileSync.js';
import { buildSession, buildTrickySession, buildReviewSession } from './hooks/useQuiz.js';
import { countries } from './data/countries.js';
import { MAP_CODES } from './data/mapCodes.js';
import { masteryLevel, isDue } from './utils/sm2.js';
import { checkBadges } from './data/badges.js';
import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
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
const REGIONS_KEY = 'world-flags-regions';

function loadDark() {
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return true;
}

function loadQuizMode() {
  const stored = localStorage.getItem(QUIZ_MODE_KEY);
  return ['classic', 'reverse', 'typing', 'capitals', 'confusables', 'map'].includes(stored) ? stored : 'classic';
}

// Countries without a shape in the world-atlas topology (tiny islands and
// microstates) can't be answered in map mode, so drop them from the session.
function filterForMode(session, mode) {
  return mode === 'map' ? session.filter(c => MAP_CODES.has(c.code)) : session;
}

function loadEarned() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); } catch { return []; }
}

function loadSessionSize() {
  return parseInt(localStorage.getItem(SIZE_KEY) || '20', 10);
}

function loadRegions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REGIONS_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(r => typeof r === 'string')) {
      return parsed;
    }
  } catch { /* fall through */ }
  return ['all'];
}

export default function App() {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(loadDark);
  const [quizMode, setQuizMode] = useState(loadQuizMode);
  const [sessionSize, setSessionSize] = useState(loadSessionSize);
  const [selectedRegions, setSelectedRegions] = useState(loadRegions);
  const [session, setSession] = useState([]);
  const [sessionType, setSessionType] = useState('normal');
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState(loadEarned);
  const [newBadges, setNewBadges] = useState([]);
  const [freezeNotice, setFreezeNotice] = useState(false);

  const { progress, recordAnswer, recordReviewAnswer, resetProgress, replaceProgress } = useProgress();
  const streak = useStreak();
  const profile = useProfileSync({
    progress,
    streakData: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastPracticeDate: streak.lastPracticeDate,
      totalXP: streak.totalXP,
      level: streak.level,
      freezes: streak.freezes,
      freezesEarned: streak.freezesEarned,
      weeklyXP: streak.weeklyXP,
      weekStart: streak.weekStart,
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

  const handleSetRegions = useCallback((regions) => {
    setSelectedRegions(regions);
    localStorage.setItem(REGIONS_KEY, JSON.stringify(regions));
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
    const s = filterForMode(buildSession(regions, progress, size, isConfusables), mode);
    if (s.length === 0) return;
    setSessionType('normal');
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
    handleSetRegions(regions);
    startSession(regions, quizMode, sessionSize);
  }, [startSession, quizMode, sessionSize, handleSetRegions]);

  const handleStartTrickyDrill = useCallback(() => {
    const s = filterForMode(buildTrickySession(progress, selectedRegions), quizMode);
    if (s.length === 0) return;
    setSessionType('normal');
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setShowConfetti(false);
    setView('quiz');
  }, [progress, selectedRegions, quizMode]);

  const handleReviewMissed = useCallback((codes) => {
    const s = buildReviewSession(codes);
    if (s.length === 0) return;
    setSessionType('review');
    setSession(s);
    setSessionIndex(0);
    setSessionResults([]);
    setShowConfetti(false);
    setView('quiz');
  }, []);

  const handleAnswer = useCallback((code, correct) => {
    if (sessionType === 'review') {
      // Review sessions track accuracy but don't advance the SM-2 schedule
      recordReviewAnswer(code, correct);
    } else {
      recordAnswer(code, correct);
    }
    setSessionResults(prev => [...prev, { code, correct }]);
  }, [recordAnswer, recordReviewAnswer, sessionType]);

  const handleNext = useCallback(() => setSessionIndex(i => i + 1), []);

  const handleDone = useCallback(() => {
    setSessionIndex(s => s + 1);
  }, []);

  // Auto-dismiss the streak-freeze notice after a few seconds
  useEffect(() => {
    if (!freezeNotice) return undefined;
    const timer = setTimeout(() => setFreezeNotice(false), 6000);
    return () => clearTimeout(timer);
  }, [freezeNotice]);

  const handleSessionComplete = useCallback((correct, total, results = []) => {
    // Review sessions don't award XP, extend the streak, or unlock badges
    if (sessionType === 'review') return;

    const newStreakData = streak.recordSession(correct, total);
    if (newStreakData?.freezeConsumed) setFreezeNotice(true);

    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    if (pct >= 80) setShowConfetti(true);

    // Check for new badges using latest progress from state
    setEarnedBadges(prev => {
      const newly = checkBadges(progress, newStreakData.currentStreak, results, prev);
      if (newly.length > 0) {
        const updated = [...prev, ...newly.map(b => b.id)];
        localStorage.setItem(BADGES_KEY, JSON.stringify(updated));
        setNewBadges(newly);
        return updated;
      }
      return prev;
    });
  }, [streak, progress, sessionType]);

  const dueCount = countries.filter(c => isDue(progress[c.code])).length;
  const masteredCount = countries.filter(c => masteryLevel(progress[c.code]) === 3).length;

  return (
    <div id="app" data-theme={darkMode ? 'dark' : 'light'}>
      <Confetti active={showConfetti} />
      <BadgeUnlock badges={newBadges} onDismiss={() => setNewBadges([])} />
      {freezeNotice && (
        <div className="freeze-toast" role="status">
          <span className="freeze-toast-icon" aria-hidden="true">❄️</span>
          <div>
            <strong>Streak freeze used</strong>
            <p>You missed a day, but a freeze kept your streak alive.</p>
          </div>
          <button
            className="freeze-toast-close"
            onClick={() => setFreezeNotice(false)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      <Header
        view={view}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={handleToggleDark}
        streak={streak.currentStreak}
        freezes={streak.freezes}
      />
      <main className="main-content">
        {view === 'home' && (
          <HomeView
            dueCount={dueCount}
            masteredCount={masteredCount}
            totalCount={countries.length}
            selectedRegions={selectedRegions}
            onRegionsChange={handleSetRegions}
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
            sessionType={sessionType}
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
            profile={profile}
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
            onRegionsChange={handleSetRegions}
            onResetProgress={resetProgress}
          />
        )}
      </main>
      <TabBar view={view} onNavigate={handleNavigate} />
    </div>
  );
}
