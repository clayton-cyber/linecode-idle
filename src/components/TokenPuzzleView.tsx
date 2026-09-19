import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Puzzle, 
  Sparkles, 
  Lightbulb, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  Layers, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Lesson, AppSettings, PuzzleDifficulty, TokenItem, PuzzleStats } from '../types/lesson';
import { buildPuzzleLine, getTokenStyle } from '../utils/tokenizer';
import { IDLEAnalysisDoc } from './IDLEAnalysisDoc';
import { IDLEEditorPanel } from './IDLEEditorPanel';
import { CompletionModal } from './CompletionModal';
import { sounds } from '../utils/sound';
import { getLanguageIcon } from '../utils/fileIcons';

interface TokenPuzzleViewProps {
  lesson: Lesson;
  settings: AppSettings;
  onNextLesson?: () => void;
  currentIndex: number;
  onJumpToLine: (index: number) => void;
  completedIndices: Set<number>;
  setCompletedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  drillLineIndices: Set<number> | null;
  hintedIndices: Set<number>;
  setHintedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  onToggleLineSelection: (index: number) => void;
  onSetDrillLineIndices: (indices: Set<number> | null) => void;
  viewMode: 'split' | 'focus';
  onToggleViewMode: () => void;
}

export const TokenPuzzleView: React.FC<TokenPuzzleViewProps> = ({
  lesson,
  settings,
  onNextLesson,
  currentIndex,
  onJumpToLine,
  completedIndices,
  setCompletedIndices,
  drillLineIndices,
  hintedIndices,
  setHintedIndices,
  onToggleLineSelection,
  onSetDrillLineIndices,
  viewMode,
}) => {
  const isDark = settings.theme === 'dark';
  const totalLines = lesson.lines.length;
  const currentLine = lesson.lines[currentIndex] || lesson.lines[0];

  // Game configuration state
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>('hard');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Scoring & Game stats state
  const [puzzleStats, setPuzzleStats] = useState<PuzzleStats>({
    completedLines: 0,
    totalAttempts: 0,
    revealedSolutions: 0,
    streak: 0,
    startTime: Date.now(),
    score: 0,
    comboMultiplier: 1,
    hintsUsed: 0,
  });

  // Current line puzzle data
  const puzzleData = useMemo(() => {
    return buildPuzzleLine(currentLine.code, lesson.language, difficulty);
  }, [currentLine.code, lesson.language, difficulty]);

  // Placed tokens state: maps slotIndex (number) -> placed TokenItem or null
  const [placedTokens, setPlacedTokens] = useState<Record<number, TokenItem | null>>({});
  const [draggedToken, setDraggedToken] = useState<TokenItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [hintSlot, setHintSlot] = useState<number | null>(null);
  const [isLineSolved, setIsLineSolved] = useState(false);

  // Reset placed tokens whenever line or puzzleData changes
  useEffect(() => {
    setPlacedTokens({});
    setIsErrorShake(false);
    setHintSlot(null);
    setIsLineSolved(false);
  }, [currentIndex, puzzleData]);

  // Calculate available tokens in the bank (all bank tokens minus those currently placed)
  const availableBankTokens = useMemo(() => {
    const placedIds = new Set(
      Object.values(placedTokens)
        .filter((t): t is TokenItem => t !== null)
        .map(t => t.id)
    );
    return puzzleData.bankTokens.filter(token => !placedIds.has(token.id));
  }, [puzzleData.bankTokens, placedTokens]);

  // Handle slot placement
  const placeTokenInSlot = useCallback((slotIndex: number, token: TokenItem) => {
    if (settings.soundEffects) {
      sounds.playDrop();
    }
    setPlacedTokens(prev => {
      const next = { ...prev };
      // If token was in another slot, remove it from old slot
      Object.keys(next).forEach(key => {
        const k = Number(key);
        if (next[k]?.id === token.id) {
          next[k] = null;
        }
      });
      next[slotIndex] = token;
      return next;
    });
    setHintSlot(null);
  }, [settings.soundEffects]);

  // Handle removing a token from a slot back to the bank
  const removeTokenFromSlot = useCallback((slotIndex: number) => {
    if (settings.soundEffects) {
      sounds.playRemove();
    }
    setPlacedTokens(prev => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
  }, [settings.soundEffects]);

  // Find next open blank slot index
  const getNextEmptySlot = useCallback(() => {
    for (let i = 0; i < puzzleData.blankSlotsCount; i++) {
      if (!placedTokens[i]) {
        return i;
      }
    }
    return -1;
  }, [puzzleData.blankSlotsCount, placedTokens]);

  // Quick click chip in bank -> place into next open slot
  const handleBankTokenClick = useCallback((token: TokenItem) => {
    const nextEmpty = getNextEmptySlot();
    if (nextEmpty !== -1) {
      placeTokenInSlot(nextEmpty, token);
    }
  }, [getNextEmptySlot, placeTokenInSlot]);

  // Check answers
  const checkSolution = useCallback(() => {
    // Collect all expected blanks
    const expectedSlots: Record<number, string> = {};
    puzzleData.tokens.forEach(t => {
      if (t.isBlank && t.slotIndex !== undefined) {
        expectedSlots[t.slotIndex] = t.text;
      }
    });

    let allCorrect = true;
    for (let i = 0; i < puzzleData.blankSlotsCount; i++) {
      const placed = placedTokens[i];
      if (!placed || placed.text !== expectedSlots[i]) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect && puzzleData.blankSlotsCount > 0) {
      // SUCCESS!
      setIsLineSolved(true);
      if (settings.soundEffects) {
        sounds.playCorrect();
        if (puzzleStats.streak > 0) {
          sounds.playCombo(puzzleStats.streak + 1);
        }
      }

      const diffMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
      const points = 100 * diffMultiplier * puzzleStats.comboMultiplier;

      setCompletedIndices(prev => new Set(prev).add(currentIndex));
      setPuzzleStats(prev => ({
        ...prev,
        completedLines: prev.completedLines + 1,
        streak: prev.streak + 1,
        comboMultiplier: Math.min(5, prev.comboMultiplier + 0.5),
        score: prev.score + points,
      }));

      // Auto advance after brief delay
      setTimeout(() => {
        let nextIdx = currentIndex + 1;
        if (drillLineIndices) {
          while (nextIdx < totalLines && !drillLineIndices.has(nextIdx)) {
            nextIdx++;
          }
        }
        if (nextIdx < totalLines) {
          onJumpToLine(nextIdx);
        } else {
          setPuzzleStats(prev => ({ ...prev, endTime: Date.now() }));
          setIsCompletionModalOpen(true);
          if (settings.soundEffects) {
            sounds.playVictory();
          }
        }
      }, 700);

    } else {
      // INCORRECT
      if (settings.soundEffects) {
        sounds.playError();
      }
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);

      setPuzzleStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        streak: 0,
        comboMultiplier: 1,
      }));
    }
  }, [
    puzzleData.tokens,
    puzzleData.blankSlotsCount,
    placedTokens,
    settings.soundEffects,
    puzzleStats.streak,
    puzzleStats.comboMultiplier,
    difficulty,
    setCompletedIndices,
    currentIndex,
    totalLines,
    onJumpToLine,
  ]);

  // Auto-check whenever all slots are filled
  useEffect(() => {
    const filledCount = Object.values(placedTokens).filter(Boolean).length;
    if (puzzleData.blankSlotsCount > 0 && filledCount === puzzleData.blankSlotsCount && !isLineSolved) {
      checkSolution();
    }
  }, [placedTokens, puzzleData.blankSlotsCount, isLineSolved, checkSolution]);

  // Hint button: Fills 1 missing slot with the correct token
  const handleUseHint = () => {
    // Find first incorrect or empty slot
    const expectedSlots: Record<number, TokenItem> = {};
    puzzleData.tokens.forEach(t => {
      if (t.isBlank && t.slotIndex !== undefined) {
        expectedSlots[t.slotIndex] = t;
      }
    });

    for (let i = 0; i < puzzleData.blankSlotsCount; i++) {
      const placed = placedTokens[i];
      const correct = expectedSlots[i];
      if (!placed || placed.text !== correct.text) {
        // Find corresponding bank token
        // First try to find one that isn't placed anywhere
        const unplacedTokens = puzzleData.bankTokens.filter(bt => !Object.values(placedTokens).some(pt => pt?.id === bt.id));
        let bankToken = unplacedTokens.find(bt => bt.text === correct.text);
        
        if (!bankToken) {
          // If all matching tokens are placed, find one that is placed in the wrong slot
          const wrongPlacedTokens = Object.entries(placedTokens)
            .filter(([sIdx, pt]) => pt && expectedSlots[parseInt(sIdx, 10)]?.text !== pt.text)
            .map(([_, pt]) => pt as TokenItem);
          bankToken = wrongPlacedTokens.find(bt => bt.text === correct.text);
        }

        if (!bankToken) {
          // Fallback to any token that isn't the one currently placed here
          bankToken = puzzleData.bankTokens.find(bt => bt.text === correct.text && bt.id !== placed?.id);
        }

        if (bankToken) {
          placeTokenInSlot(i, bankToken);
          setHintSlot(i);
          setHintedIndices(prev => new Set(prev).add(currentIndex));
          setPuzzleStats(prev => ({
            ...prev,
            hintsUsed: prev.hintsUsed + 1,
            score: Math.max(0, prev.score - 25),
          }));
          break;
        }
      }
    }
  };

  // Clear line
  const handleResetLine = () => {
    if (settings.soundEffects) {
      sounds.playRemove();
    }
    setPlacedTokens({});
    setHintSlot(null);
  };

  // Restart the entire drill from scratch
  const handleRestartDrill = () => {
    let firstIdx = 0;
    if (drillLineIndices) {
      while (firstIdx < totalLines && !drillLineIndices.has(firstIdx)) firstIdx++;
    }
    if (firstIdx >= totalLines) firstIdx = 0;
    onJumpToLine(firstIdx);
    setCompletedIndices(new Set());
    setHintedIndices(new Set());
    setPuzzleStats({
      completedLines: 0,
      totalAttempts: 0,
      revealedSolutions: 0,
      streak: 0,
      startTime: Date.now(),
      score: 0,
      comboMultiplier: 1,
      hintsUsed: 0,
    });
  };

  // Keyboard shortcut listener (1-9 to select bank token, Backspace to remove, Enter to advance/check)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input/textarea, ignore
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= availableBankTokens.length) {
        const tokenToPlace = availableBankTokens[num - 1];
        if (tokenToPlace) {
          handleBankTokenClick(tokenToPlace);
        }
      } else if (e.key === 'Backspace') {
        // Remove last filled slot
        for (let i = puzzleData.blankSlotsCount - 1; i >= 0; i--) {
          if (placedTokens[i]) {
            removeTokenFromSlot(i);
            break;
          }
        }
      } else if (e.key === 'h' || e.key === 'H') {
        handleUseHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableBankTokens, handleBankTokenClick, puzzleData.blankSlotsCount, placedTokens, removeTokenFromSlot]);

  return (
    <div className="h-full p-4 lg:p-6 overflow-y-auto space-y-4">
      
      {/* 1. Header Bar: Game Mode Banner & Quick Stats */}
      <div 
        className="p-3.5 rounded-xl border text-xs font-mono select-none flex flex-wrap items-center justify-between gap-3 shadow-xs"
        style={{
          backgroundColor: isDark ? '#252526' : '#ffffff',
          borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-purple-600 dark:text-purple-400">Token Drop Challenge</span>
              <span className="opacity-40">•</span>
              <span className="text-slate-900 dark:text-slate-100">{lesson.title}</span>
            </div>
            <div className="text-[11px] opacity-70 font-sans">
              Drag or click tokens into the blank code slots to complete the syntax
            </div>
          </div>
        </div>

        {/* Live Score & Streak Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Combo Multiplier */}
          {puzzleStats.streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{puzzleStats.comboMultiplier}x Multiplier</span>
            </div>
          )}

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Streak: {puzzleStats.streak}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{puzzleStats.score} pts</span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className={`grid gap-5 items-start ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
        
        {/* Left Column: Puzzle Board */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} space-y-4`}>
          
          {/* Core Interactive Token Drop Board */}
          <div 
            className={`p-4 sm:p-5 rounded-xl border transition shadow-sm ${
              isErrorShake ? 'animate-shake border-rose-500 ring-2 ring-rose-500/30' : ''
            } ${isLineSolved ? 'border-emerald-500 ring-2 ring-emerald-500/30' : ''}`}
            style={{
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              borderColor: isDark ? '#3c3c3c' : '#d0d7de',
            }}
          >
            {/* Header with Line Number & Token Target Counter */}
            <div className="flex items-center justify-between pb-3 border-b mb-4 text-xs font-mono" style={{ borderColor: isDark ? '#2d2d2d' : '#f0f0f0' }}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white text-[11px]">
                  Line {currentLine.lineNumber}
                </span>
                <span className="opacity-70 font-sans text-xs">
                  Fill in <strong className="text-purple-600 dark:text-purple-400">{puzzleData.blankSlotsCount}</strong> missing token{puzzleData.blankSlotsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Code Line Display with Interactive Drop Target Slots */}
            <div 
              className="p-4 rounded-xl font-mono text-sm sm:text-base border flex flex-wrap items-center gap-y-2.5 min-h-[64px] shadow-inner select-none"
              style={{
                backgroundColor: isDark ? '#141414' : '#f6f8fa',
                borderColor: isDark ? '#2d2d2d' : '#e1e4e8',
              }}
            >
              {/* Leading Indentation spaces */}
              {puzzleData.leadingIndent && (
                <span className="opacity-30 whitespace-pre tracking-widest font-mono select-none text-slate-500">
                  {puzzleData.leadingIndent.replace(/ /g, '·')}
                </span>
              )}

              {/* Line Tokens */}
              {puzzleData.tokens.map((token, index) => {
                if (token.type === 'whitespace') {
                  return <span key={token.id || index} className="whitespace-pre"> </span>;
                }

                // If this is a blank slot
                if (token.isBlank && token.slotIndex !== undefined) {
                  const slotIdx = token.slotIndex;
                  const placed = placedTokens[slotIdx];
                  const isOver = dragOverSlot === slotIdx;
                  const isHinted = hintSlot === slotIdx;

                  return (
                    <div
                      key={`slot-${slotIdx}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverSlot(slotIdx);
                      }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverSlot(null);
                        if (draggedToken) {
                          placeTokenInSlot(slotIdx, draggedToken);
                          setDraggedToken(null);
                        }
                      }}
                      className={`relative min-w-[72px] h-8 sm:h-9 px-2 rounded-lg border-2 flex items-center justify-center transition-all ${
                        placed
                          ? 'border-solid cursor-pointer shadow-sm animate-scaleIn'
                          : isOver
                          ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/40 scale-105'
                          : isHinted
                          ? 'border-amber-400 bg-amber-400/20 animate-pulse'
                          : isDark
                          ? 'border-dashed border-[#444] bg-[#1f1f1f]/80 hover:border-purple-400/60'
                          : 'border-dashed border-[#c0c6cc] bg-[#eef1f5] hover:border-purple-500/60'
                      }`}
                      style={{
                        borderColor: placed 
                          ? isLineSolved 
                            ? '#10b981' 
                            : isDark ? '#7c3aed' : '#8b5cf6' 
                          : undefined
                      }}
                      onClick={() => {
                        if (placed) {
                          removeTokenFromSlot(slotIdx);
                        }
                      }}
                      title={placed ? `Click to return '${placed.text}' to bank` : 'Drag token here or click from bank'}
                    >
                      {placed ? (
                        <div className="flex items-center gap-1 font-bold text-sm">
                          <span className={getTokenStyle(placed.type, isDark).text}>
                            {placed.text}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-sans opacity-40 select-none">
                          slot #{slotIdx + 1}
                        </span>
                      )}
                    </div>
                  );
                }

                // Fixed / Anchor Code Token
                const style = getTokenStyle(token.type, isDark);
                return (
                  <span 
                    key={token.id || index}
                    className={`font-mono font-medium ${style.text}`}
                  >
                    {token.text}
                  </span>
                );
              })}
            </div>

            {/* Token Bank Area */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono opacity-80 select-none">
                <div className="flex items-center gap-1.5 font-bold">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Token Bank ({availableBankTokens.length} available)</span>
                </div>
                <span className="text-[11px] font-sans opacity-60">
                  Tip: Press keys <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold">1</kbd>-<kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold">9</kbd> to quick-place
                </span>
              </div>

              {/* Chip Pool */}
              <div 
                className="p-3.5 rounded-xl border flex flex-wrap gap-2.5 min-h-[64px] items-center transition"
                style={{
                  backgroundColor: isDark ? '#252526' : '#fbfcfd',
                  borderColor: isDark ? '#3c3c3c' : '#e1e4e8',
                }}
              >
                {availableBankTokens.length === 0 ? (
                  <div className="w-full text-center py-2 text-xs font-sans opacity-60 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>All tokens placed! Checking code line...</span>
                  </div>
                ) : (
                  availableBankTokens.map((token, index) => {
                    const style = getTokenStyle(token.type, isDark);

                    return (
                      <button
                        key={token.id}
                        draggable
                        onDragStart={() => setDraggedToken(token)}
                        onDragEnd={() => setDraggedToken(null)}
                        onClick={() => handleBankTokenClick(token)}
                        className={`group px-3 py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-bold flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all shadow-xs ${style.bg} ${style.border} ${style.text}`}
                        title={`Click to place in slot, or drag into slot (${token.type})`}
                      >
                        <span className="text-[10px] px-1 py-0.2 rounded font-sans opacity-60 bg-black/10 dark:bg-white/10 font-normal">
                          {index + 1}
                        </span>
                        <span>{token.text}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2" style={{ borderColor: isDark ? '#2d2d2d' : '#f0f0f0' }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseHint}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30"
                  title="Reveal one correct token (-25 pts) [Shortcut: H]"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Hint</span>
                </button>

                <button
                  onClick={handleResetLine}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                    isDark ? 'border-[#3c3c3c] hover:bg-[#252526] text-[#858585]' : 'border-[#d0d7de] hover:bg-[#f6f8fa] text-[#57606a]'
                  }`}
                  title="Clear all placed tokens from this line"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Skip / Reveal current line
                    setCompletedIndices(prev => new Set(prev).add(currentIndex));
                    setHintedIndices(prev => new Set(prev).add(currentIndex));
                    let nextIdx = currentIndex + 1;
                    if (drillLineIndices) {
                      while (nextIdx < totalLines && !drillLineIndices.has(nextIdx)) {
                        nextIdx++;
                      }
                    }
                    if (nextIdx < totalLines) {
                      onJumpToLine(nextIdx);
                    } else {
                      setPuzzleStats(prev => ({ ...prev, endTime: Date.now() }));
                      setIsCompletionModalOpen(true);
                      if (settings.soundEffects) sounds.playVictory();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                    isDark ? 'border-[#3c3c3c] hover:bg-[#252526] text-[#858585]' : 'border-[#d0d7de] hover:bg-[#f6f8fa] text-[#57606a]'
                  }`}
                >
                  <span>Skip Line</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Line Navigator Bubbles */}
          <div 
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: isDark ? '#252526' : '#ffffff',
              borderColor: isDark ? '#3c3c3c' : '#d0d7de',
            }}
          >
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-70 mb-2 flex items-center justify-between">
              <span>Puzzle Progress — {completedIndices.size}/{totalLines} lines</span>
              <button
                onClick={handleRestartDrill}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold transition ${
                  isDark
                    ? 'border-[#3c3c3c] hover:bg-[#333333] text-[#858585] hover:text-white'
                    : 'border-[#d0d7de] hover:bg-[#f0f0f0] text-[#57606a]'
                }`}
                title="Restart the drill from the beginning"
              >
                <RotateCcw className="w-3 h-3" />
                Restart Drill
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
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
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

        {/* Right Column: Live Script Editor Panel in split mode */}
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
        stats={puzzleStats}
        onRestart={() => {
          let firstIdx = 0;
          if (drillLineIndices) {
            while (firstIdx < totalLines && !drillLineIndices.has(firstIdx)) firstIdx++;
          }
          if (firstIdx >= totalLines) firstIdx = 0;

          onJumpToLine(firstIdx);
          setCompletedIndices(new Set());
          setHintedIndices(new Set());
          setPuzzleStats({
            completedLines: 0,
            totalAttempts: 0,
            revealedSolutions: 0,
            streak: 0,
            startTime: Date.now(),
            score: 0,
            comboMultiplier: 1,
            hintsUsed: 0,
          });
          setIsCompletionModalOpen(false);
        }}
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
          setPuzzleStats({
            completedLines: 0,
            totalAttempts: 0,
            revealedSolutions: 0,
            streak: 0,
            startTime: Date.now(),
            score: 0,
            comboMultiplier: 1,
            hintsUsed: 0,
          });
          setIsCompletionModalOpen(false);
        }}
      />

    </div>
  );
};
