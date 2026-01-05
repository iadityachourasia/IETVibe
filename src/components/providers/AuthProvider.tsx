"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    AuthError as FirebaseAuthError,
    User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { User, calculateRank, calculateLevel } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    authError: string | null;
    isEmailVerified: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
    resetPassword: (email: string) => Promise<boolean>;
    resendVerificationEmail: () => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    authError: null,
    isEmailVerified: false,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => false,
    signUpWithEmail: async () => false,
    resetPassword: async () => false,
    resendVerificationEmail: async () => false,
    logout: async () => { },
    clearError: () => { },
    refreshUser: async () => { },
    updateUserProfile: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const clearError = () => setAuthError(null);

    const isEmailVerified = firebaseUser?.emailVerified ?? false;

    const getErrorMessage = (error: FirebaseAuthError): string => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try logging in instead.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password must be at least 6 characters.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed.';
            default:
                return error.message || 'An unexpected error occurred.';
        }
    };

    const createUserDocument = async (fbUser: FirebaseUser, additionalData: Partial<User> = {}): Promise<User> => {
        console.log("Creating user document for:", fbUser.uid, "with data:", additionalData);

        const newUser: User = {
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            name: fbUser.displayName || additionalData.displayName || null,
            photoURL: fbUser.photoURL,
            ...additionalData, // Spread additional data first
            // Then override with required fields
            firstName: additionalData.firstName || '',
            lastName: additionalData.lastName || '',
            displayName: additionalData.displayName || fbUser.displayName || '',
            totalXP: additionalData.totalXP ?? 0,
            level: additionalData.level ?? 1,
            rank: additionalData.rank || 'Bronze I',
            questsCompleted: additionalData.questsCompleted || [],
            streak: additionalData.streak ?? 0,
            longestStreak: additionalData.longestStreak ?? 0,
            coins: additionalData.coins ?? 100,
            perks: additionalData.perks || [],
            badges: additionalData.badges || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            authProvider: additionalData.authProvider || 'email',
            onboardingCompleted: additionalData.onboardingCompleted ?? false, // Explicitly set to false if not provided
        };

        console.log("Setting user document:", newUser);

        // Save to LocalStorage immediately as backup
        localStorage.setItem(`user_${fbUser.uid}`, JSON.stringify(newUser));

        try {
            await setDoc(doc(db, "users", fbUser.uid), newUser);
            console.log("User document created successfully");
        } catch (e) {
            console.error("Failed to create user doc in Firestore (using local backup):", e);
        }

        return newUser;
    };

    const refreshUser = useCallback(async () => {
        if (!firebaseUser) return;

        try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                // Recalculate rank and level
                userData.rank = calculateRank(userData.totalXP);
                userData.level = calculateLevel(userData.totalXP);
                userData.emailVerified = firebaseUser.emailVerified;
                setUser(userData);
            }
        } catch (e) {
            console.error("Error refreshing user:", e);
        }
    }, [firebaseUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log("Auth state changed, user:", fbUser?.uid || "none");
            setFirebaseUser(fbUser);

            if (fbUser) {
                try {
                    console.log("Fetching user document for:", fbUser.uid);
                    const userRef = doc(db, "users", fbUser.uid);

                    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Firestore Timeout")), 4000));
                    const fetchDoc = getDoc(userRef);

                    const userSnap = await Promise.race([fetchDoc, timeout]);

                    if (userSnap.exists()) {
                        console.log("User document found:", userSnap.data());
                        const userData = userSnap.data() as User;
                        userData.emailVerified = fbUser.emailVerified;
                        userData.rank = calculateRank(userData.totalXP);
                        userData.level = calculateLevel(userData.totalXP);
                        console.log("Setting user state with onboardingCompleted:", userData.onboardingCompleted);
                        setUser(userData);
                    } else {
                        console.log("User document not found, creating new one (Google OAuth)");
                        // New user via Google OAuth - create document
                        const nameParts = fbUser.displayName?.split(' ') || ['', ''];
                        const newUser = await createUserDocument(fbUser, {
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            displayName: fbUser.displayName || '',
                            authProvider: 'google',
                        });
                        setUser(newUser);
                    }
                } catch (e) {
                    console.error("Auth fetch failed or timed out:", e);

                    // Try LocalStorage first
                    const savedUser = localStorage.getItem(`user_${fbUser.uid}`);
                    if (savedUser) {
                        try {
                            const parsedUser = JSON.parse(savedUser) as User;
                            console.log("Loaded user from LocalStorage:", parsedUser);
                            setUser(parsedUser);
                            setLoading(false);
                            return;
                        } catch (parseErr) {
                            console.error("Failed to parse local user data:", parseErr);
                        }
                    }

                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        emailVerified: fbUser.emailVerified,
                        name: fbUser.displayName || "Offline User",
                        photoURL: fbUser.photoURL,
                        totalXP: 0,
                        level: 1,
                        rank: 'Bronze I',
                        questsCompleted: [],
                        streak: 0,
                        longestStreak: 0,
                        coins: 0,
                        perks: [],
                        createdAt: null,
                        authProvider: 'email',
                    } as User);
                }
            } else {
                console.log("No user, setting user state to null");
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setAuthError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Welcome! 🎉");
        } catch (error) {
            const err = error as FirebaseAuthError;
            const message = getErrorMessage(err);
            setAuthError(message);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(message);
            }
        }
    };

    const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
        setAuthError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back! 🎉");
            return true;
        } catch (error) {
            const err = error as FirebaseAuthError;
            const message = getErrorMessage(err);
            setAuthError(message);
            toast.error(message);
            return false;
        }
    };

    const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
        setAuthError(null);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);

            if (credential.user) {
                const displayName = `${firstName} ${lastName}`.trim();
                await updateProfile(credential.user, { displayName });

                // Send verification email
                await sendEmailVerification(credential.user);

                // Create user document
                await createUserDocument(credential.user, {
                    firstName,
                    lastName,
                    displayName,
                    authProvider: 'email',
                });
            }

            toast.success("Account created! Please verify your email.");
            return true;
        } catch (error) {
            const err = error as FirebaseAuthError;
            const message = getErrorMessage(err);
            setAuthError(message);
            toast.error(message);
            return false;
        }
    };

    const resendVerificationEmail = async (): Promise<boolean> => {
        if (!firebaseUser) return false;

        try {
            await sendEmailVerification(firebaseUser);
            toast.success("Verification email sent!");
            return true;
        } catch (error) {
            const err = error as FirebaseAuthError;
            toast.error(err.code === 'auth/too-many-requests'
                ? 'Please wait before requesting another email.'
                : 'Failed to send verification email.');
            return false;
        }
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        setAuthError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent! Check your inbox.");
            return true;
        } catch (error) {
            const err = error as FirebaseAuthError;
            const message = getErrorMessage(err);
            setAuthError(message);
            toast.error(message);
            return false;
        }
    };

    const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
        if (!user) {
            console.error("No user found for profile update");
            toast.error("Please log in first.");
            return false;
        }

        console.log("Updating profile with data:", data);

        try {
            const userRef = doc(db, "users", user.uid);

            // Add timeout to prevent hanging
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Update timeout")), 10000)
            );

            const updatePromise = updateDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });

            await Promise.race([updatePromise, timeout]);

            console.log("Profile updated successfully");

            // Update local state
            setUser(prev => prev ? { ...prev, ...data } : null);
            toast.success("Profile updated!");
            return true;
        } catch (error) {
            console.error("Error updating profile in Firestore:", error);

            // Fallback to LocalStorage for Demo Mode
            if (user) {
                console.log("Falling back to LocalStorage for profile update");
                const updatedUser = { ...user, ...data, updatedAt: new Date() };
                localStorage.setItem(`user_${user.uid}`, JSON.stringify(updatedUser));
                setUser(updatedUser);
                toast.success("Profile saved (Offline Mode)!");
                return true;
            }

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Failed to update profile: ${errorMessage}`);
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Error signing out", error);
            toast.error("Failed to log out");
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            firebaseUser,
            loading,
            authError,
            isEmailVerified,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            resetPassword,
            resendVerificationEmail,
            logout,
            clearError,
            refreshUser,
            updateUserProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
