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

interface CodeInputBoxProps {
  currentLine: CodeLineItem;
  currentIndex: number;
  settings: AppSettings;
  onLineCompleted: (input: string, revealedSolution: boolean) => void;
  onShowNext: () => void;
}

export const CodeInputBox: React.FC<CodeInputBoxProps> = ({
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
    setInput(settings.strictIndentation ? targetCode : targetCode.trim());
    setHasRevealedSolution(true);
    inputRef.current?.focus();
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(settings.strictIndentation ? targetCode : targetCode.trim());
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const indentCount = targetIndent.length;

  return (
    <div 
      className="border rounded-xl p-4 sm:p-5 shadow-md transition-all space-y-3.5"
      style={{
        backgroundColor: isDark ? '#252526' : '#f8f9fa',
        borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
        color: isDark ? '#cccccc' : '#333333',
      }}
    >
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Code Input</span>
          </div>

          {indentCount > 0 && (
            <span 
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#1e1e1e] text-slate-400 border-[#3c3c3c]' : 'bg-white text-slate-600 border-[#d4d4d4]'
              }`}
            >
              ↳ Indent: {indentCount} spaces (auto-aligned)
            </span>
          )}

          {isMatch ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 animate-pulseSuccess">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Correct Line!
            </span>
          ) : input.length > 0 ? (
            <span className="text-[11px] font-mono opacity-70">
              {validation.charMatchCount}/{validation.expectedLength} chars
            </span>
          ) : null}
        </div>

        {/* Solution Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShowSolution}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showSolution
                ? isDark 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
                : isDark
                ? 'bg-[#1e1e1e] hover:bg-[#333333] text-[#cccccc] border-[#3c3c3c]'
                : 'bg-white hover:bg-[#ececec] text-[#333333] border-[#d4d4d4]'
            }`}
            title="Toggle Solution (Ctrl+Space)"
          >
            {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-500" />}
            <span>{showSolution ? 'Hide' : 'Show Solution'}</span>
          </button>

          {showSolution && (
            <button
              onClick={handleInsertSolution}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#007acc] hover:bg-[#0062a3] text-white transition shadow-xs"
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
          className={`p-3 rounded-lg border text-xs animate-slideUp ${
            isDark ? 'bg-[#1e1e1e] border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
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
            className={`font-mono text-sm p-2 rounded border overflow-x-auto whitespace-pre font-semibold ${
              isDark ? 'bg-[#181818] border-[#3c3c3c] text-white' : 'bg-white border-[#d4d4d4] text-[#111111]'
            }`}
          >
            {targetCode.trim()}
          </div>
        </div>
      )}

      {/* Interactive Code Input Box */}
      <div className="relative">
        <div 
          className={`flex items-center rounded-lg border transition-all duration-200 ${
            isMatch 
              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' 
              : input.length > 0 && validation.firstDiffIndex !== -1 && validation.firstDiffIndex < input.length
              ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500'
              : isDark
              ? 'border-[#3c3c3c] focus-within:border-[#007acc] focus-within:ring-1 focus-within:ring-[#007acc] bg-[#1e1e1e]'
              : 'border-[#cecece] focus-within:border-[#007acc] focus-within:ring-1 focus-within:ring-[#007acc] bg-white'
          }`}
        >
          {/* Line Number Gutter */}
          <div 
            className={`px-3 py-2.5 font-mono text-xs select-none border-r rounded-l-lg flex items-center justify-center min-w-[40px] ${
              isDark ? 'text-[#858585] border-[#3c3c3c] bg-[#252526]' : 'text-[#717171] border-[#e0e0e0] bg-[#f0f0f0]'
            }`}
          >
            {currentLine.lineNumber}
          </div>

          {/* Indent Guide */}
          {indentCount > 0 && (
            <div 
              className={`px-2 py-2.5 font-mono text-xs select-none border-r flex items-center gap-1 ${
                isDark ? 'border-[#3c3c3c]/60 text-slate-500' : 'border-[#e0e0e0]/60 text-slate-500'
              }`}
              title={`Indented by ${indentCount} spaces (no need to type spaces)`}
            >
              <span className="text-blue-500">↳</span>
              <span className="text-[10px]">{indentCount}sp</span>
            </div>
          )}

          {/* Input */}
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
              isDark ? 'text-white placeholder:text-[#6a737d]' : 'text-[#111111] placeholder:text-[#999999]'
            }`}
          />

          {/* Checkmark indicator */}
          <div className="pr-3 flex items-center gap-2 shrink-0">
            {isMatch ? (
              <div 
                className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-sm animate-pulseSuccess"
                title="Correct Line!"
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDark ? 'text-[#6a737d]' : 'text-[#a0a0a0]'
                }`}
                title="Type the code to match"
              >
                <CornerDownLeft className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Diff hint */}
        {input.length > 0 && !isMatch && validation.firstDiffIndex !== -1 && validation.firstDiffIndex < validation.userCode.length && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-mono animate-slideUp">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Typo at char {validation.firstDiffIndex + 1}: expected{' '}
              <code className={`px-1 py-0.5 rounded font-bold border ${
                isDark ? 'bg-[#1e1e1e] text-amber-300 border-[#3c3c3c]' : 'bg-white text-amber-800 border-[#d4d4d4]'
              }`}>
                {validation.expectedCode[validation.firstDiffIndex] === ' ' ? 'space' : validation.expectedCode[validation.firstDiffIndex] || '[end of line]'}
              </code>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs opacity-75">
        <span className="text-[11px]">
          Auto-aligned indentation • Press <kbd className="font-mono font-bold">Enter</kbd> to proceed
        </span>

        {isMatch && (
          <button
            onClick={onShowNext}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-semibold text-xs transition shadow-xs"
          >
            <span>Next Line</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
