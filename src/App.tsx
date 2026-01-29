import { useState } from 'react';
import { Box } from '@mantine/core';
import dayjs from 'dayjs';
import { Timeline } from './components/Timeline';
import { EntryForm } from './components/EntryForm';
import { Toolbar } from './components/Toolbar';
import { useHealthData } from './hooks/useHealthData';
import type { TimelineEntry, SectionType } from './types';

function App() {
  const { data, entries, add, update, remove, clear, importFromJson } = useHealthData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [defaultEndDate, setDefaultEndDate] = useState<string | undefined>();
  const [defaultSection, setDefaultSection] = useState<SectionType | undefined>();

  const handleAddEntry = () => {
    setEditingEntry(null);
    setDefaultDate(undefined);
    setDefaultEndDate(undefined);
    setDefaultSection(undefined);
    setFormOpen(true);
  };

  const handleEntryClick = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setDefaultDate(undefined);
    setDefaultEndDate(undefined);
    setDefaultSection(undefined);
    setFormOpen(true);
  };

  const handleDateClick = (date: string, sectionType: SectionType) => {
    setEditingEntry(null);
    setDefaultDate(date);
    setDefaultEndDate(dayjs(date).add(2, 'month').subtract(1, 'day').format('YYYY-MM-DD'));
    setDefaultSection(sectionType);
    setFormOpen(true);
  };

  const handleSave = (entry: TimelineEntry) => {
    if (editingEntry) {
      update(entry);
    } else {
      add(entry);
    }
  };

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        data={data}
        onAddEntry={handleAddEntry}
        onImport={importFromJson}
        onClear={clear}
      />
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <Timeline
          entries={entries}
          onEntryClick={handleEntryClick}
          onEntryUpdate={update}
          onDateClick={handleDateClick}
        />
      </Box>
      <EntryForm
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={remove}
        entry={editingEntry}
        defaultDate={defaultDate}
        defaultEndDate={defaultEndDate}
        defaultSection={defaultSection}
      />
    </Box>
  );
}

export default App;
