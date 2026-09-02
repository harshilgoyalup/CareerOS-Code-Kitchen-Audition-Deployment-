import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  User 
} from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if dev user was previously logged in
    const devUid = localStorage.getItem('careeros_dev_uid');
    const devEmail = localStorage.getItem('careeros_dev_email');
    if (devUid && devEmail) {
      setUser({
        uid: devUid,
        email: devEmail,
        displayName: devEmail.split('@')[0],
        photoURL: null,
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('careeros_dev_uid');
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        photoURL: res.user.photoURL,
      });
    } catch (err: any) {
      // If Firebase Auth API key is not yet configured, provide seamless dev login fallback
      if (err.code === 'auth/invalid-api-key' || err.message?.includes('API key')) {
        const uid = 'usr_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16);
        localStorage.setItem('careeros_dev_uid', uid);
        localStorage.setItem('careeros_dev_email', email);
        setUser({
          uid,
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        });
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('careeros_dev_uid');
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        photoURL: res.user.photoURL,
      });
    } catch (err: any) {
      if (err.code === 'auth/invalid-api-key' || err.message?.includes('API key')) {
        const uid = 'usr_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16);
        localStorage.setItem('careeros_dev_uid', uid);
        localStorage.setItem('careeros_dev_email', email);
        setUser({
          uid,
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        });
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('careeros_dev_uid');
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
      });
    } catch (err: any) {
      if (err.code === 'auth/invalid-api-key' || err.message?.includes('API key')) {
        const uid = 'google_demo_uid';
        localStorage.setItem('careeros_dev_uid', uid);
        localStorage.setItem('careeros_dev_email', 'alex.engineer@example.com');
        setUser({
          uid,
          email: 'alex.engineer@example.com',
          displayName: 'Alex Mercer',
          photoURL: null,
        });
        return;
      }
      throw err;
    }
  };

  const loginAsDemoUser = () => {
    const uid = 'demo_user_prod';
    localStorage.setItem('careeros_dev_uid', uid);
    localStorage.setItem('careeros_dev_email', 'alex@careeros.app');
    setUser({
      uid,
      email: 'alex@careeros.app',
      displayName: 'Alex Mercer',
      photoURL: null,
    });
  };

  const logout = async () => {
    localStorage.removeItem('careeros_dev_uid');
    localStorage.removeItem('careeros_dev_email');
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
