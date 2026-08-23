import React from 'react';
import { 
  Check, 
  Sparkles, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { Lesson, AppSettings, UserStats } from '../types/lesson';

interface VSCodeStatusBarProps {
  lesson: Lesson;
  currentIndex: number;
  completedLinesCount: number;
  stats: UserStats;
  settings: AppSettings;
  onToggleTheme: () => void;
  onToggleSound: () => void;
}

export const VSCodeStatusBar: React.FC<VSCodeStatusBarProps> = ({
  lesson,
  currentIndex,
  completedLinesCount,
  stats,
  settings,
  onToggleTheme,
  onToggleSound,
}) => {
  const isDark = settings.theme === 'dark';
  const total = lesson.lines.length;
  const accuracy = Math.round(Math.max(0, ((total - stats.revealedSolutions) / total) * 100));

  return (
    <footer 
      className="h-6 shrink-0 flex items-center justify-between px-3 text-[11px] select-none z-30 transition-colors"
      style={{
        backgroundColor: '#007acc',
        color: '#ffffff',
      }}
    >
      {/* Left status items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 font-semibold">
          <Terminal className="w-3 h-3" />
          <span>LineCode Drill</span>
        </span>

        <span className="opacity-90 hidden sm:inline">
          Ln {currentIndex + 1}, Col 1 (Total {total}L)
        </span>

        <span className="flex items-center gap-1 bg-black/20 px-1.5 py-0.2 rounded">
          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
          <span>{completedLinesCount}/{total} Done</span>
        </span>
      </div>

      {/* Right status items */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">Spaces: 4</span>
        <span className="hidden md:inline">UTF-8</span>
        
        <span className="capitalize font-mono font-medium bg-black/20 px-1.5 py-0.2 rounded">
          {lesson.language}
        </span>

        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-300" />
          <span>Recall: {accuracy}%</span>
        </span>

        {/* Theme indicator / toggle */}
        <button
          onClick={onToggleTheme}
          className="hover:bg-black/20 px-1.5 py-0.5 rounded flex items-center gap-1 transition"
          title="Toggle Theme"
        >
          {isDark ? <Moon className="w-3 h-3 text-blue-200" /> : <Sun className="w-3 h-3 text-amber-300" />}
          <span className="hidden sm:inline">{isDark ? 'Dark+' : 'Light+'}</span>
        </button>
      </div>
    </footer>
  );
};
