export interface OAuthUserData {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface IOAuthProvider {
  readonly providerName: string;
  authenticate(token: string): Promise<OAuthUserData>;
}

// Extensibility Stubs
export interface GoogleOAuthProvider extends IOAuthProvider {
  readonly providerName: 'google';
}

export interface GitHubOAuthProvider extends IOAuthProvider {
  readonly providerName: 'github';
}
