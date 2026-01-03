'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from MongoDB (for additional fields like companyName)
        try {
          const response = await fetch(`/api/auth/user/${firebaseUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Merge Firebase user with MongoDB user data
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || data.data?.name,
                emailVerified: firebaseUser.emailVerified,
                companyName: data.data?.companyName,
                ...data.data
              });
            } else {
              // User exists in Firebase but not in MongoDB - create it
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                emailVerified: firebaseUser.emailVerified,
              });
            }
          } else {
            // Fallback to Firebase user data only
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to Firebase user data only
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register new user with email/password
  const register = async (email, password, name, companyName) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user in MongoDB with additional data
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name,
            companyName,
            emailVerified: false,
          }),
        });

        if (!response.ok) {
          console.warn('Failed to create user in MongoDB, but Firebase user created');
        }
      } catch (error) {
        console.error('Error creating user in MongoDB:', error);
      }

      return { 
        success: true,
        message: 'Account created! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        return {
          success: false,
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          needsVerification: true
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Create/update user in MongoDB
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          }),
        });

        if (!response.ok) {
          console.warn('Failed to sync user with MongoDB');
        }
      } catch (error) {
        console.error('Error syncing user with MongoDB:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google login failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Resend email verification
  const resendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true, message: 'Verification email sent!' };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get Firebase ID token for API calls
  const getToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loginWithGoogle,
    resetPassword,
    resendVerification,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
