import React, { useState, useEffect } from 'react';
import { IDLEMenuBar } from './components/IDLEMenuBar';
import { IDLEStatusBar } from './components/IDLEStatusBar';
import { PracticeView } from './components/PracticeView';
import { TokenPuzzleView } from './components/TokenPuzzleView';
import { LessonEditorModal } from './components/LessonEditorModal';
import { defaultLessons } from './data/defaultLessons';
import { Lesson, AppSettings, UserStats, GameMode } from './types/lesson';
import { 
  loadSettings, 
  saveSettings, 
  loadCustomLessons, 
  saveCustomLesson, 
  deleteCustomLesson 
} from './utils/storage';

export function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [customLessons, setCustomLessons] = useState<Lesson[]>(loadCustomLessons);
  const [allLessons, setAllLessons] = useState<Lesson[]>(() => [...defaultLessons, ...loadCustomLessons()]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(defaultLessons[0]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'focus'>('split');
  const [gameMode, setGameMode] = useState<GameMode>('tokens'); // Default to exciting new Token Drop mode or type


  // Line navigation and stats state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [drillLineIndices, setDrillLineIndices] = useState<Set<number> | null>(null);
  const [hintedIndices, setHintedIndices] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<UserStats>({
    completedLines: 0,
    totalAttempts: 0,
    revealedSolutions: 0,
    streak: 0,
    startTime: Date.now(),
  });

  // Apply dark / light mode class to document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync settings changes
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
  };

  const handleToggleSound = () => {
    handleUpdateSettings({ soundEffects: !settings.soundEffects });
  };

  // Switch lesson & reset progress
  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentIndex(0);
    setCompletedIndices(new Set());
    setDrillLineIndices(null);
    setHintedIndices(new Set());
    setStats({
      completedLines: 0,
      totalAttempts: 0,
      revealedSolutions: 0,
      streak: 0,
      startTime: Date.now(),
    });
  };

  const handleToggleLineSelection = (index: number) => {
    setDrillLineIndices(prev => {
      if (index === -1) {
        if (prev === null || prev.size === currentLesson.lines.length) return new Set();
        return null; // null means all lines are active
      }
      const activeLines = prev ? new Set(prev) : new Set(currentLesson.lines.map((_, i) => i));
      if (activeLines.has(index)) {
        activeLines.delete(index);
      } else {
        activeLines.add(index);
      }
      return activeLines;
    });
  };

  // Sync lessons
  useEffect(() => {
    setAllLessons([...defaultLessons, ...customLessons]);
  }, [customLessons]);

  const handleSaveCustomLesson = (newLesson: Lesson) => {
    saveCustomLesson(newLesson);
    setCustomLessons((prev) => [newLesson, ...prev.filter(l => l.id !== newLesson.id)]);
    handleSelectLesson(newLesson);
  };

  const handleDeleteCustomLesson = (lessonId: string) => {
    const updated = deleteCustomLesson(lessonId);
    setCustomLessons(updated);
    if (currentLesson.id === lessonId) {
      handleSelectLesson(defaultLessons[0]);
    }
  };

  const handleNextLesson = () => {
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (idx >= 0 && idx < allLessons.length - 1) {
      handleSelectLesson(allLessons[idx + 1]);
    } else {
      handleSelectLesson(allLessons[0]);
    }
  };

  const isDark = settings.theme === 'dark';

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden font-sans transition-colors"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#f7f9fb',
        color: isDark ? '#cccccc' : '#1f2328',
      }}
    >
      {/* 1. IDLE Menu & App Bar */}
      <IDLEMenuBar
        currentLesson={currentLesson}
        allLessons={allLessons}
        customLessons={customLessons}
        onSelectLesson={handleSelectLesson}
        onOpenEditor={() => setIsEditorOpen(true)}
        onSaveCustomLesson={handleSaveCustomLesson}
        onDeleteCustomLesson={handleDeleteCustomLesson}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'split' ? 'focus' : 'split')}
        gameMode={gameMode}
        onSelectGameMode={setGameMode}
      />

      {/* 2. Main IDLE Practice Shell Workspace */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {gameMode === 'tokens' ? (
          <TokenPuzzleView
            key={`tokens-${currentLesson.id}`}
            lesson={currentLesson}
            settings={settings}
            onNextLesson={handleNextLesson}
            currentIndex={currentIndex}
            onJumpToLine={setCurrentIndex}
            completedIndices={completedIndices}
            setCompletedIndices={setCompletedIndices}
            drillLineIndices={drillLineIndices}
            hintedIndices={hintedIndices}
            setHintedIndices={setHintedIndices}
            onToggleLineSelection={handleToggleLineSelection}
            onSetDrillLineIndices={setDrillLineIndices}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'split' ? 'focus' : 'split')}
          />
        ) : (
          <PracticeView
            key={`type-${currentLesson.id}`}
            lesson={currentLesson}
            settings={settings}
            onNextLesson={handleNextLesson}
            currentIndex={currentIndex}
            onJumpToLine={setCurrentIndex}
            completedIndices={completedIndices}
            setCompletedIndices={setCompletedIndices}
            drillLineIndices={drillLineIndices}
            hintedIndices={hintedIndices}
            setHintedIndices={setHintedIndices}
            onToggleLineSelection={handleToggleLineSelection}
            onSetDrillLineIndices={setDrillLineIndices}
            stats={stats}
            setStats={setStats}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'split' ? 'focus' : 'split')}
          />
        )}
      </main>

      {/* 3. IDLE Status Bar */}
      <IDLEStatusBar
        lesson={currentLesson}
        currentIndex={currentIndex}
        completedLinesCount={completedIndices.size}
        stats={stats}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        gameMode={gameMode}
      />

      {/* 4. Paste Custom Code Modal */}
      <LessonEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveAndPractice={handleSaveCustomLesson}
        settings={settings}
      />

    </div>
  );
}

export default App;
