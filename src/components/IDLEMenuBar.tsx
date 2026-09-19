import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  Upload,
  ChevronDown,
  Terminal,
  Trash2,
  Columns,
  FileCode,
  Sparkles
} from 'lucide-react';
import { Lesson, AppSettings, GameMode } from '../types/lesson';
import { getLanguageIcon, getFileExtension, detectLanguageFromFilename } from '../utils/fileIcons';
import { parseCodeInput } from '../utils/parser';


interface IDLEMenuBarProps {
  currentLesson: Lesson;
  allLessons: Lesson[];
  customLessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onOpenEditor: () => void;
  onSaveCustomLesson: (lesson: Lesson) => void;
  onDeleteCustomLesson: (lessonId: string) => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  viewMode: 'split' | 'focus';
  onToggleViewMode: () => void;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
}

export const IDLEMenuBar: React.FC<IDLEMenuBarProps> = ({
  currentLesson,
  allLessons,
  customLessons,
  onSelectLesson,
  onOpenEditor,
  onSaveCustomLesson,
  onDeleteCustomLesson,
  settings,
  onToggleTheme,
  onToggleSound,
  viewMode,
  onToggleViewMode,
  gameMode,
  onSelectGameMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = settings.theme === 'dark';
  const fileName = currentLesson.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) + getFileExtension(currentLesson.language);

  // Handle direct file upload from toolbar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const detectedLang = detectLanguageFromFilename(file.name);
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const parseResult = parseCodeInput(content, titleWithoutExt);

        if (parseResult.lines.length > 0) {
          const newLesson: Lesson = {
            id: `upload-${Date.now()}`,
            title: titleWithoutExt,
            language: detectedLang,
            difficulty: 'Intermediate',
            description: `Uploaded file (${file.name}) with ${parseResult.lines.length} lines.`,
            lines: parseResult.lines,
            rawSource: content,
            createdAt: Date.now(),
            isCustom: true,
          };
          onSaveCustomLesson(newLesson);
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header
      className="border-b select-none text-xs transition-colors shrink-0 z-30 shadow-xs"
      style={{
        backgroundColor: isDark ? '#252526' : '#ffffff',
        borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        color: isDark ? '#cccccc' : '#24292f',
      }}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".py,.js,.ts,.tsx,.jsx,.sql,.txt,.rs,.go,.cpp,.c,.html,.css,.json"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Clean IDLE App Bar */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3">

        {/* Left: IDLE Logo & File Title */}
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-bold">LineCode IDLE</span>
              <span className="opacity-40">/</span>
              <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                {fileName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Functional Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* File Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${isDark
                  ? 'bg-[#1e1e1e] hover:bg-[#2d2d2d] border-[#3c3c3c] text-white'
                  : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
                }`}
              title="Select or switch code lesson"
            >
              <span className="max-w-[120px] sm:max-w-[180px] truncate font-semibold">
                {currentLesson.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="absolute right-0 mt-1.5 w-80 rounded-xl shadow-xl p-2 z-50 border animate-slideUp font-sans text-xs"
                  style={{
                    backgroundColor: isDark ? '#252526' : '#ffffff',
                    borderColor: isDark ? '#3c3c3c' : '#d0d7de',
                    color: isDark ? '#cccccc' : '#24292f',
                  }}
                >
                  <div className="px-2 py-1 uppercase text-[10px] font-bold opacity-60 flex items-center justify-between">
                    <span>Built-in Lessons</span>
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {allLessons.filter(l => !l.isCustom).map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          onSelectLesson(lesson);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-left text-xs font-mono transition ${currentLesson.id === lesson.id
                            ? 'bg-blue-600 text-white font-bold'
                            : isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-[#f0f3f6]'
                          }`}
                      >
                        <span className="truncate">{lesson.title}</span>
                        <span className="text-[10px] opacity-70 ml-2 font-sans">{lesson.lines.length}L</span>
                      </button>
                    ))}
                  </div>

                  {customLessons.length > 0 && (
                    <>
                      <div className="px-2 pt-2 pb-1 border-t uppercase text-[10px] font-bold opacity-60 mt-1" style={{ borderColor: isDark ? '#3c3c3c' : '#e1e4e8' }}>
                        Custom & Uploaded Files
                      </div>
                      <div className="space-y-0.5 max-h-36 overflow-y-auto">
                        {customLessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-left text-xs font-mono transition group ${currentLesson.id === lesson.id
                                ? 'bg-blue-600 text-white font-bold'
                                : isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-[#f0f3f6]'
                              }`}
                          >
                            <button
                              onClick={() => {
                                onSelectLesson(lesson);
                                setDropdownOpen(false);
                              }}
                              className="truncate flex-1 text-left"
                            >
                              {lesson.title}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCustomLesson(lesson.id);
                              }}
                              className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="pt-2 mt-1 border-t space-y-1" style={{ borderColor: isDark ? '#3c3c3c' : '#e1e4e8' }}>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Code File</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenEditor();
                      }}
                      className={`w-full py-1.5 px-2.5 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition ${isDark ? 'border-[#3c3c3c] hover:bg-[#1e1e1e]' : 'border-[#d0d7de] hover:bg-[#f6f8fa]'
                        }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Paste Raw Code</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Game Mode Switcher: Type Drill vs Token Match */}
          <div className={`p-0.5 rounded-lg border flex items-center font-mono text-xs select-none ${isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f0f3f6] border-[#d0d7de]'
            }`}>
            <button
              onClick={() => onSelectGameMode('type')}
              className={`px-3 py-1 rounded-md flex items-center transition font-semibold ${gameMode === 'type'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'text-[#858585] hover:text-white' : 'text-[#57606a] hover:text-[#24292f]'
                }`}
              title="Keyboard Typing Drill Practice Mode"
            >
              <span>Type Drill</span>
            </button>
            <button
              onClick={() => onSelectGameMode('tokens')}
              className={`px-3 py-1 rounded-md flex items-center transition font-semibold ${gameMode === 'tokens'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark ? 'text-[#858585] hover:text-white' : 'text-[#57606a] hover:text-[#24292f]'
                }`}
              title="Token Match Challenge"
            >
              <span>Token Match</span>
            </button>
          </div>

          {/* AI LLM Prompt Template Button */}
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition"
            title="Generate line-by-line comments with ChatGPT / Claude / Gemini"
          >
            <span className="hidden md:inline">AI Prompt</span>
          </button>

          {/* Direct Upload File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition"
            title="Upload code file (.py, .js, .ts, .sql, etc.)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {/* Paste Code Button */}
          <button
            onClick={onOpenEditor}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${isDark
                ? 'bg-[#1e1e1e] hover:bg-[#2d2d2d] border-[#3c3c3c] text-[#cccccc]'
                : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
              }`}
            title="Paste custom code snippet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Paste</span>
          </button>

          {/* Split / Focus View toggle */}
          <button
            onClick={onToggleViewMode}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border transition text-xs flex items-center gap-1 ${isDark
                ? 'bg-[#1e1e1e] hover:bg-[#2d2d2d] border-[#3c3c3c] text-[#cccccc]'
                : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
              }`}
            title={viewMode === 'split' ? 'Switch to Focused Shell View' : 'Switch to Split Script View'}
          >
            <Columns className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden lg:inline">{viewMode === 'split' ? 'Split' : 'Focus'}</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border transition text-xs flex items-center gap-1 ${isDark
                ? 'bg-[#1e1e1e] hover:bg-[#2d2d2d] border-[#3c3c3c] text-amber-400'
                : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-blue-600'
              }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition ${isDark
                ? 'bg-[#1e1e1e] hover:bg-[#2d2d2d] border-[#3c3c3c] text-[#cccccc]'
                : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
              }`}
            title={settings.soundEffects ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          >
            {settings.soundEffects ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-40" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
