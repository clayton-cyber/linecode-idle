import React, { useState } from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles,
  Info,
  Layers,
  MessageSquareCode
} from 'lucide-react';
import { CodeLineItem, AppSettings } from '../types/lesson';

interface SlideshowCardProps {
  currentLine: CodeLineItem;
  currentIndex: number;
  totalLines: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isCompleted: boolean;
  settings: AppSettings;
}

export const SlideshowCard: React.FC<SlideshowCardProps> = ({
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

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'definition':
        return isDark ? 'bg-purple-900/40 text-purple-300 border-purple-700/50' : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'control':
        return isDark ? 'bg-amber-900/40 text-amber-300 border-amber-700/50' : 'bg-amber-100 text-amber-800 border-amber-200';
      case 'return':
        return isDark ? 'bg-rose-900/40 text-rose-300 border-rose-700/50' : 'bg-rose-100 text-rose-800 border-rose-200';
      case 'import':
        return isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' : 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return isDark ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const renderFormattedExplanation = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeSnippet = part.slice(1, -1);
        return (
          <code 
            key={i} 
            className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs font-semibold border ${
              isDark 
                ? 'bg-[#1e1e1e] text-[#4ec9b0] border-[#3c3c3c]' 
                : 'bg-white text-[#001080] border-[#d4d4d4]'
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
      className="border rounded-xl p-4 sm:p-5 shadow-md transition-all relative overflow-hidden"
      style={{
        backgroundColor: isDark ? '#252526' : '#f8f9fa',
        borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
        color: isDark ? '#cccccc' : '#333333',
      }}
    >
      {/* Top VS Code Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#007acc]" />

      {/* Header bar */}
      <div 
        className="flex items-center justify-between gap-2 pb-3 mb-3 border-b"
        style={{ borderColor: isDark ? '#333333' : '#e5e5e5' }}
      >
        <div className="flex items-center gap-2">
          <span 
            className={`px-2.5 py-1 rounded font-mono text-xs font-bold border flex items-center gap-1.5 ${
              isDark ? 'bg-[#1e1e1e] text-blue-400 border-[#3c3c3c]' : 'bg-white text-blue-600 border-[#d4d4d4]'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            Slide {currentIndex + 1} of {totalLines}
          </span>

          {currentLine.category && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getCategoryBadge(currentLine.category)}`}>
              {currentLine.category}
            </span>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            title="Previous Line (Left Arrow)"
            className={`p-1.5 rounded disabled:opacity-30 border transition ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-[#cccccc]' 
                : 'bg-white hover:bg-[#ececec] border-[#d4d4d4] text-[#333333]'
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
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-[#cccccc]' 
                : 'bg-white hover:bg-[#ececec] border-[#d4d4d4] text-[#333333]'
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
                : 'bg-white hover:bg-[#ececec] border-[#d4d4d4] text-rose-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Analysis Text */}
      <div className="space-y-2.5">
        <div className="flex items-start gap-3">
          <div 
            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
              isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#858585]' : 'text-[#717171]'}`}>
              Line Analysis & Purpose
            </h3>
            <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal ${isDark ? 'text-[#f0f0f0]' : 'text-[#1e1e1e]'}`}>
              {renderFormattedExplanation(currentLine.explanation)}
            </div>
          </div>
        </div>

        {/* Optional Hint */}
        {currentLine.hint && (
          <div className="pt-1">
            <button
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Syntax Hint' : 'Need a hint for syntax?'}</span>
            </button>

            {showHint && (
              <div 
                className={`mt-2 p-3 rounded-lg border text-xs leading-relaxed animate-slideUp ${
                  isDark ? 'bg-amber-950/20 border-amber-700/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold text-amber-500">Hint: </span>
                {renderFormattedExplanation(currentLine.hint)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Progress */}
      <div 
        className="mt-4 pt-2.5 border-t flex items-center justify-between text-xs"
        style={{ borderColor: isDark ? '#333333' : '#e5e5e5' }}
      >
        <div className="flex items-center gap-2 w-full max-w-xs">
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#e0e0e0]'}`}>
            <div 
              className="h-full bg-[#007acc] transition-all duration-300"
              style={{ width: `${((currentIndex + (isCompleted ? 1 : 0)) / totalLines) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] opacity-75">
            {Math.round(((currentIndex + (isCompleted ? 1 : 0)) / totalLines) * 100)}%
          </span>
        </div>

        <span className="text-[11px] opacity-60 hidden sm:inline">
          Press <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-white border-[#d4d4d4]'}`}>Enter</kbd> to advance
        </span>
      </div>
    </div>
  );
};
