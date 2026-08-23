import { CodeLineItem } from '../types/lesson';

/**
 * Intelligent Multi-Format Code & Comment Parser
 */

export interface ParseResult {
  lines: CodeLineItem[];
  detectedFormat: 'interleaved-comments' | 'preceding-comments' | 'inline-comments' | 'tagged-blocks' | 'json' | 'plain-code';
  warnings: string[];
}

// Helper to clean comment markers
function stripCommentMarker(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith('//')) {
    return trimmed.replace(/^\/\/\s*/, '');
  }
  if (trimmed.startsWith('#')) {
    return trimmed.replace(/^#\s*/, '');
  }
  if (trimmed.startsWith('--')) {
    return trimmed.replace(/^--\s*/, '');
  }
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
    return trimmed.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
  }
  if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
    return trimmed.replace(/^<!--\s*/, '').replace(/\s*-->$/, '');
  }
  return trimmed;
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('--') ||
    (trimmed.startsWith('/*') && trimmed.endsWith('*/')) ||
    (trimmed.startsWith('<!--') && trimmed.endsWith('-->'))
  );
}

function categorizeCode(code: string): CodeLineItem['category'] {
  const trimmed = code.trim();
  if (/^(import|from|require|include|using|package)\b/.test(trimmed)) return 'import';
  if (/^(def|function|fn|class|interface|type|struct|enum|async\s+function|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\()\b/.test(trimmed)) return 'definition';
  if (/^(return|yield|throw|export)\b/.test(trimmed)) return 'return';
  if (/^(if|else|elif|for|while|switch|case|try|catch|finally|match|with)\b/.test(trimmed)) return 'control';
  return 'logic';
}

export function parseCodeInput(rawText: string, defaultTitle: string = 'Custom Practice'): ParseResult {
  const warnings: string[] = [];
  const text = rawText.trim();

  if (!text) {
    return { lines: [], detectedFormat: 'plain-code', warnings: ['No content provided'] };
  }

  // 1. Try JSON Array parsing
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const items: CodeLineItem[] = [];
        parsed.forEach((item, index) => {
          const code = item.code ?? item.line ?? item.text ?? '';
          const explanation = item.explanation ?? item.comment ?? item.analysis ?? item.desc ?? 'Examine and type this code line.';
          items.push({
            id: `line-${index + 1}`,
            lineNumber: index + 1,
            code: String(code),
            explanation: String(explanation),
            hint: item.hint ? String(item.hint) : undefined,
            category: categorizeCode(String(code)),
          });
        });
        return { lines: items, detectedFormat: 'json', warnings };
      }
    } catch {
      // Not JSON, continue to other parsers
    }
  }

  // 2. Check for Tagged Format ([CODE] ... [EXPLAIN] ... or CODE: ... EXPLANATION: ...)
  if (/\[CODE\]|\[EXPLAIN\]|\[ANALYSIS\]|CODE:\s*|EXPLANATION:\s*/i.test(text)) {
    const rawLines = text.split(/\r?\n/);
    const items: CodeLineItem[] = [];
    let currentCode: string | null = null;
    let currentExplanation: string[] = [];

    const flushItem = () => {
      if (currentCode !== null) {
        items.push({
          id: `line-${items.length + 1}`,
          lineNumber: items.length + 1,
          code: currentCode,
          explanation: currentExplanation.join(' ').trim() || `Step ${items.length + 1}: Implement this line.`,
          category: categorizeCode(currentCode),
        });
        currentCode = null;
        currentExplanation = [];
      }
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/^\[CODE\]\s*/i.test(line) || /^CODE:\s*/i.test(line)) {
        flushItem();
        currentCode = rawLine.replace(/^(\s*\[CODE\]\s*|\s*CODE:\s*)/i, '');
      } else if (/^\[EXPLAIN\]\s*/i.test(line) || /^\[ANALYSIS\]\s*/i.test(line) || /^EXPLANATION:\s*/i.test(line)) {
        const explText = line.replace(/^(\s*\[EXPLAIN\]\s*|\s*\[ANALYSIS\]\s*|\s*EXPLANATION:\s*)/i, '');
        currentExplanation.push(explText);
      } else {
        if (currentCode !== null) {
          currentExplanation.push(line);
        }
      }
    }
    flushItem();

    if (items.length > 0) {
      return { lines: items, detectedFormat: 'tagged-blocks', warnings };
    }
  }

  // 3. Line-by-line comment parsing (Natural comment interleaved)
  const rawLines = text.split(/\r?\n/);
  
  // First check if inline comments are present on almost every line (e.g. `x = 5 # Assign 5 to x`)
  let inlineCommentCount = 0;
  let nonCommentLineCount = 0;
  for (const line of rawLines) {
    if (!line.trim()) continue;
    if (isCommentLine(line)) continue;
    nonCommentLineCount++;
    if (/(#|\/\/|--)\s+\S+/.test(line)) {
      inlineCommentCount++;
    }
  }

  if (nonCommentLineCount > 0 && inlineCommentCount / nonCommentLineCount > 0.6) {
    // Parse inline comments
    const items: CodeLineItem[] = [];
    for (const rawLine of rawLines) {
      if (!rawLine.trim()) continue;
      if (isCommentLine(rawLine)) continue;

      const match = rawLine.match(/^(.*?)(#|\/\/|--)\s*(.*)$/);
      if (match) {
        const codePart = match[1].replace(/\s+$/, '');
        const explanationPart = match[3].trim();
        items.push({
          id: `line-${items.length + 1}`,
          lineNumber: items.length + 1,
          code: codePart,
          explanation: explanationPart || 'Execute this code line.',
          category: categorizeCode(codePart),
        });
      } else {
        items.push({
          id: `line-${items.length + 1}`,
          lineNumber: items.length + 1,
          code: rawLine,
          explanation: `Line ${items.length + 1} of implementation.`,
          category: categorizeCode(rawLine),
        });
      }
    }
    if (items.length > 0) {
      return { lines: items, detectedFormat: 'inline-comments', warnings };
    }
  }

  // Check for preceding comments vs following comments
  // Heuristic: Check whether the first non-empty line is a comment or code
  let firstLineIsComment = false;
  for (const line of rawLines) {
    if (line.trim()) {
      firstLineIsComment = isCommentLine(line);
      break;
    }
  }

  if (firstLineIsComment) {
    // PRECEDING COMMENTS: Comment(s) come BEFORE the code line
    const items: CodeLineItem[] = [];
    let pendingComments: string[] = [];

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      if (isCommentLine(rawLine)) {
        pendingComments.push(stripCommentMarker(rawLine));
      } else {
        // This is code line
        const explanation = pendingComments.length > 0 
          ? pendingComments.join('\n') 
          : `Step ${items.length + 1}: Add this code logic.`;
        
        items.push({
          id: `line-${items.length + 1}`,
          lineNumber: items.length + 1,
          code: rawLine,
          explanation: explanation,
          category: categorizeCode(rawLine),
        });
        pendingComments = [];
      }
    }

    if (items.length > 0) {
      return { lines: items, detectedFormat: 'preceding-comments', warnings };
    }
  } else {
    // INTERLEAVED COMMENTS: Code line followed by comment(s)
    const items: CodeLineItem[] = [];
    let currentCode: string | null = null;
    let comments: string[] = [];

    const commitItem = () => {
      if (currentCode !== null) {
        items.push({
          id: `line-${items.length + 1}`,
          lineNumber: items.length + 1,
          code: currentCode,
          explanation: comments.length > 0 ? comments.join('\n') : `Step ${items.length + 1}: Line execution and purpose.`,
          category: categorizeCode(currentCode),
        });
        currentCode = null;
        comments = [];
      }
    };

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      if (isCommentLine(rawLine)) {
        if (currentCode !== null) {
          comments.push(stripCommentMarker(rawLine));
        } else {
          // Orphan comment before code, save as comment for next line
          comments.push(stripCommentMarker(rawLine));
        }
      } else {
        // It's a code line
        if (currentCode !== null) {
          commitItem();
        }
        currentCode = rawLine;
      }
    }
    commitItem();

    if (items.length > 0 && items.some(item => item.explanation && !item.explanation.startsWith('Step '))) {
      return { lines: items, detectedFormat: 'interleaved-comments', warnings };
    }
  }

  // 4. Fallback: Plain code lines
  const plainItems: CodeLineItem[] = [];
  for (const rawLine of rawLines) {
    if (!rawLine.trim()) continue;
    plainItems.push({
      id: `line-${plainItems.length + 1}`,
      lineNumber: plainItems.length + 1,
      code: rawLine,
      explanation: generateAutoExplanation(rawLine, plainItems.length + 1),
      category: categorizeCode(rawLine),
    });
  }

  if (plainItems.length === 0) {
    warnings.push('Could not detect any valid lines of code.');
  }

  return { lines: plainItems, detectedFormat: 'plain-code', warnings };
}

