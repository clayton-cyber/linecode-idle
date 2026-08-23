export interface CodeLineItem {
  id: string;
  lineNumber: number;
  code: string;
  explanation: string;
  hint?: string;
  category?: 'definition' | 'logic' | 'return' | 'control' | 'import' | 'general';
}

export interface Lesson {
  id: string;
  title: string;
  language: 'python' | 'javascript' | 'typescript' | 'sql' | 'go' | 'rust' | 'cpp' | 'html' | 'css' | 'other';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  lines: CodeLineItem[];
  rawSource?: string;
  createdAt: number;
  isCustom?: boolean;
}

export interface UserStats {
  completedLines: number;
  totalAttempts: number;
  revealedSolutions: number;
  streak: number;
  startTime: number;
  endTime?: number;
}

export interface AppSettings {
  autoAdvanceOnSuccess: boolean;
  strictIndentation: boolean;
  soundEffects: boolean;
  showLineNumbers: boolean;
  theme: 'dark' | 'light';
  peekNextLines: boolean;
}
