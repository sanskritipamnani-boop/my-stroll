export type CategoryId = 
  | 'ux'
  | 'visual-references'
  | 'things-i-noticed'
  | 'product-ideas'
  | 'things-to-explore'
  | 'experiments';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // Emoji
  lucideIconName?: string;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
  };
  description: string;
}

export interface Entry {
  id: string;
  title: string;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm in 24h format (e.g. "10:30")
  endTime?: string; // HH:mm in 24h format (e.g. "11:15")
  description?: string;
  url?: string;
  image?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ViewMode = 'week' | 'month';

export interface FilterState {
  searchQuery: string;
  selectedCategories: CategoryId[];
  selectedTags: string[];
}
