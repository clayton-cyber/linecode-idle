import React, { useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { Lesson, AppSettings } from '../types/lesson';
import { getLanguageIcon, getFileExtension } from '../utils/fileIcons';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';

interface IDLEEditorPanelProps {
  lesson: Lesson;
  currentIndex: number;
  completedIndices: Set<number>;
  onJumpToLine: (index: number) => void;
  settings: AppSettings;
  drillLineIndices?: Set<number> | null;
  onToggleLineSelection?: (index: number) => void;
}

export const IDLEEditorPanel: React.FC<IDLEEditorPanelProps> = ({
  lesson,
  currentIndex,
  completedIndices,
  onJumpToLine,
  settings,
  drillLineIndices,
  onToggleLineSelection,
}) => {
  const [copied, setCopied] = React.useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const isDark = settings.theme === 'dark';

  const fileName = lesson.title.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) + getFileExtension(lesson.language);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  const highlightCode = (code: string, language: string): string => {
    try {
      const grammar = Prism.languages[language] || Prism.languages.python || Prism.languages.javascript;
      return Prism.highlight(code, grammar, language);
    } catch {
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  const handleCopyFullCode = () => {
    const fullCode = lesson.lines.map(l => l.code).join('\n');
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="border rounded-xl shadow-xs flex flex-col h-full overflow-hidden transition-colors"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        color: isDark ? '#cccccc' : '#24292f',
      }}
    >
      {/* Editor Title Bar */}
      <div 
        className="px-3.5 py-2 border-b flex items-center justify-between select-none text-xs font-mono"
        style={{
          backgroundColor: isDark ? '#252526' : '#f6f8fa',
          borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        }}
      >
        <div className="flex items-center gap-2">
          {getLanguageIcon(lesson.language, 'w-3.5 h-3.5')}
          <span className="font-bold text-slate-900 dark:text-slate-100">{fileName}</span>
          <span className="text-[11px] opacity-60">(Script Editor)</span>
          
          <label className="flex items-center gap-1.5 ml-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              checked={drillLineIndices == null || drillLineIndices.size === lesson.lines.length}
              onChange={() => onToggleLineSelection?.(-1)}
              className="w-3 h-3 cursor-pointer"
            />
            <span className="text-[10px] opacity-70">All</span>
          </label>
        </div>

        <button
          onClick={handleCopyFullCode}
          className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border transition ${
            isDark 
              ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-white' 
              : 'bg-white hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
          }`}
          title="Copy complete source code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy All'}</span>
        </button>
      </div>

      {/* Editor Line-by-Line Code View */}
      <div 
        className="flex-1 overflow-y-auto font-mono text-xs sm:text-sm p-2"
        style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
      >
        {lesson.lines.map((line, index) => {
          const isActive = index === currentIndex;
          const isCompleted = completedIndices.has(index);
          const isIncluded = drillLineIndices ? drillLineIndices.has(index) : true;

          return (
            <div
              key={line.id}
              ref={isActive ? activeLineRef : null}
              onClick={() => {
                if (isIncluded) {
                  onJumpToLine(index);
                }
              }}
              className={`flex items-stretch rounded-sm my-0.5 transition-all group ${
                isIncluded ? 'cursor-pointer' : 'cursor-not-allowed opacity-40 grayscale'
              } ${
                isActive
                  ? isDark 
                    ? 'bg-[#282828] border-l-2 border-blue-500' 
                    : 'bg-[#eef4fb] border-l-2 border-blue-600'
                  : isCompleted && isIncluded
                  ? isDark ? 'hover:bg-[#252526]' : 'hover:bg-[#f6f8fa]'
                  : isIncluded
                  ? 'opacity-80 hover:opacity-100'
                  : ''
              }`}
            >
              {/* Line Gutter with Checkbox */}
              <div className="flex items-center pl-1 pr-1 w-6 shrink-0 border-r border-transparent">
                <input
                  type="checkbox"
                  checked={isIncluded}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (onToggleLineSelection) {
                      onToggleLineSelection(index);
                    }
                  }}
                  title="Include in drill"
                  className="w-3 h-3 cursor-pointer opacity-40 group-hover:opacity-100"
                />
              </div>

              {/* Line Number */}
              <div className={`w-8 text-right pr-2 py-0.5 select-none font-mono text-xs flex items-center justify-end shrink-0 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : isCompleted 
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                  : isDark ? 'text-[#858585]' : 'text-[#8c959f]'
              }`}>
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-0.5" />
                ) : (
                  line.lineNumber
                )}
              </div>

              {/* Code Line */}
              <div className="flex-1 py-0.5 px-2 overflow-x-auto whitespace-pre">
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(line.code, lesson.language),
                  }}
                  className={isActive ? 'font-bold' : ''}
                />
              </div>

              {/* Jump Label */}
              <div className="pr-2 py-0.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] opacity-70 bg-black/10 dark:bg-white/10 px-1 py-0.2 rounded font-sans">
                  {isActive ? 'Active' : 'Jump'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Status Footer */}
      <div 
        className="px-3 py-1.5 border-t text-[11px] font-mono flex items-center justify-between opacity-80 select-none"
        style={{
          backgroundColor: isDark ? '#252526' : '#f6f8fa',
          borderColor: isDark ? '#3c3c3c' : '#d0d7de',
        }}
      >
        <span>{completedIndices.size}/{lesson.lines.length} lines mastered</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          {Math.round((completedIndices.size / lesson.lines.length) * 100)}% Mastered
        </span>
      </div>
    </div>
  );
};
