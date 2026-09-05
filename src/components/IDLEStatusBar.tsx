import React from 'react';
import { 
  Terminal, 
  Sun, 
  Moon, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { Lesson, AppSettings, UserStats, GameMode } from '../types/lesson';
import { Puzzle, Keyboard } from 'lucide-react';

interface IDLEStatusBarProps {
  lesson: Lesson;
  currentIndex: number;
  completedLinesCount: number;
  stats: UserStats;
  settings: AppSettings;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  gameMode?: GameMode;
}

export const IDLEStatusBar: React.FC<IDLEStatusBarProps> = ({
  lesson,
  currentIndex,
  completedLinesCount,
  stats,
  settings,
  onToggleTheme,
  gameMode = 'type',
}) => {
  const isDark = settings.theme === 'dark';
  const total = lesson.lines.length;
  const accuracy = Math.round(Math.max(0, ((total - stats.revealedSolutions) / total) * 100));

  return (
    <footer 
      className="h-6 shrink-0 flex items-center justify-between px-3 text-[11px] font-mono select-none z-30 transition-colors border-t"
      style={{
        backgroundColor: isDark ? '#252526' : '#eef2f6',
        borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        color: isDark ? '#cccccc' : '#24292f',
      }}
    >
      {/* Left status items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
          <Terminal className="w-3 h-3" />
          <span>Python 3.13 IDLE</span>
        </span>

        <span className="opacity-75 hidden sm:inline">
          Ln {currentIndex + 1}, Col 1 (Total {total}L)
        </span>

        <span className="flex items-center gap-1 font-semibold">
          {gameMode === 'tokens' ? (
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Puzzle className="w-3 h-3" />
              <span>Token Drop Mode</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Keyboard className="w-3 h-3" />
              <span>Type Drill Mode</span>
            </span>
          )}
        </span>

        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>{completedLinesCount}/{total} Done</span>
        </span>
      </div>

      {/* Right status items */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">Spaces: 4</span>
        <span className="hidden md:inline">UTF-8</span>
        
        <span className="capitalize font-bold text-blue-600 dark:text-blue-400">
          {lesson.language}
        </span>

        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Recall: {accuracy}%</span>
        </span>

        <button
          onClick={onToggleTheme}
          className="hover:opacity-100 opacity-75 flex items-center gap-1 transition"
          title="Toggle Theme"
        >
          {isDark ? <Moon className="w-3 h-3 text-amber-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
          <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </footer>
  );
};
