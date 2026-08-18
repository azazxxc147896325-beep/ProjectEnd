export type { Vendor } from './models';

export interface CreateVendorDto {
  name: string;
  description?: string;
  logoUrl?: string;
  isOpen?: boolean;
}

export interface UpdateVendorDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  isOpen?: boolean;
}

export interface ToggleVendorOpenDto {
  isOpen: boolean;
}
