export type OAuthProvider = 'google';

export interface OAuthState {
  provider: OAuthProvider;
  redirectUrl: string;
  state: string;
}

export interface OAuthCallbackParams {
  error?: string;
  error_description?: string;
}

export interface LinkProviderCallbackParams {
  success?: 'google';
  error?: 'missing_state' | 'invalid_state' | 'google_provider_conflict' | string;
}
