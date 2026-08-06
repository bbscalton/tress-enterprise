import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { initFirebase, getUser, setUser, upsertCustomer, type User } from '@fleetrentals/shared';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = initFirebase();
    return onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        let existing = await getUser(fbUser.uid);
        if (!existing) {
          existing = {
            uid: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: fbUser.displayName ?? 'Customer',
            photoURL: fbUser.photoURL,
            role: 'customer',
            createdAt: Date.now(),
          };
          await setUser(existing);
          await upsertCustomer({
            id: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: fbUser.displayName ?? 'Customer',
            rentalCount: 0,
            createdAt: Date.now(),
          });
        }
        setUserState(existing);
      } else {
        setUserState(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    const { auth } = initFirebase();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    const { auth } = initFirebase();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
