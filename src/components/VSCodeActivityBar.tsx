import React from 'react';
import { 
  Files, 
  PlaySquare, 
  PlusCircle, 
  Settings2, 
  Sun, 
  Moon, 
  Code2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AppSettings } from '../types/lesson';

interface VSCodeActivityBarProps {
  activeView: 'explorer' | 'drill';
  onToggleExplorer: () => void;
  onOpenEditor: () => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  onToggleSound: () => void;
}

export const VSCodeActivityBar: React.FC<VSCodeActivityBarProps> = ({
  activeView,
  onToggleExplorer,
  onOpenEditor,
  settings,
  onToggleTheme,
  onToggleSound,
}) => {
  const isDark = settings.theme === 'dark';

  return (
    <aside 
      className="w-12 shrink-0 bg-slate-900 dark:bg-[#333333] light:bg-[#2c2c2c] border-r border-slate-800 dark:border-[#252526] flex flex-col items-center justify-between py-2 select-none z-30"
      style={{ backgroundColor: isDark ? '#333333' : '#2c2c2c' }}
    >
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* VS Code / LineCode Tutor Logo */}
        <div className="w-9 h-9 flex items-center justify-center text-blue-400 mb-2 cursor-pointer" title="LineCode Tutor (VS Code Edition)">
          <Code2 className="w-6 h-6" />
        </div>

        {/* Explorer Button */}
        <button
          onClick={onToggleExplorer}
          className={`w-full h-11 flex items-center justify-center relative transition ${
            activeView === 'explorer' 
              ? 'text-white border-l-2 border-blue-500 bg-white/5' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Explorer (Files & Lessons)"
        >
          <Files className="w-5 h-5" />
        </button>

        {/* Practice Drill Active */}
        <button
          onClick={onToggleExplorer}
          className="w-full h-11 flex items-center justify-center text-white border-l-2 border-blue-500 bg-white/5 relative"
          title="Interactive Line-by-Line Practice"
        >
          <PlaySquare className="w-5 h-5 text-blue-400" />
        </button>

        {/* New / Paste Code */}
        <button
          onClick={onOpenEditor}
          className="w-full h-11 flex items-center justify-center text-slate-400 hover:text-white transition"
          title="Paste / Import Code File"
        >
          <PlusCircle className="w-5 h-5 text-emerald-400" />
        </button>
      </div>

      {/* Bottom Icons: Theme Toggle, Sound Toggle, Settings */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-full h-10 flex items-center justify-center text-slate-400 hover:text-amber-400 transition"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-300" />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="w-full h-10 flex items-center justify-center text-slate-400 hover:text-white transition"
          title={settings.soundEffects ? 'Mute Sounds' : 'Enable Sound Chimes'}
        >
          {settings.soundEffects ? (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>
    </aside>
  );
};
