import React, { useEffect, useRef } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  X, 
  ChevronRight,
  CheckCircle2
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
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface CodeContextPanelProps {
  lesson: Lesson;
  currentIndex: number;
  completedIndices: Set<number>;
  onJumpToLine: (index: number) => void;
  settings: AppSettings;
}

export const CodeContextPanel: React.FC<CodeContextPanelProps> = ({
  lesson,
  currentIndex,
  completedIndices,
  onJumpToLine,
  settings,
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
      const grammar = Prism.languages[language] || Prism.languages.javascript || Prism.languages.plain;
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
      className="border rounded-xl shadow-md flex flex-col h-full overflow-hidden transition-colors"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
        color: isDark ? '#cccccc' : '#333333',
      }}
    >
      {/* VS Code Tab Bar */}
      <div 
        className="flex items-center justify-between border-b select-none overflow-x-auto text-xs"
        style={{
          backgroundColor: isDark ? '#252526' : '#ececec',
          borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
        }}
      >
        <div className="flex items-center">
          {/* Active File Tab */}
          <div 
            className="flex items-center gap-2 px-3 py-2 border-r border-t-2 font-mono text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              borderTopColor: '#007acc',
              borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
              color: isDark ? '#ffffff' : '#111111',
            }}
          >
            {getLanguageIcon(lesson.language, 'w-3.5 h-3.5')}
            <span className="truncate max-w-[180px]">{fileName}</span>
            <span className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded">
              <X className="w-3 h-3 opacity-60" />
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <div className="px-2">
          <button
            onClick={handleCopyFullCode}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition ${
              isDark 
                ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-[#cccccc]' 
                : 'bg-white hover:bg-[#f3f3f3] border-[#d4d4d4] text-[#333333]'
            }`}
            title="Copy full code file"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>
      </div>

      {/* VS Code Breadcrumb Bar */}
      <div 
        className="px-3 py-1 text-[11px] font-mono flex items-center gap-1 border-b opacity-80 select-none"
        style={{
          backgroundColor: isDark ? '#1e1e1e' : '#fbfbfb',
          borderColor: isDark ? '#2d2d2d' : '#f0f0f0',
        }}
      >
        <span>src</span>
        <ChevronRight className="w-3 h-3 opacity-50" />
        <span>drill</span>
        <ChevronRight className="w-3 h-3 opacity-50" />
        <span className="font-semibold">{fileName}</span>
        <ChevronRight className="w-3 h-3 opacity-50" />
        <span className="text-blue-500 font-bold">Line {currentIndex + 1}</span>
      </div>

      {/* Code Editor View */}
      <div 
        className="flex-1 overflow-y-auto font-mono text-xs sm:text-sm p-2 selection:bg-blue-500/30"
        style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
      >
        {lesson.lines.map((line, index) => {
          const isActive = index === currentIndex;
          const isCompleted = completedIndices.has(index);
          const isFuture = index > currentIndex;

          if (isFuture && !settings.peekNextLines) {
            return (
              <div 
                key={line.id}
                className="flex items-center py-0.5 px-2 select-none opacity-30 italic text-xs"
              >
                <span className="w-9 text-right pr-3 font-mono opacity-50">{line.lineNumber}</span>
                <span>• • • (Upcoming line)</span>
              </div>
            );
          }

          return (
            <div
              key={line.id}
              ref={isActive ? activeLineRef : null}
              onClick={() => onJumpToLine(index)}
              className={`flex items-stretch rounded-sm my-0.5 cursor-pointer transition-all group ${
                isActive
                  ? isDark 
                    ? 'bg-[#282828] border-l-2 border-[#007acc]' 
                    : 'bg-[#f0f4f8] border-l-2 border-[#007acc]'
                  : isCompleted
                  ? isDark ? 'hover:bg-[#252526]' : 'hover:bg-[#f5f5f5]'
                  : 'opacity-40 hover:opacity-80'
              }`}
            >
              {/* Line Number Gutter */}
              <div className={`w-9 text-right pr-3 py-0.5 select-none font-mono text-xs flex items-center justify-end shrink-0 ${
                isActive 
                  ? isDark ? 'text-white font-bold' : 'text-blue-700 font-bold' 
                  : isCompleted 
                  ? 'text-emerald-500 font-medium' 
                  : isDark ? 'text-[#858585]' : 'text-[#a0a0a0]'
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
                  className={isActive ? 'font-semibold' : ''}
                />
              </div>

              {/* Jump Pill */}
              <div className="pr-2 py-0.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isActive ? (
                  <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/15 px-1 py-0.2 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] opacity-70 bg-black/10 dark:bg-white/10 px-1 py-0.2 rounded">
                    Jump
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Bottom Info */}
      <div 
        className="px-3 py-1.5 border-t text-[11px] font-mono flex items-center justify-between opacity-80 select-none"
        style={{
          backgroundColor: isDark ? '#252526' : '#f8f9fa',
          borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
        }}
      >
        <span>{completedIndices.size} of {lesson.lines.length} lines mastered</span>
        <span className="text-blue-500 font-bold">
          {Math.round((completedIndices.size / lesson.lines.length) * 100)}% Complete
        </span>
      </div>
    </div>
  );
};
