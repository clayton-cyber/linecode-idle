import { TokenItem, TokenType, PuzzleDifficulty, PuzzleLineData } from '../types/lesson';

/**
 * Keyword lists per programming language
 */
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  python: [
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'is', 'not', 'and', 'or',
    'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'lambda', 'pass',
    'break', 'continue', 'global', 'nonlocal', 'async', 'await', 'assert', 'None', 'True', 'False', 'self'
  ],
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'import', 'export',
    'default', 'from', 'async', 'await', 'yield', 'new', 'this', 'typeof', 'instanceof', 'null', 'undefined',
    'true', 'false', 'of', 'in'
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case',
    'try', 'catch', 'finally', 'throw', 'class', 'extends', 'implements', 'interface', 'type', 'enum',
    'import', 'export', 'default', 'from', 'async', 'await', 'new', 'this', 'typeof', 'instanceof',
    'null', 'undefined', 'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown', 'readonly'
  ],
  sql: [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'HAVING',
    'ORDER', 'ASC', 'DESC', 'LIMIT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
    'TABLE', 'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'AND', 'OR', 'NOT',
    'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT', 'UNION'
  ],
  go: [
    'func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if', 'else',
    'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'chan', 'select',
    'map', 'make', 'new', 'len', 'cap', 'append', 'nil', 'true', 'false', 'err', 'string', 'int', 'bool'
  ],
  rust: [
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'for', 'while', 'loop', 'if', 'else',
    'match', 'return', 'use', 'mod', 'crate', 'self', 'Self', 'as', 'where', 'async', 'await', 'unsafe',
    'Some', 'None', 'Ok', 'Err', 'true', 'false', 'String', 'i32', 'u32', 'bool', 'Option', 'Result'
  ],
  cpp: [
    'int', 'float', 'double', 'char', 'bool', 'void', 'auto', 'const', 'class', 'struct', 'public',
    'private', 'protected', 'virtual', 'override', 'template', 'typename', 'namespace', 'using',
    'std', 'vector', 'string', 'cout', 'cin', 'endl', 'return', 'if', 'else', 'for', 'while', 'nullptr'
  ],
};

/**
 * Tokenize a single line of code into structured tokens
 */
export function tokenizeCodeLine(line: string, language: string = 'python'): { leadingIndent: string; tokens: TokenItem[] } {
  const indentMatch = line.match(/^(\s*)/);
  const leadingIndent = indentMatch ? indentMatch[1] : '';
  const codeContent = line.slice(leadingIndent.length);

  if (!codeContent.trim()) {
    return { leadingIndent, tokens: [] };
  }

  const lang = language.toLowerCase();
  const keywords = new Set(LANGUAGE_KEYWORDS[lang] || LANGUAGE_KEYWORDS['python']);
  const tokens: TokenItem[] = [];

  // Language-specific comment syntax:
  // Python: #
  // SQL: --
  // JS/TS/Go/Rust/C++: //
  let commentPattern = '#.*$';
  if (['javascript', 'typescript', 'go', 'rust', 'cpp', 'c', 'html', 'css'].includes(lang)) {
    commentPattern = '\\/\\/.*$';
  } else if (['sql'].includes(lang)) {
    commentPattern = '--.*$';
  }

  // Regex pattern matching different syntactic elements
  // 1. Strings (single, double, backtick quotes)
  // 2. Language-specific comments
  // 3. Numbers (floats, ints, hex)
  // 4. Multi-char operators (===, !==, ==, !=, <=, >=, =>, ->, +=, -=, *=, /=, //, **, %=, &&, ||, ??, ++, --, :=)
  // 5. Identifiers / words
  // 6. Single punctuation / operators
  // 7. Whitespace
  const tokenRegex = new RegExp(
    `(["'\`].*?["'\`])|(${commentPattern})|(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|(===|!==|==|!=|<=|>=|=>|->|\\+=|-=|\\*=|\\/=|\\/\\/|\\*\\*|%=|&&|\\|\\||\\?\\?|\\+\\+|--|:=)|([a-zA-Z_$][a-zA-Z0-9_$]*)|([^\\s\\w"'\`]+)|(\\s+)`,
    'g'
  );

  let match: RegExpExecArray | null;
  let tokenCount = 0;

  while ((match = tokenRegex.exec(codeContent)) !== null) {
    const text = match[0];
    if (!text) continue;

    tokenCount++;
    const id = `token-${tokenCount}-${Math.random().toString(36).slice(2, 6)}`;

    // Whitespace token between words
    if (match[7]) {
      tokens.push({
        id,
        text,
        type: 'whitespace',
        isBlank: false,
      });
      continue;
    }

    let type: TokenType = 'punctuation';

    if (match[1]) {
      type = 'string';
    } else if (match[2]) {
      type = 'comment';
    } else if (match[3]) {
      type = 'number';
    } else if (match[4]) {
      type = 'operator';
    } else if (match[5]) {
      if (keywords.has(text) || keywords.has(text.toUpperCase())) {
        type = 'keyword';
      } else {
        type = 'identifier';
      }
    } else if (match[6]) {
      // Single character operator or punctuation
      if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'].includes(text)) {
        type = 'operator';
      } else {
        type = 'punctuation';
      }
    }

    tokens.push({
      id,
      text,
      type,
      isBlank: false,
    });
  }

  return { leadingIndent, tokens };
}

/**
 * Prepares a line for the Token Drop game by selecting which tokens become blanks
 */
