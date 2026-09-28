// Хичээлийн явцыг хадгалах клиент талын сан.
//
// V1: нэвтрээгүй хэрэглэгчийн явц хөтчийн localStorage-д хадгалагдана.
// V2: Supabase Auth нэмэгдсэн үед ижил интерфейстэй `lesson_progress`
// хүснэгтэд бичдэг store үүсгээд, localStorage-ийн өгөгдлийг нэг удаа шилжүүлнэ.

export type ProgressState = {
  /** lessonId → дуусгасан огноо (ISO) */
  completed: Readonly<Record<string, string>>;
};

export interface ProgressStore {
  getSnapshot(): ProgressState;
  getServerSnapshot(): ProgressState;
  subscribe(listener: () => void): () => void;
  setCompleted(lessonId: string, completed: boolean): boolean;
  reset(): void;
}

const STORAGE_KEY = "magsar-physics:progress:v1";
const EMPTY: ProgressState = Object.freeze({ completed: Object.freeze({}) });

type StoredShape = { version: 1; completed: Record<string, string> };

function isStoredShape(value: unknown): value is StoredShape {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<StoredShape>;
  return v.version === 1 && !!v.completed && typeof v.completed === "object";
}

export function createLocalProgressStore(): ProgressStore {
  let cached: ProgressState | null = null;
  const listeners = new Set<() => void>();

  const notify = () => {
    cached = null;
    listeners.forEach((l) => l());
  };

  function readStorage(): ProgressState {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY;
      const parsed: unknown = JSON.parse(raw);
      return isStoredShape(parsed) ? { completed: parsed.completed } : EMPTY;
    } catch {
      return EMPTY;
    }
  }

  function writeStorage(completed: Record<string, string>): boolean {
    try {
      const value: StoredShape = { version: 1, completed };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) notify();
  }

  return {
    getSnapshot() {
      if (typeof window === "undefined") return EMPTY;
      cached ??= readStorage();
      return cached;
    },
    getServerSnapshot: () => EMPTY,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    setCompleted(lessonId, completed) {
      const next = { ...readStorage().completed };
      if (completed) next[lessonId] = new Date().toISOString();
      else delete next[lessonId];
      const ok = writeStorage(next);
      notify();
      return ok;
    },
    reset() {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // хадгалах сан хаалттай бол хийх зүйлгүй
      }
      notify();
    },
  };
}

export function summarize(state: ProgressState, lessonIds: readonly string[]) {
  const done = lessonIds.filter((id) => id in state.completed).length;
  const total = lessonIds.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Дараалсан жагсаалтаас эхний дуусаагүй хичээлийг олно. */
export function firstIncomplete<T extends { id: string }>(state: ProgressState, ordered: readonly T[]): T | undefined {
  return ordered.find((item) => !(item.id in state.completed));
}
