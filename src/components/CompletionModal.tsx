import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  Timer, 
  Zap,
  Sparkles
} from 'lucide-react';
import { Lesson, UserStats, AppSettings } from '../types/lesson';
import { sounds } from '../utils/sound';

interface CompletionModalProps {
  isOpen: boolean;
  lesson: Lesson;
  stats: UserStats;
  onRestart: () => void;
  onNextLesson?: () => void;
  onClose: () => void;
  soundEnabled: boolean;
  settings: AppSettings;
  hintedIndices?: Set<number>;
  onRetakeHinted?: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  lesson,
  stats,
  onRestart,
  onNextLesson,
  onClose,
  soundEnabled,
  settings,
  hintedIndices,
  onRetakeHinted,
}) => {
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        sounds.playVictory();
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#007acc', '#4ec9b0', '#f59e0b', '#ec4899', '#c586c0']
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#007acc', '#4ec9b0']
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#007acc', '#ec4899']
        });
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const totalLines = lesson.lines.length;
  const elapsedSeconds = Math.max(1, Math.round(((stats.endTime || Date.now()) - stats.startTime) / 1000));
  const accuracy = Math.round(Math.max(0, ((totalLines - stats.revealedSolutions) / totalLines) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-slideUp">
      <div 
        className="border rounded-2xl w-full max-w-md shadow-2xl p-6 text-center relative overflow-hidden transition-colors"
        style={{
          backgroundColor: isDark ? '#252526' : '#ffffff',
          borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
          color: isDark ? '#cccccc' : '#333333',
        }}
      >
        {/* Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

        {/* Trophy */}
        <div className="w-14 h-14 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 mx-auto flex items-center justify-center mb-3">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          File Mastered!
        </h2>
        <p className="text-xs opacity-75 mb-5">
          You completed all {totalLines} lines of <span className="font-bold text-blue-500">{lesson.title}</span>.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div 
            className={`p-2.5 rounded-xl border text-center ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f8f9fa] border-[#e5e5e5]'
            }`}
          >
            <div className="text-base font-bold font-mono text-blue-500">{totalLines}</div>
            <div className="text-[10px] uppercase font-bold opacity-60">Lines</div>
          </div>

          <div 
            className={`p-2.5 rounded-xl border text-center ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f8f9fa] border-[#e5e5e5]'
            }`}
          >
            <div className="text-base font-bold font-mono text-emerald-500">{accuracy}%</div>
            <div className="text-[10px] uppercase font-bold opacity-60">Recall</div>
          </div>

          <div 
            className={`p-2.5 rounded-xl border text-center ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f8f9fa] border-[#e5e5e5]'
            }`}
          >
            <div className="text-base font-bold font-mono text-amber-500">{elapsedSeconds}s</div>
            <div className="text-[10px] uppercase font-bold opacity-60">Time</div>
          </div>
        </div>

        {stats.revealedSolutions > 0 && (
          <div 
            className={`text-[11px] mb-5 py-1.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 ${
              isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f8f9fa] border-[#e5e5e5]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Used solution reveal for {stats.revealedSolutions} line{stats.revealedSolutions === 1 ? '' : 's'}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="w-full py-2.5 px-4 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <span>Next File</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {hintedIndices && hintedIndices.size > 0 && onRetakeHinted && (
            <button
              onClick={onRetakeHinted}
              className={`w-full py-2 px-4 rounded border text-xs font-medium flex items-center justify-center gap-2 transition mb-2 ${
                isDark 
                  ? 'bg-[#1e1e1e] hover:bg-[#333333] border-amber-500/50 text-amber-400' 
                  : 'bg-white hover:bg-amber-50 border-amber-400 text-amber-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Retake Hinted Lines ({hintedIndices.size})</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className={`w-full py-2 px-4 rounded border text-xs font-medium flex items-center justify-center gap-2 transition ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-white' 
                : 'bg-white hover:bg-[#ececec] border-[#d4d4d4] text-[#333333]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
            <span>Practice Again</span>
          </button>
        </div>

      </div>
    </div>
  );
};
