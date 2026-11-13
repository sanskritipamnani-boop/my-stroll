import type { Category, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, Category> = {
  'visual-references': {
    id: 'visual-references',
    name: 'Visual References',
    shortName: 'Visual',
    icon: '🎨',
    description: 'Aesthetic gems, editorial typography, palettes & textures',
    color: {
      bg: 'bg-[#FFF0F3]',
      border: 'border-[#FDD5DE]',
      text: 'text-[#A02848]',
      accent: '#F43F5E',
      badgeBg: 'bg-[#FFE2E8]',
      badgeText: 'text-[#901D3C]',
      dot: 'bg-[#F43F5E]',
    },
  },
  'product-ideas': {
    id: 'product-ideas',
    name: 'Product Ideas',
    shortName: 'Product',
    icon: '💡',
    description: 'Fresh concepts, reimagined workflows & hook hypotheses',
    color: {
      bg: 'bg-[#EDFAF3]',
      border: 'border-[#D1F2E2]',
      text: 'text-[#1B704E]',
      accent: '#10B981',
      badgeBg: 'bg-[#D7F5E5]',
      badgeText: 'text-[#156143]',
      dot: 'bg-[#10B981]',
    },
  },
  'experiments': {
    id: 'experiments',
    name: 'Engineering',
    shortName: 'Engineering',
    icon: '🧪',
    description: 'Interactive sandboxes, creative code & micro-prototypes',
    color: {
      bg: 'bg-[#FFF3EC]',
      border: 'border-[#FEDCC8]',
      text: 'text-[#9E4018]',
      accent: '#EA580C',
      badgeBg: 'bg-[#FFE6D7]',
      badgeText: 'text-[#8A3613]',
      dot: 'bg-[#EA580C]',
    },
  },
  'ux': {
    id: 'ux',
    name: 'UX Design',
    shortName: 'UX',
    icon: '🧠',
    description: 'Interaction patterns, mental models & usability friction',
    color: {
      bg: 'bg-[#F0F2FE]',
      border: 'border-[#D9DDFB]',
      text: 'text-[#3E42A8]',
      accent: '#6366F1',
      badgeBg: 'bg-[#E3E7FC]',
      badgeText: 'text-[#373A96]',
      dot: 'bg-[#6366F1]',
    },
  },
  'things-i-noticed': {
    id: 'things-i-noticed',
    name: 'Things I Noticed',
    shortName: 'Observations',
    icon: '🔎',
    description: 'Everyday physical & digital observations, serendipity & quirks',
    color: {
      bg: 'bg-[#FEF6E9]',
      border: 'border-[#FCE5C2]',
      text: 'text-[#945512]',
      accent: '#D97706',
      badgeBg: 'bg-[#FBE9D0]',
      badgeText: 'text-[#854B0E]',
      dot: 'bg-[#D97706]',
    },
  },
  'things-to-explore': {
    id: 'things-to-explore',
    name: 'Things to Explore',
    shortName: 'Explorations',
    icon: '📌',
    description: 'Spatial computing, intriguing repos, papers & curiosity seeds',
    color: {
      bg: 'bg-[#EEF7FE]',
      border: 'border-[#D2EBFC]',
      text: 'text-[#1C649B]',
      accent: '#0284C7',
      badgeBg: 'bg-[#DBF0FD]',
      badgeText: 'text-[#165686]',
      dot: 'bg-[#0284C7]',
    },
  },
};

export const CATEGORY_LIST: Category[] = [
  CATEGORIES['visual-references'],
  CATEGORIES['product-ideas'],
  CATEGORIES['experiments'],
  CATEGORIES['ux'],
  CATEGORIES['things-i-noticed'],
  CATEGORIES['things-to-explore'],
];

export function getCategory(id: CategoryId): Category {
  return CATEGORIES[id] || CATEGORIES['things-to-explore'];
}
