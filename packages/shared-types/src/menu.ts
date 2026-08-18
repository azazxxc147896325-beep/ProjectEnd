export type { MenuItem } from './models';

export interface CreateMenuItemDto {
  vendorId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  isDailySpecial?: boolean;
  isAvailable?: boolean;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  isDailySpecial?: boolean;
  isAvailable?: boolean;
}

export interface ToggleMenuItemSpecialDto {
  isDailySpecial: boolean;
}

export interface ToggleMenuItemAvailableDto {
  isAvailable: boolean;
}
