import { useState, useRef } from 'react';
import {
  Group,
  Button,
  ActionIcon,
  Modal,
  Textarea,
  Text,
  Stack,
  CopyButton,
  Switch,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconPlus,
  IconDownload,
  IconUpload,
  IconTrash,
  IconSun,
  IconMoon,
  IconHelp,
} from '@tabler/icons-react';
import type { HealthData } from '../types';
import { exportData, exportDataAsText } from '../storage';

interface ToolbarProps {
  data: HealthData;
  onAddEntry: () => void;
  onImport: (json: string) => boolean;
  onClear: () => void;
}

export function Toolbar({ data, onAddEntry, onImport, onClear }: ToolbarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [exportAsText, setExportAsText] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = exportData(data);
  const exportText = exportDataAsText(data);
  const exportContent = exportAsText ? exportText : exportJson;

  const handleImport = () => {
    setImportError('');
    if (onImport(importText)) {
      setImportModalOpen(false);
      setImportText('');
    } else {
      setImportError('Invalid JSON format. Please check your data.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const ext = exportAsText ? 'txt' : 'json';
    const mime = exportAsText ? 'text/plain' : 'application/json';
    const blob = new Blob([exportContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-map-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Group p="sm" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group>
          <Text fw={600} size="lg">Health Map</Text>
          <Button leftSection={<IconPlus size={16} />} onClick={onAddEntry}>
            Add Entry
          </Button>
        </Group>

        <Group>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => setHelpModalOpen(true)}
            title="Help"
          >
            <IconHelp size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => setExportModalOpen(true)}
            title="Export Data"
          >
            <IconDownload size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => setImportModalOpen(true)}
            title="Import Data"
          >
            <IconUpload size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="lg"
            color="red"
            onClick={() => setClearModalOpen(true)}
            title="Clear All Data"
          >
            <IconTrash size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => toggleColorScheme()}
            title="Toggle Theme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </Group>

      {/* Help Modal */}
      <Modal
        opened={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="How to use Health Map"
        size="md"
      >
        <Stack gap="md">
          <div>
            <Text fw={600} size="sm">Adding entries</Text>
            <Text size="sm" c="dimmed">
              Double-click anywhere on the timeline grid to create a new entry at that month.
              You can also click the "Add Entry" button in the top left.
            </Text>
          </div>
          <div>
            <Text fw={600} size="sm">Editing entries</Text>
            <Text size="sm" c="dimmed">
              Click on any entry bar to open it for editing. You can change the title, description, dates, or delete it.
            </Text>
          </div>
          <div>
            <Text fw={600} size="sm">Moving entries</Text>
            <Text size="sm" c="dimmed">
              Drag an entry bar left or right to move it to a different date.
            </Text>
          </div>
          <div>
            <Text fw={600} size="sm">Resizing entries</Text>
            <Text size="sm" c="dimmed">
              Drag the left or right edge of an entry bar to change its start or end date.
            </Text>
          </div>
          <div>
            <Text fw={600} size="sm">Scrolling</Text>
            <Text size="sm" c="dimmed">
              Click and drag on empty space in the timeline to scroll horizontally. Use the zoom buttons to change the scale.
            </Text>
          </div>
          <div>
            <Text fw={600} size="sm">Export / Import</Text>
            <Text size="sm" c="dimmed">
              Export your data as JSON to copy into ChatGPT or Claude for health analysis. Import from JSON to restore a backup.
            </Text>
          </div>
        </Stack>
      </Modal>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Data"
        size="lg"
      >
        <Stack>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {exportAsText
                ? 'Readable text format for pasting into LLMs.'
                : 'JSON format for backup and LLM analysis.'}
            </Text>
            <Switch
              label="Text format"
              checked={exportAsText}
              onChange={(e) => setExportAsText(e.currentTarget.checked)}
            />
          </Group>
          <Textarea
            value={exportContent}
            readOnly
            minRows={20}
            autosize
            styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
          />
          <Group justify="flex-end">
            <CopyButton value={exportContent}>
              {({ copied, copy }) => (
                <Button variant="light" onClick={copy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              )}
            </CopyButton>
            <Button onClick={handleDownload}>
              Download {exportAsText ? '.txt' : '.json'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import Modal */}
      <Modal
        opened={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportText('');
          setImportError('');
        }}
        title="Import Data"
        size="lg"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Paste JSON data or upload a file to restore your health timeline.
            This will replace all existing data.
          </Text>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button variant="light" onClick={() => fileInputRef.current?.click()}>
            Upload JSON File
          </Button>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON here..."
            minRows={10}
            maxRows={20}
            styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
          />
          {importError && (
            <Text c="red" size="sm">
              {importError}
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim()}>
              Import
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        opened={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Data"
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to delete all your health data? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                onClear();
                setClearModalOpen(false);
              }}
            >
              Delete All Data
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
