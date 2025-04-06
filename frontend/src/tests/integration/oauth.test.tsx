import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../pages/auth/LoginPage';
import { oauthService } from '../../services/oauth';
import { authService } from '../../services/auth';

// מדמה את מודול Firebase
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  getAuth: jest.fn(),
}));

// מדמה את שירותי האימות
jest.mock('../../services/auth', () => ({
  authService: {
    loginWithOAuth: jest.fn(),
    fetchUserDetails: jest.fn(),
  },
}));

describe('OAuth Integration Tests', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('מציג כפתור התחברות עם Google', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/התחבר עם Google/i)).toBeInTheDocument();
  });

  it('מבצע התחברות מוצלחת עם Google', async () => {
    // מדמה התחברות מוצלחת עם Firebase
    (signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    // מדמה התחברות מוצלחת עם השרת
    (authService.loginWithOAuth as jest.Mock).mockResolvedValueOnce({});
    (authService.fetchUserDetails as jest.Mock).mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // לחיצה על כפתור Google
    fireEvent.click(screen.getByText(/התחבר עם Google/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(authService.loginWithOAuth).toHaveBeenCalledWith({
        id: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
        provider: 'google',
      });
    });
  });

  it('מטפל בשגיאת התחברות עם Google', async () => {
    // מדמה שגיאת התחברות
    const error = new Error('Google sign in failed');
    (signInWithPopup as jest.Mock).mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // לחיצה על כפתור Google
    fireEvent.click(screen.getByText(/התחבר עם Google/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(authService.loginWithOAuth).not.toHaveBeenCalled();
    });
  });

  it('מקשר חשבון Google לחשבון קיים', async () => {
    const mockCurrentUser = {
      linkWithPopup: jest.fn().mockResolvedValueOnce({}),
    };

    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: mockCurrentUser,
    });

    await oauthService.linkGoogleAccount();

    expect(mockCurrentUser.linkWithPopup).toHaveBeenCalled();
  });

  it('מנתק חשבון Google', async () => {
    const mockCurrentUser = {
      unlink: jest.fn().mockResolvedValueOnce({}),
    };

    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: mockCurrentUser,
    });

    await oauthService.unlinkGoogleAccount();

    expect(mockCurrentUser.unlink).toHaveBeenCalledWith('google.com');
  });
}); 