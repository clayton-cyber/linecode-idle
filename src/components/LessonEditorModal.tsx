import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileCode, 
  AlertTriangle, 
  Play, 
  Check,
  Copy,
  Bot,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { Lesson, CodeLineItem, AppSettings } from '../types/lesson';
import { parseCodeInput } from '../utils/parser';
import { detectLanguageFromFilename } from '../utils/fileIcons';

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndPractice: (lesson: Lesson) => void;
  settings: AppSettings;
}

const TEMPLATE_EXAMPLES: { name: string; lang: Lesson['language']; code: string }[] = [
  {
    name: 'Python (# Comments)',
    lang: 'python',
    code: `def calculate_average(grades):
    # Define a function to calculate the average of a grades list
    if not grades:
        # Check if the list is empty to prevent division by zero
        return 0
        # Return 0 if there are no grades in the list
    total = sum(grades)
        # Sum up all numerical values in the grades list
    return total / len(grades)
        # Compute and return the arithmetic average
`
  },
  {
    name: 'JavaScript (// Comments)',
    lang: 'javascript',
    code: `// Define a function that checks if a word is a palindrome
function isPalindrome(str) {
  // Normalize string: convert to lowercase and remove spaces
  const clean = str.toLowerCase().replace(/\\s+/g, '');
  // Reverse the cleaned characters and compare with original
  return clean === clean.split('').reverse().join('');
}
`
  },
  {
    name: 'Tagged ([CODE] & [EXPLAIN])',
    lang: 'typescript',
    code: `[CODE] interface User { id: string; email: string; }
[EXPLAIN] Define a TypeScript interface User with id and email properties.

[CODE] function createSession(user: User): string {
[EXPLAIN] Function to initiate a user session and return a session token.

[CODE]   return \`session_\${user.id}_\${Date.now()}\`;
[EXPLAIN] Generate a unique session token string using timestamp.

[CODE] }
[EXPLAIN] Close the createSession function.
`
  }
];

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveAndPractice,
  settings,
}) => {
  const [title, setTitle] = useState('My Custom Code Drill');
  const [language, setLanguage] = useState<Lesson['language']>('python');
  const [rawText, setRawText] = useState(TEMPLATE_EXAMPLES[0].code);
  const [parsedLines, setParsedLines] = useState<CodeLineItem[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [isDragging, setIsDragging] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (rawText) {
      const res = parseCodeInput(rawText, title);
      setParsedLines(res.lines);
      setDetectedFormat(res.detectedFormat);
      setWarnings(res.warnings);
    } else {
      setParsedLines([]);
    }
  }, [rawText, title]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof TEMPLATE_EXAMPLES[0]) => {
    setTitle(`Custom: ${tmpl.name}`);
    setLanguage(tmpl.lang);
    setRawText(tmpl.code);
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const detected = detectLanguageFromFilename(file.name);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
        setLanguage(detected);
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const getLLMPromptText = (includeCode: boolean = false): string => {
    const codeSnippet = includeCode && rawText.trim() ? rawText.trim() : '[PASTE YOUR CODE HERE]';
    return `Please take the following code and format it for interactive study and practice in LineCode Tutor.

INSTRUCTIONS:
1. Output every single line of code exactly as written, preserving original indentation.
2. Do NOT add any explanations, analysis, or comments to the code.
3. Strip any existing comments if present.
4. Output ONLY the raw code block without extra markdown intro/outro conversational text so I can copy-paste it directly into LineCode Tutor.

EXAMPLE OUTPUT FORMAT:
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid

--- CODE TO ANNOTATE ---
${codeSnippet}`;
  };

  const handleCopyPrompt = (includeCode: boolean = false) => {
    const prompt = getLLMPromptText(includeCode);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleSave = () => {
    if (parsedLines.length === 0) return;

    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Custom Code Practice',
      language,
      difficulty: 'Intermediate',
      description: `Custom practice file with ${parsedLines.length} lines.`,
      lines: parsedLines,
      rawSource: rawText,
      createdAt: Date.now(),
      isCustom: true,
    };

    onSaveAndPractice(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp transition-colors"
        style={{
          backgroundColor: isDark ? '#252526' : '#ffffff',
          borderColor: isDark ? '#3c3c3c' : '#d0d7de',
          color: isDark ? '#cccccc' : '#24292f',
        }}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".py,.js,.ts,.tsx,.jsx,.sql,.txt,.rs,.go,.cpp,.c,.html,.css,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Modal Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: isDark ? '#1e1e1e' : '#f6f8fa',
            borderColor: isDark ? '#3c3c3c' : '#d0d7de',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Upload or Paste Code File
              </h2>
              <p className="text-xs opacity-75">
                Upload a file, paste code with comments, or generate comments using an LLM prompt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 opacity-60 hover:opacity-100 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Drag & Drop File Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : isDark 
                ? 'border-[#3c3c3c] hover:border-blue-500/80 bg-[#1e1e1e]/60' 
                : 'border-[#d0d7de] hover:border-blue-600/80 bg-[#f6f8fa]'
            }`}
          >
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to browse or drop your code file here (.py, .js, .ts, .sql, .rs, .go, .cpp, .txt)
            </div>
          </div>

          {/* AI / LLM Prompt Generator Section */}
          <div 
            className="border rounded-xl p-3.5 space-y-2.5 transition-colors"
            style={{
              backgroundColor: isDark ? '#1e1e1e' : '#f0f4f9',
              borderColor: isDark ? '#3c3c3c' : '#cce0ff',
            }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPromptGenerator(!showPromptGenerator)}
                className="flex items-center gap-2 text-left font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>🤖 Need AI to annotate your code? Click for ready-to-use LLM Prompt</span>
                {showPromptGenerator ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(false)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold shadow-xs transition"
                  title="Copy prompt template to paste in ChatGPT / Claude / Gemini"
                >
                  {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copied!' : 'Copy LLM Prompt'}</span>
                </button>
              </div>
            </div>

            {showPromptGenerator && (
              <div className="space-y-2 pt-1 animate-slideUp font-sans text-xs">
                <p className="opacity-80 leading-relaxed text-[11px]">
                  Copy this prompt, paste it into <strong>ChatGPT, Claude, Gemini, or DeepSeek</strong> along with your raw code, and paste the generated output back into the text box below.
                </p>
                <div 
                  className="p-3 rounded-lg border font-mono text-[11px] max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all"
                  style={{
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                    borderColor: isDark ? '#3c3c3c' : '#d0d7de',
                    color: isDark ? '#cccccc' : '#24292f',
                  }}
                >
                  {getLLMPromptText(false)}
                </div>
                {rawText.trim() && (
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy prompt with my currently typed code attached</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title & Language Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Lesson / File Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Factorial Recursion"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-[#1e1e1e] border-[#3c3c3c] text-white' : 'bg-white border-[#d0d7de] text-[#111111]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Lesson['language'])}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-[#1e1e1e] border-[#3c3c3c] text-white' : 'bg-white border-[#d0d7de] text-[#111111]'
                }`}
              >
                <option value="python">Python (.py)</option>
                <option value="javascript">JavaScript (.js)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="sql">SQL (.sql)</option>
                <option value="go">Go (.go)</option>
                <option value="rust">Rust (.rs)</option>
                <option value="cpp">C / C++ (.cpp)</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div className="space-y-1.5">
            <span className="text-xs opacity-75 font-medium">Or choose a quick template:</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_EXAMPLES.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`px-2.5 py-1 rounded text-xs border transition ${
                    isDark 
                      ? 'bg-[#1e1e1e] hover:bg-[#333333] border-[#3c3c3c] text-[#cccccc] hover:text-white' 
                      : 'bg-[#f6f8fa] hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f] hover:text-black'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Tabs */}
          <div 
            className="border-b flex items-center justify-between"
            style={{ borderColor: isDark ? '#3c3c3c' : '#d0d7de' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'input'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                Raw Code & Comments
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span>Live Parsed Preview</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                  {parsedLines.length} lines
                </span>
              </button>
            </div>

            {detectedFormat && (
              <span className="text-[11px] font-mono opacity-70 hidden sm:inline">
                Format: <strong className="text-blue-600 dark:text-blue-400">{detectedFormat}</strong>
              </span>
            )}
          </div>

          {activeTab === 'input' ? (
            <div className="space-y-2">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste code with comments here..."
                rows={10}
                className={`w-full p-3.5 border rounded-xl font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed ${
                  isDark ? 'bg-[#1e1e1e] border-[#3c3c3c] text-white' : 'bg-white border-[#d0d7de] text-[#111111]'
                }`}
              />
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parsedLines.length === 0 ? (
                <div className="p-8 text-center opacity-50 text-xs">
                  No valid lines detected. Please paste your code in the first tab.
                </div>
              ) : (
                parsedLines.map((line) => (
                  <div 
                    key={line.id}
                    className={`p-3 border rounded-xl space-y-1 text-xs ${
                      isDark ? 'bg-[#1e1e1e] border-[#3c3c3c]' : 'bg-[#f6f8fa] border-[#d0d7de]'
                    }`}
                  >
                    <div className="flex items-center justify-between opacity-80 font-mono">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">Line {line.lineNumber}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border opacity-75">
                        {line.category}
                      </span>
                    </div>
                    <div className={`font-mono px-2.5 py-1 rounded overflow-x-auto whitespace-pre border ${
                      isDark ? 'bg-[#181818] border-[#2d2d2d] text-white' : 'bg-white border-[#e1e4e8] text-black'
                    }`}>
                      {line.code}
                    </div>
                    <div className="opacity-90 italic pl-1 border-l-2 border-blue-500">
                      Analysis: {line.explanation}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{warnings.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: isDark ? '#1e1e1e' : '#f6f8fa',
            borderColor: isDark ? '#3c3c3c' : '#d0d7de',
          }}
        >
          <div className="text-xs opacity-75 font-mono">
            {parsedLines.length} line{parsedLines.length === 1 ? '' : 's'} parsed
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-medium border transition ${
                isDark 
                  ? 'bg-[#2d2d2d] hover:bg-[#333333] border-[#3c3c3c] text-white' 
                  : 'bg-white hover:bg-[#eaeef2] border-[#d0d7de] text-[#24292f]'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={parsedLines.length === 0}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Practice</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
