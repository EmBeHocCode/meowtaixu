import type { SectionId } from '../types/sections';

// Keep the existing public anchor IDs for Expertise and Projects.
export const sections: ReadonlyArray<{ id: SectionId; label: string }> = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Expertise' },
  { id: 'skills', label: 'Skills' },
  { id: 'focus', label: 'Focus' },
  { id: 'experience', label: 'Projects' },
  { id: 'connect', label: 'Connect' },
];
