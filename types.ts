export type CategoryId = 
  | 'azkar_morning' 
  | 'azkar_evening' 
  | 'azkar_sleep' 
  | 'azkar_waking' 
  | 'azkar_prayer' 
  | 'azkar_general'
  | 'dua_quran'
  | 'dua_sunnah'
  | 'dua_rizq'
  | 'dua_faraj'
  | 'dua_illness'
  | 'dua_general';

export interface Item {
  id: string;
  text: string;
  source?: string; // Reference (e.g., Quran verse, Hadith)
  count?: number; // For Azkar repetitions
  note?: string; // Optional context or virtue
}

export interface Category {
  id: CategoryId;
  title: string;
  icon?: string; // We'll map string names to Lucide icons in the component
  items: Item[];
}

export interface Section {
  id: 'azkar' | 'adiyah';
  title: string;
  description: string;
  categories: Category[];
}
