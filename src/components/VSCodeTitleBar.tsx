import React from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Code2, 
  Sun, 
  Moon, 
  Plus, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Lesson, AppSettings } from '../types/lesson';
import { getLanguageIcon, getFileExtension } from '../utils/fileIcons';

interface VSCodeTitleBarProps {
  currentLesson: Lesson;
  settings: AppSettings;
  onToggleTheme: () => void;
  onOpenEditor: () => void;
  onOpenHelp: () => void;
}

export const VSCodeTitleBar: React.FC<VSCodeTitleBarProps> = ({
  currentLesson,
  settings,
  onToggleTheme,
  onOpenEditor,
  onOpenHelp,
}) => {
  const isDark = settings.theme === 'dark';
  const fileName = currentLesson.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) + getFileExtension(currentLesson.language);

  return (
    <div 
      className="h-8 select-none flex items-center justify-between px-3 text-xs border-b border-black/20 dark:border-[#252526] z-40 transition-colors"
      style={{
        backgroundColor: isDark ? '#323233' : '#dddddd',
        color: isDark ? '#cccccc' : '#333333',
      }}
    >
      {/* Left: Window Controls + Menu items */}
      <div className="flex items-center gap-3">
        {/* Mac / VS Code Style Dot Window Controls */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block cursor-pointer" />
        </div>

        {/* Menu Bar (VS Code & IDLE menus) */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-normal text-slate-300 dark:text-[#cccccc] light:text-[#333333]">
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer">File</span>
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer">Edit</span>
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer">Selection</span>
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer">View</span>
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer">Run</span>
          <span className="px-2 py-0.5 hover:bg-white/10 rounded cursor-pointer" onClick={onOpenHelp}>Help</span>
        </div>
      </div>

      {/* Center: File Name Title */}
      <div className="flex items-center gap-2 font-mono text-[11px] opacity-90 truncate max-w-md mx-2">
        {getLanguageIcon(currentLesson.language, 'w-3.5 h-3.5')}
        <span className="font-semibold text-slate-100 dark:text-white light:text-slate-900 truncate">
          {fileName}
        </span>
        <span className="text-slate-400 dark:text-[#858585] text-[10px] hidden sm:inline">
          — LineCode Tutor (VS Code Edition)
        </span>
      </div>

      {/* Right: Quick Action buttons (New File, Theme Switch, Help) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium shadow-xs transition"
          title="Paste / Import Code File"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">New Drill</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1 rounded hover:bg-white/10 text-slate-300 dark:text-[#cccccc] light:text-[#333333] transition"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
        </button>
      </div>
    </div>
  );
};
