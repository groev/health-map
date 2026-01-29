export type SectionType = 'symptom' | 'medication' | 'supplement' | 'diet' | 'bodyComposition' | 'fitness' | 'misc';

export interface TimelineEntry {
  id: string;
  sectionType: SectionType;
  startDate: string;
  endDate?: string;
  title: string;
  description?: string;
}

export interface HealthData {
  entries: TimelineEntry[];
  version: number;
}

export const SECTION_CONFIG: Record<SectionType, { label: string; color: string }> = {
  symptom: { label: 'Symptoms', color: 'red' },
  medication: { label: 'Medications', color: 'blue' },
  supplement: { label: 'Supplements', color: 'green' },
  diet: { label: 'Diet', color: 'orange' },
  bodyComposition: { label: 'Body Composition', color: 'violet' },
  fitness: { label: 'Fitness', color: 'teal' },
  misc: { label: 'Misc', color: 'gray' },
};

export const SECTION_ORDER: SectionType[] = [
  'symptom',
  'medication',
  'supplement',
  'diet',
  'bodyComposition',
  'fitness',
  'misc',
];
