import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CornerDownLeft, 
  Sparkles, 
  AlertCircle,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import { CodeLineItem, AppSettings } from '../types/lesson';
import { validateCodeLine, getLeadingIndentation } from '../utils/parser';

interface IDLEPromptInputProps {
  currentLine: CodeLineItem;
  currentIndex: number;
  settings: AppSettings;
  onLineCompleted: (input: string, revealedSolution: boolean) => void;
  onShowNext: () => void;
}

export const IDLEPromptInput: React.FC<IDLEPromptInputProps> = ({
  currentLine,
  currentIndex,
  settings,
  onLineCompleted,
  onShowNext,
}) => {
  const [input, setInput] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [hasRevealedSolution, setHasRevealedSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [hasSubmittedMatch, setHasSubmittedMatch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = settings.theme === 'dark';
  const targetCode = currentLine.code;
  const targetIndent = getLeadingIndentation(targetCode);
  const indentCount = targetIndent.length;

  useEffect(() => {
    setShowSolution(false);
    setHasRevealedSolution(false);
    setHasSubmittedMatch(false);
    setCopiedSolution(false);
    setInput('');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [currentLine.id, currentIndex]);

  const validation = validateCodeLine(input, targetCode, settings.strictIndentation);
  const isMatch = validation.isMatch;

  useEffect(() => {
    if (isMatch && !hasSubmittedMatch) {
      setHasSubmittedMatch(true);
      onLineCompleted(input, hasRevealedSolution);
      
      if (settings.autoAdvanceOnSuccess) {
        const timer = setTimeout(() => {
          onShowNext();
        }, 280);
        return () => clearTimeout(timer);
      }
    }
  }, [isMatch, hasSubmittedMatch, input, hasRevealedSolution, settings.autoAdvanceOnSuccess, onLineCompleted, onShowNext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isMatch) {
        onShowNext();
      }
    }

    if ((e.ctrlKey && e.code === 'Space') || (e.key === 'Tab' && !e.shiftKey && !input.trim())) {
      e.preventDefault();
      toggleShowSolution();
    }
  };

  const toggleShowSolution = () => {
    const nextState = !showSolution;
    setShowSolution(nextState);
    if (nextState) {
      setHasRevealedSolution(true);
    }
  };

  const handleInsertSolution = () => {
    setInput(targetCode.trim());
    setHasRevealedSolution(true);
    inputRef.current?.focus();
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(targetCode.trim());
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  return (
    <div 
      className="border rounded-xl p-4 sm:p-5 shadow-xs transition-colors space-y-3"
      style={{
        backgroundColor: isDark ? '#252526' : '#ffffff',
        borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        color: isDark ? '#cccccc' : '#24292f',
      }}
    >
      {/* Prompt Bar Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            IDLE Shell Prompt
          </span>

          {indentCount > 0 && (
            <span 
              className={`text-[11px] px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#1e1e1e] text-slate-400 border-[#3c3c3c]' : 'bg-[#f6f8fa] text-slate-600 border-[#d0d7de]'
              }`}
            >
              ↳ Indent: {indentCount} spaces (auto-aligned)
            </span>
          )}

          {isMatch ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulseSuccess">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Correct Code!
            </span>
          ) : input.length > 0 ? (
            <span className="text-[11px] opacity-70">
              {validation.charMatchCount}/{validation.expectedLength} chars
            </span>
          ) : null}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShowSolution}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showSolution
                ? isDark 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
                : isDark
                ? 'bg-[#1e1e1e] hover:bg-[#333333] text-[#cccccc] border-[#3c3c3c]'
                : 'bg-white hover:bg-[#f6f8fa] text-[#24292f] border-[#d0d7de]'
            }`}
            title="Show / Hide Solution (Ctrl+Space)"
          >
            {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            <span>{showSolution ? 'Hide Solution' : 'Show Solution'}</span>
          </button>

          {showSolution && (
            <button
              onClick={handleInsertSolution}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs"
              title="Insert solution line"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill</span>
            </button>
          )}
        </div>
      </div>

      {/* Solution Reveal Card */}
      {showSolution && (
        <div 
          className={`p-3 rounded-lg border text-xs animate-slideUp font-mono ${
            isDark ? 'bg-[#1e1e1e] border-amber-500/40 text-amber-300' : 'bg-amber-50/70 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1">
            <span>TARGET CODE:</span>
            <button
              onClick={handleCopySolution}
              className="opacity-80 hover:opacity-100 flex items-center gap-1 transition"
            >
              {copiedSolution ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div 
            className={`text-sm p-2 rounded border overflow-x-auto whitespace-pre font-bold ${
              isDark ? 'bg-[#181818] border-[#3c3c3c] text-white' : 'bg-white border-[#d0d7de] text-[#111111]'
            }`}
          >
            {targetCode.trim()}
          </div>
        </div>
      )}

      {/* The Python IDLE >>> Prompt Input */}
      <div className="relative">
        <div 
          className={`flex items-center rounded-lg border transition-all duration-150 ${
            isMatch 
              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' 
              : input.length > 0 && validation.firstDiffIndex !== -1 && validation.firstDiffIndex < input.length
              ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500'
              : isDark
              ? 'border-[#3c3c3c] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-[#1e1e1e]'
              : 'border-[#d0d7de] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 bg-white shadow-xs'
          }`}
        >
          {/* Iconic Python IDLE prompt >>> */}
          <div 
            className={`px-3 py-2.5 font-mono text-sm font-bold select-none border-r rounded-l-lg flex items-center justify-center min-w-[50px] ${
              isDark ? 'text-blue-400 border-[#3c3c3c] bg-[#1e1e1e]' : 'text-blue-600 border-[#d0d7de] bg-[#f6f8fa]'
            }`}
          >
            {indentCount > 0 ? '... ' : '>>> '}
          </div>

          {/* Code Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder={`Type: ${targetCode.trim()}`}
            className={`flex-1 bg-transparent font-mono text-sm sm:text-base px-3 py-2.5 outline-none ${
              isDark ? 'text-white placeholder:text-[#6a737d]' : 'text-[#1f2328] placeholder:text-[#8c959f]'
            }`}
          />

          {/* Validation Indicator */}
          <div className="pr-3 flex items-center gap-2 shrink-0">
            {isMatch ? (
              <div 
                className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-xs animate-pulseSuccess"
                title="Line correctly typed!"
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDark ? 'text-[#6a737d]' : 'text-[#8c959f]'
                }`}
                title="Type the code to match"
              >
                <CornerDownLeft className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Diff Diagnostics */}
        {input.length > 0 && !isMatch && validation.firstDiffIndex !== -1 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono animate-slideUp">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Typo at char {validation.firstDiffIndex + 1}: expected{' '}
              <code className={`px-1 py-0.5 rounded font-bold border ${
                isDark ? 'bg-[#181818] text-amber-300 border-[#3c3c3c]' : 'bg-[#f6f8fa] text-amber-900 border-[#d0d7de]'
              }`}>
                {validation.expectedCode[validation.firstDiffIndex] === ' ' ? 'space' : validation.expectedCode[validation.firstDiffIndex] || '[end of line]'}
              </code>
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between text-xs opacity-75 font-mono">
        <span className="text-[11px]">
          Indent auto-aligned • Press <kbd className="font-bold">Enter</kbd> to submit
        </span>

        {isMatch && (
          <button
            onClick={onShowNext}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs"
          >
            <span>Next Line</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
