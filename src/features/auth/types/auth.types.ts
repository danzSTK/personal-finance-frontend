export type KnownUserStatus =
  | 'ACTIVE'
  | 'PENDING_EMAIL_VERIFICATION'
  | 'BLOCKED'
  | 'PENDING_PROFILE';

export type UserStatus = KnownUserStatus;

export interface User {
  id: string;
  userName: string | null;
  email: string;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
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

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  object: 'auth.password_change';
  status: 'CHANGED';
}

export interface PasswordChangeStatusResponse {
  object: 'auth.password_change_status';
  status: boolean;
}

export type PasswordChangeAvailability =
  | {
      status: true;
      retryAfterSeconds: null;
      retryAtMs: null;
    }
  | {
      status: false;
      retryAfterSeconds: number | null;
      retryAtMs: number | null;
    };

export interface UpdateProfileDto {
  firstName?: string | null;
  lastName?: string | null;
}

export interface UpdateUsernameDto {
  username: string;
}

export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
}

export interface UpdateUserAvatarResponse {
  assetId: string;
  url: string;
}

export interface MessageResponse {
  message: string;
}

export interface EmailVerificationConfirmDto {
  token: string;
}

export interface EmailVerificationConfirmResponse {
  object: 'email_verification.confirmation';
  status: 'VERIFIED';
}

export interface EmailVerificationResendResponse {
  object: 'email_verification.resend';
  status: 'QUEUED' | 'ALREADY_VERIFIED';
}

export type EmailVerificationResendBlockedReason =
  | 'COOLDOWN'
  | 'DAILY_LIMIT'
  | 'OPERATION_PENDING';

export type EmailVerificationResendStatusResponse =
  | {
      object: 'email_verification.resend_status.available';
      status: 'AVAILABLE';
      available: true;
      manualResendsUsed: number;
      manualResendsRemaining: number;
      manualResendLimit: number;
      windowSeconds: number;
      lastLogicalSendAt: string | null;
    }
  | {
      object: 'email_verification.resend_status.blocked';
      status: 'BLOCKED';
      available: false;
      blockedBy?: EmailVerificationResendBlockedReason | string;
      retryAfterSeconds?: number;
      manualResendsUsed?: number;
      manualResendsRemaining?: number;
      manualResendLimit?: number;
      windowSeconds?: number;
      lastLogicalSendAt?: string | null;
    }
  | {
      object: 'email_verification.resend_status.already_verified';
      status: 'ALREADY_VERIFIED';
      available: false;
    };

export type EmailVerificationResendAvailability =
  | {
      status: 'AVAILABLE';
      available: true;
      retryAfterSeconds: null;
      retryAtMs: null;
      manualResendsUsed: number;
      manualResendsRemaining: number;
      manualResendLimit: number;
    }
  | {
      status: 'BLOCKED';
      available: false;
      blockedBy: EmailVerificationResendBlockedReason | string | null;
      retryAfterSeconds: number | null;
      retryAtMs: number | null;
      manualResendsUsed: number | null;
      manualResendsRemaining: number | null;
      manualResendLimit: number | null;
    }
  | {
      status: 'ALREADY_VERIFIED';
      available: false;
      retryAfterSeconds: null;
      retryAtMs: null;
    };
