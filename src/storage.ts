import type { HealthData, TimelineEntry } from './types';
import { SECTION_CONFIG, SECTION_ORDER } from './types';

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

export function exportDataAsText(data: HealthData): string {
  const grouped: Record<string, TimelineEntry[]> = {};
  for (const entry of data.entries) {
    if (!grouped[entry.sectionType]) grouped[entry.sectionType] = [];
    grouped[entry.sectionType].push(entry);
  }

  const lines: string[] = ['HEALTH MAP EXPORT', '='.repeat(40), ''];

  for (const section of SECTION_ORDER) {
    const entries = grouped[section];
    if (!entries || entries.length === 0) continue;

    const label = SECTION_CONFIG[section]?.label ?? section;
    lines.push(label.toUpperCase());
    lines.push('-'.repeat(label.length));

    const sorted = [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate));
    for (const entry of sorted) {
      const dateRange = entry.endDate
        ? `${entry.startDate} to ${entry.endDate}`
        : entry.startDate;
      lines.push(`  ${entry.title}  [${dateRange}]`);
      if (entry.description) {
        lines.push(`    ${entry.description}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
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
