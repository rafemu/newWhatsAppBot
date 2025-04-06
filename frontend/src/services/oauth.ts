import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from './auth';

export interface OAuthUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
}

class OAuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      
      const oauthUser: OAuthUser = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'google'
      };

      // שליחת נתוני המשתמש לשרת ויצירת טוקן
      await authService.loginWithOAuth(oauthUser);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async linkGoogleAccount(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      await currentUser.linkWithPopup(this.googleProvider);
    } catch (error) {
      console.error('Error linking Google account:', error);
      throw error;
    }
  }

  async unlinkGoogleAccount(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      await currentUser.unlink(GoogleAuthProvider.PROVIDER_ID);
    } catch (error) {
      console.error('Error unlinking Google account:', error);
      throw error;
    }
  }
}

export const oauthService = new OAuthService(); 