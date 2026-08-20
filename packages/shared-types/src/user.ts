import { Role } from './enums';
export type { User } from './models';

export interface RegisterDto {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: import('./models').User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  vendorId?: string;
}
