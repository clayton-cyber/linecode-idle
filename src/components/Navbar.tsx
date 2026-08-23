import React, { useState } from 'react';
import { 
  Code2, 
  PlusCircle, 
  Settings2, 
  Volume2, 
  VolumeX, 
  CheckCheck, 
  BookOpen, 
  Sparkles,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Lesson, AppSettings } from '../types/lesson';

interface NavbarProps {
  currentLesson: Lesson;
  allLessons: Lesson[];
  customLessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onOpenEditor: () => void;
  onDeleteCustomLesson: (lessonId: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLesson,
  allLessons,
  customLessons,
  onSelectLesson,
  onOpenEditor,
  onDeleteCustomLesson,
  settings,
  onUpdateSettings,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">LineCode Tutor</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Step-by-Step Code Practice & Analysis</p>
          </div>
        </div>

        {/* Center: Lesson Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setSettingsOpen(false);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition shadow-sm text-sm font-medium"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="max-w-[180px] sm:max-w-[280px] truncate">{currentLesson.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700/80 text-slate-300 capitalize font-mono text-[11px]">
              {currentLesson.language}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Lesson Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-slideUp">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5 flex items-center justify-between">
                  <span>Built-in Lessons</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {allLessons.filter(l => !l.isCustom).map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        onSelectLesson(lesson);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-xs flex items-center justify-between group ${
                        currentLesson.id === lesson.id 
                          ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate font-medium">{lesson.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{lesson.lines.length} lines • {lesson.difficulty}</div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-slate-700 text-slate-300">
                        {lesson.language}
                      </span>
                    </button>
                  ))}
                </div>

                {customLessons.length > 0 && (
                  <>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1 border-t border-slate-800 mt-2">
                      Custom Snippets ({customLessons.length})
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {customLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`w-full text-left px-3 py-2 rounded-lg transition text-xs flex items-center justify-between group ${
                            currentLesson.id === lesson.id 
                              ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectLesson(lesson);
                              setDropdownOpen(false);
                            }}
                            className="text-left flex-1 truncate mr-2"
                          >
                            <div className="truncate font-medium">{lesson.title}</div>
                            <div className="text-[11px] text-slate-400">{lesson.lines.length} lines</div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomLesson(lesson.id);
                            }}
                            title="Delete custom snippet"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-750 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="pt-2 mt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenEditor();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Paste / Import New Code</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* New / Import Button */}
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-emerald-500/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Paste / Practice Code</span>
          </button>

          {/* Quick Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
            title={settings.soundEffects ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
          >
            {settings.soundEffects ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setDropdownOpen(false);
              }}
              title="Practice Settings"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setSettingsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-slideUp">
                  <div className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Practice Settings</span>
                    <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Auto-Advance on Match</span>
                    <input
                      type="checkbox"
                      checked={settings.autoAdvanceOnSuccess}
                      onChange={(e) => onUpdateSettings({ autoAdvanceOnSuccess: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <div>
                      <div className="text-slate-300">Strict Indentation</div>
                      <div className="text-[10px] text-slate-500">Require exact leading spaces</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.strictIndentation}
                      onChange={(e) => onUpdateSettings({ strictIndentation: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Audio Feedback Chimes</span>
                    <input
                      type="checkbox"
                      checked={settings.soundEffects}
                      onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-300">Show Future Lines (Dimmed)</span>
                    <input
                      type="checkbox"
                      checked={settings.peekNextLines}
                      onChange={(e) => onUpdateSettings({ peekNextLines: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
