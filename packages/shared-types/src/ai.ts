import { AnalyticsPeriod } from './analytics';

export type AiMessageRole = 'user' | 'assistant' | 'system';

export interface AiChatMessage {
  id?: string;
  role: AiMessageRole;
  content: string;
  timestamp?: string;
}

export interface AiChatRequest {
  vendorId: string;
  message: string;
  history?: AiChatMessage[];
}

export interface AiToolCallLog {
  toolName: string;
  args: Record<string, any>;
  result: Record<string, any>;
}

export interface AiChatResponse {
  answer: string;
  toolCalls?: AiToolCallLog[];
  suggestedActions?: string[];
}

// Mobile AI Food Recommendation Types
export interface RecommendedDishItem {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  vendorId: string;
  vendorName: string;
  category: string;
  matchReason?: string;
}

export interface AiFoodRecommendationRequest {
  query: string;
  budget?: number;
  category?: string;
  mood?: string;
  history?: AiChatMessage[];
}

export interface AiFoodRecommendationResponse {
  answer: string;
  recommendedDishes: RecommendedDishItem[];
  suggestedPrompts: string[];
}

// Web AI Image Generation Types
export type AiFoodImageStyle = 'realistic_studio' | 'street_food' | 'minimal_cafe' | 'overhead_flatlay' | 'cinematic_moody';

export interface AiGenerateImageRequest {
  dishName: string;
  category?: string;
  style?: AiFoodImageStyle;
  customPrompt?: string;
}

export interface AiGenerateImageResponse {
  imageUrl: string;
  promptUsed: string;
  variations?: string[];
}

