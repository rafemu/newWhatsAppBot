export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: string[];
  isActive?: boolean;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  twoFactorEnabled?: boolean;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER'
} 