import { Lesson, AppSettings, UserStats } from '../types/lesson';

const SETTINGS_KEY = 'linecode_tutor_settings';
const CUSTOM_LESSONS_KEY = 'linecode_tutor_custom_lessons';
const PROGRESS_KEY = 'linecode_tutor_progress';

export const defaultSettings: AppSettings = {
  autoAdvanceOnSuccess: true,
  strictIndentation: false,
  soundEffects: true,
  showLineNumbers: true,
  theme: 'dark',
  peekNextLines: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...defaultSettings, ...parsed, strictIndentation: parsed.strictIndentation ?? false };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadCustomLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LESSONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLesson(lesson: Lesson): void {
  try {
    const current = loadCustomLessons();
    const existingIdx = current.findIndex(l => l.id === lesson.id);
    let updated: Lesson[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = lesson;
    } else {
      updated = [lesson, ...current];
    }
    localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom lesson', e);
  }
}

export function deleteCustomLesson(lessonId: string): Lesson[] {
  try {
    const current = loadCustomLessons();
    const filtered = current.filter(l => l.id !== lessonId);
    localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  accuracy: number;
  lastLineIndex: number;
  lastPracticed: number;
}

export function loadLessonProgress(lessonId: string): LessonProgress | null {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${lessonId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLessonProgress(progress: LessonProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_KEY}_${progress.lessonId}`, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}
