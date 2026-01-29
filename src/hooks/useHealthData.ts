import { useState, useEffect, useCallback } from 'react';
import type { HealthData, TimelineEntry } from '../types';
import { loadData, saveData, addEntry, updateEntry, deleteEntry, clearData as clearStorage, importData as parseImport } from '../storage';

export function useHealthData() {
  const [data, setData] = useState<HealthData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const add = useCallback((entry: TimelineEntry) => {
    setData((prev) => addEntry(prev, entry));
  }, []);

  const update = useCallback((entry: TimelineEntry) => {
    setData((prev) => updateEntry(prev, entry));
  }, []);

  const remove = useCallback((id: string) => {
    setData((prev) => deleteEntry(prev, id));
  }, []);

  const clear = useCallback(() => {
    clearStorage();
    setData({ entries: [], version: 1 });
  }, []);

  const importFromJson = useCallback((json: string): boolean => {
    const imported = parseImport(json);
    if (imported) {
      setData(imported);
      saveData(imported);
      return true;
    }
    return false;
  }, []);

  return {
    data,
    entries: data.entries,
    add,
    update,
    remove,
    clear,
    importFromJson,
  };
}
