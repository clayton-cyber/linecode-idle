import React, { useState, useCallback } from 'react';
import { 
  Keyboard,
  Terminal,
  Columns,
  Maximize2
} from 'lucide-react';
import { Lesson, AppSettings, UserStats } from '../types/lesson';
import { IDLEAnalysisDoc } from './IDLEAnalysisDoc';
import { IDLEPromptInput } from './IDLEPromptInput';
import { IDLEEditorPanel } from './IDLEEditorPanel';
import { CompletionModal } from './CompletionModal';
import { sounds } from '../utils/sound';
import { saveLessonProgress } from '../utils/storage';
import { getLanguageIcon } from '../utils/fileIcons';

interface PracticeViewProps {
  lesson: Lesson;
  settings: AppSettings;
  onNextLesson?: () => void;
  currentIndex: number;
  onJumpToLine: (index: number) => void;
  completedIndices: Set<number>;
  setCompletedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  drillLineIndices: Set<number> | null;
  hintedIndices: Set<number>;
  setHintedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  onToggleLineSelection: (index: number) => void;
  onSetDrillLineIndices: (indices: Set<number> | null) => void;
  viewMode: 'split' | 'focus';
  onToggleViewMode: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  lesson,
  settings,
  onNextLesson,
  currentIndex,
  onJumpToLine,
  completedIndices,
  setCompletedIndices,
  stats,
  setStats,
  drillLineIndices,
  hintedIndices,
  setHintedIndices,
  onToggleLineSelection,
  onSetDrillLineIndices,
  viewMode,
  onToggleViewMode,
}) => {
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const isDark = settings.theme === 'dark';

  const totalLines = lesson.lines.length;
  const currentLine = lesson.lines[currentIndex] || lesson.lines[0];

  const handleLineCompleted = useCallback((_input: string, revealedSolution: boolean) => {
    if (settings.soundEffects) {
      sounds.playCorrect();
    }

    setCompletedIndices(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    if (revealedSolution) {
      setHintedIndices(prev => new Set(prev).add(currentIndex));
    }

    setStats(prev => ({
      ...prev,
      completedLines: prev.completedLines + 1,
      revealedSolutions: revealedSolution ? prev.revealedSolutions + 1 : prev.revealedSolutions,
      streak: prev.streak + 1,
    }));
  }, [currentIndex, settings.soundEffects, setCompletedIndices, setHintedIndices, setStats]);

  const handleShowNext = useCallback(() => {
    let nextIdx = currentIndex + 1;
    if (drillLineIndices) {
      while (nextIdx < totalLines && !drillLineIndices.has(nextIdx)) nextIdx++;
    }

    if (nextIdx < totalLines) {
      onJumpToLine(nextIdx);
    } else {
      setStats(prev => ({
        ...prev,
        endTime: Date.now(),
      }));
      setIsCompletionModalOpen(true);
      saveLessonProgress({
        lessonId: lesson.id,
        completed: true,
        accuracy: Math.round(((totalLines - stats.revealedSolutions) / totalLines) * 100),
        lastLineIndex: currentIndex,
        lastPracticed: Date.now(),
      });
    }
  }, [currentIndex, totalLines, lesson.id, stats.revealedSolutions, drillLineIndices, onJumpToLine, setStats]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onJumpToLine(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    let firstIdx = 0;
    if (drillLineIndices) {
      while (firstIdx < totalLines && !drillLineIndices.has(firstIdx)) firstIdx++;
    }
    if (firstIdx >= totalLines) firstIdx = 0;

    onJumpToLine(firstIdx);
    setCompletedIndices(new Set());
    setHintedIndices(new Set());
    setStats({
      completedLines: 0,
      totalAttempts: 0,
      revealedSolutions: 0,
      streak: 0,
      startTime: Date.now(),
    });
    setIsCompletionModalOpen(false);
  };

  return (
    <div className="h-full p-4 lg:p-6 overflow-y-auto space-y-4">
      
      {/* IDLE Shell Startup Banner */}
      <div 
        className="p-3 rounded-xl border text-xs font-mono select-none flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        style={{
          backgroundColor: isDark ? '#252526' : '#ffffff',
          borderColor: isDark ? '#3c3c3c' : '#d0d7de',
          color: isDark ? '#858585' : '#57606a',
        }}
      >
        <div className="flex items-center gap-2">
          <span>
            <strong className="text-blue-600 dark:text-blue-400">Python 3.13.0 IDLE Shell</strong> —{' '}
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{lesson.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400"
          >
            <span>Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Shortcuts Guide */}
      {showShortcutsHelp && (
        <div 
          className="p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-slideUp font-mono"
          style={{
            backgroundColor: isDark ? '#252526' : '#ffffff',
            borderColor: isDark ? '#3c3c3c' : '#d0d7de',
            color: isDark ? '#cccccc' : '#24292f',
          }}
        >
          <div className="flex items-center gap-2">
            <kbd className={`px-2 py-0.5 rounded font-bold text-blue-600 dark:text-blue-400 border ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f6f8fa] border-[#d0d7de]'
            }`}>
              Enter
            </kbd>
            <span>Advance to next line</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className={`px-2 py-0.5 rounded font-bold text-amber-600 dark:text-amber-400 border ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f6f8fa] border-[#d0d7de]'
            }`}>
              Ctrl + Space
            </kbd>
            <span>Show / Hide Target Solution</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className={`px-2 py-0.5 rounded font-bold text-emerald-600 dark:text-emerald-400 border ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f6f8fa] border-[#d0d7de]'
            }`}>
              Click Line
            </kbd>
            <span>Jump to any line</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left = IDLE Prompt & Analysis, Right = Live Script Editor (if split view) */}
      <div className={`grid gap-5 items-start ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
        
        {/* Main Drill Section */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} space-y-4`}>
          
          {/* Interactive IDLE Prompt Input */}
          <IDLEPromptInput
            key={`input-${currentLine.id}-${currentIndex}`}
            currentLine={currentLine}
            currentIndex={currentIndex}
            settings={settings}
            onLineCompleted={handleLineCompleted}
            onShowNext={handleShowNext}
          />

          {/* Quick Line Jump Bubbles */}
          <div 
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: isDark ? '#252526' : '#ffffff',
              borderColor: isDark ? '#3c3c3c' : '#d0d7de',
            }}
          >
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-70 mb-2 flex items-center justify-between">
              <span>Line Navigator — {completedIndices.size}/{totalLines} lines</span>
              <button
                onClick={handleRestart}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold transition ${
                  isDark
                    ? 'border-[#3c3c3c] hover:bg-[#333333] text-[#858585] hover:text-white'
                    : 'border-[#d0d7de] hover:bg-[#f0f0f0] text-[#57606a]'
                }`}
                title="Restart the drill from the beginning"
              >
                ↺ Restart Drill
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {lesson.lines.map((l, idx) => {
                const isActive = idx === currentIndex;
                const isDone = completedIndices.has(idx);
                const isHinted = hintedIndices.has(idx);
                const isSkipped = drillLineIndices && !drillLineIndices.has(idx);

                return (
                  <button
                    key={l.id}
                    onClick={() => onJumpToLine(idx)}
                    className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center transition border ${
                      isSkipped
                        ? 'opacity-30 bg-transparent border-dashed border-gray-400 text-gray-500 cursor-not-allowed'
                        : isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDone
                        ? isDark 
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDark
                        ? 'bg-[#1e1e1e] hover:bg-[#333333] text-[#858585] border-[#3c3c3c]'
                        : 'bg-[#f6f8fa] hover:bg-[#eef2f6] text-[#57606a] border-[#d0d7de]'
                    }`}
                    title={isSkipped ? `Line ${l.lineNumber} (Skipped)` : `Line ${l.lineNumber}: ${l.code.trim()}`}
                    disabled={isSkipped || false}
                  >
                    {l.lineNumber}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Script Editor Panel (Right Column when in split mode) */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 h-[560px] lg:sticky lg:top-4">
            <IDLEEditorPanel
              lesson={lesson}
              currentIndex={currentIndex}
              completedIndices={completedIndices}
              onJumpToLine={onJumpToLine}
              settings={settings}
              drillLineIndices={drillLineIndices}
              onToggleLineSelection={onToggleLineSelection}
            />
          </div>
        )}

      </div>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        lesson={lesson}
        stats={stats}
        onRestart={handleRestart}
        onNextLesson={onNextLesson}
        onClose={() => setIsCompletionModalOpen(false)}
        soundEnabled={settings.soundEffects}
        settings={settings}
        hintedIndices={hintedIndices}
        onRetakeHinted={() => {
          onSetDrillLineIndices(new Set(hintedIndices));
          onJumpToLine(Array.from(hintedIndices).sort((a,b)=>a-b)[0] || 0);
          setCompletedIndices(new Set());
          setHintedIndices(new Set());
          setStats({
            completedLines: 0,
            totalAttempts: 0,
            revealedSolutions: 0,
            streak: 0,
            startTime: Date.now(),
          });
          setIsCompletionModalOpen(false);
        }}
      />

    </div>
  );
};
