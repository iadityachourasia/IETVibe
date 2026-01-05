export interface User {
    // Core Identity
    uid: string;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
    photoURL: string | null;

    // Personal Information
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    dateOfBirth?: string; // YYYY-MM-DD
    phone?: string;
    college?: string;
    branch?: string;
    year?: number; // 1-4

    // Gamification
    totalXP: number;
    level: number;
    rank: string; // Bronze I, Silver II, Gold III, etc.
    questsCompleted: string[];
    specialization?: 'Coding' | 'Design' | 'Engineering';
    streak: number;
    longestStreak: number;

    // Perks & Rewards
    coins: number;
    perks: UserPerk[];
    badges?: UserBadge[];

    // Metadata
    lastActive?: unknown;
    createdAt: unknown;
    updatedAt?: unknown;
    authProvider: 'google' | 'email';
    onboardingCompleted?: boolean;
}

export interface UserPerk {
    perkId: string;
    name: string;
    description: string;
    earnedAt: { seconds: number; nanoseconds: number };
    expiresAt?: { seconds: number; nanoseconds: number };
    isActive: boolean;
}

export interface UserBadge {
    badgeId: string;
    unlockedAt: { seconds: number; nanoseconds: number };
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    baseXP: number;
    category?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockCondition: string;
    icon?: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    content: string;
    timestamp: { seconds: number; nanoseconds: number } | null;
    upvotes: string[];
}

// Rank calculation helper
export function calculateRank(xp: number): string {
    if (xp >= 25000) return 'Platinum';
    if (xp >= 15000) return 'Gold III';
    if (xp >= 10000) return 'Gold II';
    if (xp >= 7500) return 'Gold I';
    if (xp >= 5000) return 'Silver III';
    if (xp >= 3500) return 'Silver II';
    if (xp >= 2000) return 'Silver I';
    if (xp >= 1000) return 'Bronze III';
    if (xp >= 500) return 'Bronze II';
    return 'Bronze I';
}

// Level calculation helper
export function calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
}

// XP needed for next level
export function xpForNextLevel(level: number): number {
    return level * 1000;
}