export function buildPuzzleLine(
  line: string,
  language: string = 'python',
  difficulty: PuzzleDifficulty = 'medium'
): PuzzleLineData {
  const { leadingIndent, tokens } = tokenizeCodeLine(line, language);

  // Eligible non-whitespace tokens that can become blanks
  const candidateIndices: number[] = [];
  tokens.forEach((t, idx) => {
    if (t.type !== 'whitespace') {
      if (difficulty === 'hard' || t.type !== 'comment') {
        candidateIndices.push(idx);
      }
    }
  });

  if (candidateIndices.length === 0) {
    return {
      leadingIndent,
      tokens,
      blankSlotsCount: 0,
      bankTokens: [],
    };
  }

  // Selection of blank tokens based on difficulty rules:
  // - Hard: 100% ALL non-whitespace tokens are missing (NO LIMIT - reconstruct entire line)
  // - Easy: Inbuilt keywords and operators are PRESENT; only user identifiers/values are blanked
  // - Medium: Balanced mix (2-4 blanks including some keywords and identifiers)
  let selectedBlankIndices = new Set<number>();

  if (difficulty === 'hard') {
    // 100% of all candidate tokens are missing (no limit!)
    selectedBlankIndices = new Set(candidateIndices);
  } else if (difficulty === 'easy') {
    // Keep language inbuilt tokens (keywords, operators, punctuation) present as anchors
    // Only blank user identifiers, custom variables, function names, strings, or numbers
    const userDefinedIndices = candidateIndices.filter(idx => {
      const t = tokens[idx];
      return t.type === 'identifier' || t.type === 'string' || t.type === 'number';
    });

    if (userDefinedIndices.length > 0) {
      // Pick 1 to 2 user tokens to blank
      selectedBlankIndices = new Set(userDefinedIndices.slice(0, Math.min(2, userDefinedIndices.length)));
    } else {
      // Fallback if line is purely built-in tokens: blank only 1 token
      selectedBlankIndices = new Set([candidateIndices[0]]);
    }
  } else {
    // Medium: Balanced challenge (2 to 4 blanks)
    const targetBlankCount = Math.min(4, Math.max(2, Math.round(candidateIndices.length * 0.5)));
    
    // Priority score: mix of keywords and identifiers
    const scored = candidateIndices.map(idx => {
      const t = tokens[idx];
      let weight = 1;
      if (t.type === 'keyword') weight = 2.5;
      if (t.type === 'identifier') weight = 2.2;
      if (t.type === 'operator') weight = 1.8;
      return { idx, score: weight + Math.random() * 1.2 };
    });

    scored.sort((a, b) => b.score - a.score);
    selectedBlankIndices = new Set(scored.slice(0, targetBlankCount).map(c => c.idx));
  }

  // Build final tokens with blanks marked & assigned slot indices
  let currentSlot = 0;
  const blankTokensForBank: TokenItem[] = [];

  const finalTokens = tokens.map((token, idx) => {
    if (selectedBlankIndices.has(idx)) {
      const slotIndex = currentSlot++;
      const blankToken: TokenItem = {
        ...token,
        isBlank: true,
        slotIndex,
      };
      // Clone for bank
      blankTokensForBank.push({
        id: `bank-${token.id}`,
        text: token.text,
        type: token.type,
        isBlank: true,
        slotIndex,
      });
      return blankToken;
    }
    return {
      ...token,
      isBlank: false,
    };
  });

  const bankTokens: TokenItem[] = [...blankTokensForBank];

  // Shuffle the token bank
  shuffleArray(bankTokens);

  return {
    leadingIndent,
    tokens: finalTokens,
    blankSlotsCount: currentSlot,
    bankTokens,
  };
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Returns distinct badge/syntax styling classes based on token type
 */
export function getTokenStyle(type: TokenType, isDark: boolean = true) {
  switch (type) {
    case 'keyword':
      return {
        bg: isDark ? 'bg-purple-950/70' : 'bg-purple-50',
        text: isDark ? 'text-purple-300' : 'text-purple-700',
        border: isDark ? 'border-purple-600/60' : 'border-purple-300',
        glow: 'shadow-purple-500/20',
      };
    case 'operator':
      return {
        bg: isDark ? 'bg-rose-950/60' : 'bg-rose-50',
        text: isDark ? 'text-rose-300' : 'text-rose-700',
        border: isDark ? 'border-rose-500/60' : 'border-rose-300',
        glow: 'shadow-rose-500/20',
      };
    case 'identifier':
      return {
        bg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
        text: isDark ? 'text-sky-300' : 'text-sky-700',
        border: isDark ? 'border-sky-500/60' : 'border-sky-300',
        glow: 'shadow-sky-500/20',
      };
    case 'string':
      return {
        bg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
        text: isDark ? 'text-emerald-300' : 'text-emerald-700',
        border: isDark ? 'border-emerald-500/60' : 'border-emerald-300',
        glow: 'shadow-emerald-500/20',
      };
    case 'number':
      return {
        bg: isDark ? 'bg-amber-950/60' : 'bg-amber-50',
        text: isDark ? 'text-amber-300' : 'text-amber-700',
        border: isDark ? 'border-amber-500/60' : 'border-amber-300',
        glow: 'shadow-amber-500/20',
      };
    default:
      return {
        bg: isDark ? 'bg-[#2a2d2e]' : 'bg-[#f0f3f6]',
        text: isDark ? 'text-[#d4d4d4]' : 'text-[#24292f]',
        border: isDark ? 'border-[#3c3c3c]' : 'border-[#d0d7de]',
        glow: 'shadow-slate-500/10',
      };
  }
}

