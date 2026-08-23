import React, { useState } from 'react';
import { 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Info,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CodeLineItem, AppSettings } from '../types/lesson';

interface IDLEAnalysisDocProps {
  currentLine: CodeLineItem;
  currentIndex: number;
  totalLines: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isCompleted: boolean;
  settings: AppSettings;
}

export const IDLEAnalysisDoc: React.FC<IDLEAnalysisDocProps> = ({
  currentLine,
  currentIndex,
  totalLines,
  onPrev,
  onNext,
  onReset,
  isCompleted,
  settings,
}) => {
  const [showHint, setShowHint] = useState(false);
  const isDark = settings.theme === 'dark';

  const renderFormattedExplanation = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeSnippet = part.slice(1, -1);
        return (
          <code 
            key={i} 
            className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs font-bold border ${
              isDark 
                ? 'bg-[#181818] text-[#4ec9b0] border-[#3c3c3c]' 
                : 'bg-[#f6f8fa] text-[#0550ae] border-[#d0d7de]'
            }`}
          >
            {codeSnippet}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div 
      className="border rounded-xl p-4 sm:p-5 shadow-xs transition-colors relative"
      style={{
        backgroundColor: isDark ? '#252526' : '#ffffff',
        borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        color: isDark ? '#cccccc' : '#24292f',
      }}
    >
      {/* Top Banner */}
      <div 
        className="flex items-center justify-between pb-3 mb-3 border-b text-xs"
        style={{ borderColor: isDark ? '#333333' : '#eaeef2' }}
      >
        <div className="flex items-center gap-2">
          <span 
            className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${
              isDark ? 'bg-[#1e1e1e] text-blue-400 border-[#3c3c3c]' : 'bg-[#eef4fb] text-blue-700 border-[#c8e1ff]'
            }`}
          >
            Line {currentIndex + 1} of {totalLines}
          </span>

          {currentLine.category && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider font-mono border ${
              isDark ? 'bg-purple-950/40 text-purple-300 border-purple-800/40' : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              {currentLine.category}
            </span>
          )}
        </div>

        {/* Step Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            title="Previous Line (Left Arrow)"
            className={`p-1.5 rounded disabled:opacity-30 border transition ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-white' 
                : 'bg-white hover:bg-[#f3f5f8] border-[#d0d7de] text-[#24292f]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex >= totalLines - 1}
            title="Next Line (Right Arrow)"
            className={`p-1.5 rounded disabled:opacity-30 border transition ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-white' 
                : 'bg-white hover:bg-[#f3f5f8] border-[#d0d7de] text-[#24292f]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            title="Restart Lesson"
            className={`p-1.5 rounded border transition ml-1 ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-rose-400' 
                : 'bg-white hover:bg-[#f3f5f8] border-[#d0d7de] text-rose-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Analysis Body (Styled like IDLE docstring) */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm select-none">
            #
          </div>
          <div className="flex-1">
            <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium ${
              isDark ? 'text-[#f0f0f0]' : 'text-[#1f2328]'
            }`}>
              {renderFormattedExplanation(currentLine.explanation)}
            </div>
          </div>
        </div>

        {/* Hint Accordion */}
        {currentLine.hint && (
          <div className="pt-1 pl-5">
            <button
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium transition"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Syntax Hint' : 'Show Syntax Hint'}</span>
            </button>

            {showHint && (
              <div 
                className={`mt-2 p-3 rounded-lg border text-xs leading-relaxed animate-slideUp font-mono ${
                  isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold text-amber-600 dark:text-amber-400">Hint: </span>
                {renderFormattedExplanation(currentLine.hint)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini Progress */}
      <div 
        className="mt-4 pt-2.5 border-t flex items-center justify-between text-xs"
        style={{ borderColor: isDark ? '#333333' : '#eaeef2' }}
      >
        <div className="flex items-center gap-2 w-full max-w-xs">
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#e5e9f0]'}`}>
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentIndex + (isCompleted ? 1 : 0)) / totalLines) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] opacity-75">
            {Math.round(((currentIndex + (isCompleted ? 1 : 0)) / totalLines) * 100)}%
          </span>
        </div>

        <span className="text-[11px] opacity-60 hidden sm:inline font-mono">
          Press <kbd className="font-bold">Enter</kbd> to proceed
        </span>
      </div>
    </div>
  );
};
