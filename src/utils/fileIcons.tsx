import React from 'react';
import { 
  FileCode, 
  Terminal, 
  Database, 
  FileText, 
  Code, 
  Layers
} from 'lucide-react';
import { Lesson } from '../types/lesson';

export function getLanguageIcon(lang: Lesson['language'], className: string = 'w-4 h-4') {
  switch (lang) {
    case 'python':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-xs text-amber-500 font-mono ${className}`}>
          🐍
        </span>
      );
    case 'javascript':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] bg-amber-400 text-slate-950 rounded px-1 font-mono ${className}`}>
          JS
        </span>
      );
    case 'typescript':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] bg-blue-500 text-white rounded px-1 font-mono ${className}`}>
          TS
        </span>
      );
    case 'sql':
      return <Database className={`text-emerald-500 ${className}`} />;
    case 'rust':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-xs ${className}`}>
          🦀
        </span>
      );
    case 'go':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] bg-cyan-500 text-slate-950 rounded px-1 font-mono ${className}`}>
          GO
        </span>
      );
    case 'cpp':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-[10px] bg-blue-600 text-white rounded px-1 font-mono ${className}`}>
          C++
        </span>
      );
    default:
      return <FileCode className={`text-blue-500 ${className}`} />;
  }
}

export function getFileExtension(lang: Lesson['language']): string {
  switch (lang) {
    case 'python': return '.py';
    case 'javascript': return '.js';
    case 'typescript': return '.ts';
    case 'sql': return '.sql';
    case 'rust': return '.rs';
    case 'go': return '.go';
    case 'cpp': return '.cpp';
    case 'html': return '.html';
    case 'css': return '.css';
    default: return '.txt';
  }
}

export function detectLanguageFromFilename(filename: string): Lesson['language'] {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.jsx')) return 'typescript';
  if (lower.endsWith('.sql')) return 'sql';
  if (lower.endsWith('.rs')) return 'rust';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.cpp') || lower.endsWith('.c') || lower.endsWith('.h') || lower.endsWith('.hpp')) return 'cpp';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  return 'python';
}
