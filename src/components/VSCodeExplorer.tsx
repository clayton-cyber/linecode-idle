import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Sparkles,
  FileCode,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import { Lesson, AppSettings } from '../types/lesson';
import { getLanguageIcon, getFileExtension } from '../utils/fileIcons';

interface VSCodeExplorerProps {
  currentLesson: Lesson;
  allLessons: Lesson[];
  customLessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onOpenEditor: () => void;
  onDeleteCustomLesson: (lessonId: string) => void;
  currentIndex: number;
  completedIndices: Set<number>;
  onJumpToLine: (index: number) => void;
  settings: AppSettings;
}

export const VSCodeExplorer: React.FC<VSCodeExplorerProps> = ({
  currentLesson,
  allLessons,
  customLessons,
  onSelectLesson,
  onOpenEditor,
  onDeleteCustomLesson,
  currentIndex,
  completedIndices,
  onJumpToLine,
  settings,
}) => {
  const [lessonsOpen, setLessonsOpen] = useState(true);
  const [customOpen, setCustomOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const isDark = settings.theme === 'dark';

  const builtInLessons = allLessons.filter(l => !l.isCustom);

  return (
    <div 
      className="w-64 shrink-0 border-r flex flex-col select-none text-xs h-full transition-colors overflow-hidden"
      style={{
        backgroundColor: isDark ? '#252526' : '#f3f3f3',
        borderColor: isDark ? '#3c3c3c' : '#e4e4e4',
        color: isDark ? '#cccccc' : '#333333',
      }}
    >
      {/* Sidebar Header */}
      <div 
        className="px-4 py-2.5 uppercase font-bold text-[11px] tracking-wider flex items-center justify-between border-b"
        style={{ borderColor: isDark ? '#3c3c3c' : '#e4e4e4' }}
      >
        <span>Explorer</span>
        <button
          onClick={onOpenEditor}
          title="New Code File / Paste"
          className="p-1 hover:bg-white/10 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Explorer Tree List */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        
        {/* Section 1: BUILT-IN LESSONS */}
        <div>
          <button
            onClick={() => setLessonsOpen(!lessonsOpen)}
            className="w-full px-2 py-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide opacity-80 hover:opacity-100 transition"
          >
            {lessonsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Core Lessons ({builtInLessons.length})</span>
          </button>

          {lessonsOpen && (
            <div className="pl-2 space-y-0.5">
              {builtInLessons.map((lesson) => {
                const isSelected = lesson.id === currentLesson.id;
                const fileName = lesson.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 18) + getFileExtension(lesson.language);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left rounded-sm text-[12px] font-mono transition group ${
                      isSelected
                        ? isDark 
                          ? 'bg-[#37373d] text-white font-semibold' 
                          : 'bg-[#e4e6f1] text-[#000000] font-semibold'
                        : isDark
                        ? 'hover:bg-[#2a2d2e] text-[#cccccc]'
                        : 'hover:bg-[#e8e8e8] text-[#333333]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getLanguageIcon(lesson.language, 'w-3.5 h-3.5 shrink-0')}
                      <span className="truncate">{fileName}</span>
                    </div>
                    <span className="text-[10px] opacity-60 font-sans">{lesson.lines.length}L</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: CUSTOM SNIPPETS */}
        <div className="pt-2">
          <button
            onClick={() => setCustomOpen(!customOpen)}
            className="w-full px-2 py-1 flex items-center justify-between font-bold text-[11px] uppercase tracking-wide opacity-80 hover:opacity-100 transition"
          >
            <div className="flex items-center gap-1">
              {customOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Custom Snippets ({customLessons.length})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditor();
              }}
              title="Add Custom Snippet"
              className="p-0.5 hover:bg-white/10 rounded"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
            </button>
          </button>

          {customOpen && (
            <div className="pl-2 space-y-0.5">
              {customLessons.length === 0 ? (
                <div className="px-3 py-2 text-[11px] opacity-50 italic">
                  No custom files yet. Click + to paste.
                </div>
              ) : (
                customLessons.map((lesson) => {
                  const isSelected = lesson.id === currentLesson.id;
                  const fileName = lesson.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 18) + getFileExtension(lesson.language);

                  return (
                    <div
                      key={lesson.id}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left rounded-sm text-[12px] font-mono transition group ${
                        isSelected
                          ? isDark 
                            ? 'bg-[#37373d] text-white font-semibold' 
                            : 'bg-[#e4e6f1] text-[#000000] font-semibold'
                          : isDark
                          ? 'hover:bg-[#2a2d2e] text-[#cccccc]'
                          : 'hover:bg-[#e8e8e8] text-[#333333]'
                      }`}
                    >
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className="flex items-center gap-2 truncate flex-1 text-left"
                      >
                        {getLanguageIcon(lesson.language, 'w-3.5 h-3.5 shrink-0')}
                        <span className="truncate">{fileName}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomLesson(lesson.id);
                        }}
                        title="Delete file"
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Section 3: LINE OUTLINE */}
        <div className="pt-2">
          <button
            onClick={() => setOutlineOpen(!outlineOpen)}
            className="w-full px-2 py-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide opacity-80 hover:opacity-100 transition"
          >
            {outlineOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Line Outline ({completedIndices.size}/{currentLesson.lines.length})</span>
          </button>

          {outlineOpen && (
            <div className="pl-3 space-y-0.5 max-h-48 overflow-y-auto">
              {currentLesson.lines.map((l, idx) => {
                const isActive = idx === currentIndex;
                const isDone = completedIndices.has(idx);

                return (
                  <button
                    key={l.id}
                    onClick={() => onJumpToLine(idx)}
                    className={`w-full px-2 py-1 flex items-center justify-between text-left text-[11px] font-mono rounded transition ${
                      isActive
                        ? isDark ? 'bg-blue-600/30 text-blue-300 font-bold' : 'bg-blue-100 text-blue-700 font-bold'
                        : isDone
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="truncate">
                      L{l.lineNumber}: {l.code.trim().slice(0, 18)}
                    </span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
