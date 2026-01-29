import type { HealthData, TimelineEntry } from './types';

const STORAGE_KEY = 'health-map-data';
const CURRENT_VERSION = 1;

export function loadData(): HealthData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as HealthData;
      return data;
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  return { entries: [], version: CURRENT_VERSION };
}

export function saveData(data: HealthData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
}

export function exportData(data: HealthData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): HealthData | null {
  try {
    const data = JSON.parse(json) as HealthData;
    if (data && Array.isArray(data.entries)) {
      return { ...data, version: CURRENT_VERSION };
    }
  } catch (e) {
    console.error('Failed to parse import data:', e);
  }
  return null;
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function addEntry(data: HealthData, entry: TimelineEntry): HealthData {
  return { ...data, entries: [...data.entries, entry] };
}

export function updateEntry(data: HealthData, entry: TimelineEntry): HealthData {
  return {
    ...data,
    entries: data.entries.map((e) => (e.id === entry.id ? entry : e)),
  };
}

export function deleteEntry(data: HealthData, id: string): HealthData {
  return { ...data, entries: data.entries.filter((e) => e.id !== id) };
}
