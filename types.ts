export interface AdFormData {
  productName: string;
  businessType: string;
  targetAudience: string;
  platform: string;
  tone: string;
  objective: string;
  language: string;
}

export interface AdVariation {
  headline: string;
  primaryText: string;
  cta: string;
  framework: 'AIDA' | 'PAS' | 'Benefit-Driven' | 'Storytelling';
  explanation: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  formData: AdFormData;
  variations: AdVariation[];
}

export enum ViewMode {
  GENERATOR = 'GENERATOR',
  HISTORY = 'HISTORY',
}