function generateAutoExplanation(code: string, lineNumber: number): string {
  const trimmed = code.trim();
  if (/^(def|function|fn)\s+([a-zA-Z0-9_]+)/.test(trimmed)) {
    const match = trimmed.match(/^(?:def|function|fn)\s+([a-zA-Z0-9_]+)/);
    return `Define the function \`${match ? match[1] : 'handler'}\`.`;
  }
  if (/^return\b/.test(trimmed)) {
    return `Return the calculated result to the caller.`;
  }
  if (/^if\b/.test(trimmed)) {
    return `Evaluate condition and branch execution flow.`;
  }
  if (/^(for|while)\b/.test(trimmed)) {
    return `Iterate over elements/sequence.`;
  }
  if (/^(import|from|require)\b/.test(trimmed)) {
    return `Import required module dependencies.`;
  }
  return `Step ${lineNumber}: Implement this code line.`;
}

/**
 * Validates if the user's input matches the target code line.
 */
export function validateCodeLine(
  userInput: string,
  targetCode: string,
  strictIndentation: boolean = false
): {
  isMatch: boolean;
  charMatchCount: number;
  expectedLength: number;
  firstDiffIndex: number;
  expectedCode: string;
  userCode: string;
} {
  const user = strictIndentation ? userInput : userInput.trim();
  const target = strictIndentation ? targetCode : targetCode.trim();

  let charMatchCount = 0;
  let firstDiffIndex = -1;
  const minLen = Math.min(user.length, target.length);

  for (let i = 0; i < minLen; i++) {
    if (user[i] === target[i]) {
      charMatchCount++;
    } else {
      firstDiffIndex = i;
      break;
    }
  }

  if (firstDiffIndex === -1 && user.length !== target.length) {
    firstDiffIndex = minLen;
  }

  // Allow match if trimmed versions match or exact matches
  const isMatch = user === target || (!strictIndentation && userInput.trim() === targetCode.trim());

  return {
    isMatch,
    charMatchCount,
    expectedLength: target.length,
    firstDiffIndex: isMatch ? -1 : firstDiffIndex,
    expectedCode: target,
    userCode: user,
  };
}

/**
 * Extracts leading indentation from a code line
 */
export function getLeadingIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}
