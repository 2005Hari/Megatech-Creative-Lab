export interface CreativeData {
  headline: string;
  subtext: string;
  CTA: string;
  layout_description: string;
  festival_theme?: string;
}

export type CreativeType = 'instagram_post' | 'whatsapp_story' | 'linkedin_post' | 'banner' | 'brochure';

export interface CreativeOutput {
  json: CreativeData;
  visualUrl: string; // This will be a base64 data URL
}

export interface HistoryItem extends CreativeOutput {
  id: string;
  createdAt: string;
  creativeType: CreativeType;
  userInput: string;
  occasion: string;
}

export interface User {
  email: string;
}