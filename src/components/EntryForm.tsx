import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { TimelineEntry, SectionType } from '../types';
import { SECTION_CONFIG, SECTION_ORDER } from '../types';

interface EntryFormProps {
  opened: boolean;
  onClose: () => void;
  onSave: (entry: TimelineEntry) => void;
  onDelete?: (id: string) => void;
  entry?: TimelineEntry | null;
  defaultDate?: string;
  defaultEndDate?: string;
  defaultSection?: SectionType;
}

interface FormValues {
  sectionType: SectionType;
  startDate: Date | null;
  endDate: Date | null;
  title: string;
  description: string;
}

export function EntryForm({
  opened,
  onClose,
  onSave,
  onDelete,
  entry,
  defaultDate,
  defaultEndDate,
  defaultSection,
}: EntryFormProps) {
  const form = useForm<FormValues>({
    initialValues: {
      sectionType: defaultSection || 'symptom',
      startDate: defaultDate ? new Date(defaultDate) : new Date(),
      endDate: null,
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (entry) {
      form.setValues({
        sectionType: entry.sectionType,
        startDate: new Date(entry.startDate),
        endDate: entry.endDate ? new Date(entry.endDate) : null,
        title: entry.title,
        description: entry.description || '',
      });
    } else {
      form.reset();
      if (defaultDate) {
        form.setFieldValue('startDate', new Date(defaultDate));
      }
      if (defaultEndDate) {
        form.setFieldValue('endDate', new Date(defaultEndDate));
      }
      if (defaultSection) {
        form.setFieldValue('sectionType', defaultSection);
      }
    }
  }, [entry, defaultDate, defaultEndDate, defaultSection, opened]);

  const handleSubmit = (values: FormValues) => {
    const newEntry: TimelineEntry = {
      id: entry?.id || uuidv4(),
      sectionType: values.sectionType,
      startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
      endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
      title: values.title,
      description: values.description || undefined,
    };

    onSave(newEntry);
    onClose();
    form.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={entry ? 'Edit Entry' : 'New Entry'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Select
            label="Category"
            data={SECTION_ORDER.map((type) => ({
              value: type,
              label: SECTION_CONFIG[type].label,
            }))}
            required
            disabled={!!entry}
            {...form.getInputProps('sectionType')}
          />

          <Group grow>
            <DatePickerInput
              label="Start Date"
              placeholder="Select date"
              required
              {...form.getInputProps('startDate')}
            />
            <DatePickerInput
              label="End Date (optional)"
              placeholder="Select date"
              clearable
              {...form.getInputProps('endDate')}
            />
          </Group>

          <TextInput
            label="Title"
            placeholder="Enter title"
            required
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Description"
            placeholder="Enter description (optional)"
            minRows={3}
            {...form.getInputProps('description')}
          />

          <Group justify="space-between" mt="md">
            {entry && onDelete ? (
              <Button
                color="red"
                variant="outline"
                onClick={() => {
                  onDelete(entry.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            ) : (
              <div />
            )}
            <Group>
              <Button variant="light" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
