import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isNew?: boolean;
  category: 'organize' | 'convert-to-pdf' | 'convert-from-pdf' | 'edit-security' | 'optimize';
}

export interface NavDropdownItem {
  label: string;
  items: string[]; // List of Tool IDs or Labels
}

export interface OCRResult {
  text: string;
}
