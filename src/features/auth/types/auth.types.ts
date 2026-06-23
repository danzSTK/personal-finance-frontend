export interface User {
  id: string;
  userName: string | null;
  email: string;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  providers: AuthProvider[];
}

export interface AuthProvider {
  provider: 'EMAIL' | 'GOOGLE' | 'APPLE';
  linkedAt: string;
}

export interface SignUpDto {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface Session {
  jti: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  location: string;
  loginAt: string;
  isCurrent?: boolean;
}

export interface LinkEmailDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string | null;
  lastName?: string | null;
}

export interface UpdateUserAvatarResponse {
  assetId: string;
  url: string;
}

export interface MessageResponse {
  message: string;
}
