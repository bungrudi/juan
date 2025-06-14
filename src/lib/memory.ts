export type LongTermMemory = string[];

const STORAGE_KEY = "long_term_memory";

export function loadMemory(): LongTermMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LongTermMemory;
  } catch (e) {
    console.warn("Failed to parse long term memory", e);
    return [];
  }
}

export function saveMemory(mem: LongTermMemory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
  } catch (e) {
    console.warn("Failed to save long term memory", e);
  }
}
