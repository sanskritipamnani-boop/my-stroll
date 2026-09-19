import type { Entry } from '../types';
import { formatDateIso, getWeekDays } from '../utils/dateUtils';

export function getDemoEntries(): Entry[] {
  const now = new Date();
  const weekDays = getWeekDays(now);
  const day1 = formatDateIso(weekDays[0]); // Monday
  const day2 = formatDateIso(weekDays[1]); // Tuesday
  const day3 = formatDateIso(weekDays[2]); // Wednesday
  const day4 = formatDateIso(weekDays[3]); // Thursday

  return [
    {
      id: 'entry-1',
      title: 'Why job cards feel overwhelming',
      category: 'ux',
      date: day1,
      startTime: '10:30',
      endTime: '11:15',
      description: 'Information hierarchy makes comparison difficult when too many tags, salaries, remote badges, and logos fight for the first 300ms of visual attention. A simpler progressive disclosure model might preserve calmness.',
      url: 'https://uxdesign.cc',
      tags: ['job-search', 'ux', 'information-hierarchy', 'scannability'],
      createdAt: `${day1}T10:30:00Z`,
    },
    {
      id: 'entry-2',
      title: 'Interesting tactile filter interaction',
      category: 'visual-references',
      date: day1,
      startTime: '12:15',
      endTime: '13:00',
      description: 'Found a boutique studio archive where filter chips morph gently into active pill states with a subtle 1px border shift rather than heavy background fills. Very editorial and understated.',
      url: 'https://curated.design',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      tags: ['visual-design', 'interaction', 'filtering', 'editorial'],
      createdAt: `${day1}T12:15:00Z`,
    },
    {
      id: 'entry-3',
      title: 'Why some interfaces feel easier to scan',
      category: 'things-i-noticed',
      date: day2,
      startTime: '15:00',
      endTime: '15:45',
      description: 'Scannability is rarely about font size; it is about rhythmic vertical whitespace and avoiding equal visual weight across adjacent elements. Asymmetry guides the eye naturally.',
      tags: ['typography', 'scanning', 'whitespace', 'rhythm'],
      createdAt: `${day2}T15:00:00Z`,
    },
    {
      id: 'entry-4',
      title: 'A better way to compare job listings',
      category: 'product-ideas',
      date: day2,
      startTime: '18:30',
      endTime: '19:30',
      description: 'What if job listings were plotted on a 2D matrix of "Team autonomy vs. Product scale" instead of a flat vertical infinite scroll list? Would let candidates see tradeoffs immediately.',
      url: 'https://figma.com',
      tags: ['product', 'comparison', 'mental-models', 'job-search'],
      createdAt: `${day2}T18:30:00Z`,
    },
    {
      id: 'entry-5',
      title: 'Spatial interfaces & infinite canvas gestures',
      category: 'things-to-explore',
      date: day3,
      startTime: '09:30',
      endTime: '10:30',
      description: 'Looking into how pan/zoom gestures on desktop can feel as organic as physical paper manipulation without causing motion fatigue. Study dynamic damping and viewport clustering.',
      url: 'https://github.com',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      tags: ['spatial', 'gestures', 'research', 'canvas'],
      createdAt: `${day3}T09:30:00Z`,
    },
    {
      id: 'entry-6',
      title: 'First calendar interaction prototype',
      category: 'experiments',
      date: day4,
      startTime: '14:00',
      endTime: '15:15',
      description: 'Built a quick interactive test rendering fluid time blocks that dynamically adjust their height based on note length and duration without overlapping neighboring items.',
      tags: ['prototype', 'calendar', 'framer-motion', 'code'],
      createdAt: `${day4}T14:00:00Z`,
    },
  ];
}

export const DEMO_ENTRIES: Entry[] = getDemoEntries();

// Default starts completely empty as requested
export const INITIAL_ENTRIES: Entry[] = [];
