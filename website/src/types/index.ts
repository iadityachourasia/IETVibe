export interface User {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL: string | null;
    totalXP: number;
    level: number;
    questsCompleted: string[]; // details of completed quests
    specialization?: 'Coding' | 'Design' | 'Engineering';
    streak: number;
    lastActive?: unknown; // Firestore Timestamp
    createdAt: unknown; // Firestore Timestamp
    badges?: { badgeId: string; unlockedAt: { seconds: number; nanoseconds: number } }[];
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
    timestamp: { seconds: number; nanoseconds: number } | null; // Firestore Timestamp
    upvotes: string[]; // Array of userIds who upvoted
}

export interface UserBadge {
    badgeId: string;
    unlockedAt: { seconds: number; nanoseconds: number };
}
