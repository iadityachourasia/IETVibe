import { doc, getDoc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface AchievementDef {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: (stats: UserStats) => boolean;
}

interface UserStats {
    questsCompleted: string[];
    totalXP: number;
    streak: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    {
        id: "first-step",
        name: "First Step",
        description: "Complete your first quest",
        icon: "🚀",
        xpReward: 50,
        condition: (stats) => stats.questsCompleted.length >= 1,
    },
    {
        id: "10-quest-club",
        name: "10-Quest Club",
        description: "Complete 10 quests",
        icon: "⭐",
        xpReward: 100,
        condition: (stats) => stats.questsCompleted.length >= 10,
    },
    {
        id: "speed-demon",
        name: "Speed Demon",
        description: "Complete 5 quests quickly",
        icon: "⚡",
        xpReward: 75,
        condition: (stats) => stats.questsCompleted.length >= 5, // Simplified condition
    },
    {
        id: "100-xp",
        name: "100 XP",
        description: "Earn 100 total XP",
        icon: "💯",
        xpReward: 0,
        condition: (stats) => stats.totalXP >= 100,
    },
    {
        id: "7-day-streak",
        name: "7-Day Streak",
        description: "Complete a quest 7 days in a row",
        icon: "🔥",
        xpReward: 200,
        condition: (stats) => stats.streak >= 7,
    },
];

export async function checkAndUnlockBadges(userId: string): Promise<AchievementDef[]> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const stats: UserStats = {
        questsCompleted: userData.questsCompleted || [],
        totalXP: userData.totalXP || 0,
        streak: userData.streak || 0,
    };

    const existingBadges: string[] = (userData.badges || []).map((b: { badgeId: string }) => b.badgeId);
    const newlyUnlocked: AchievementDef[] = [];

    for (const achievement of ACHIEVEMENTS) {
        if (existingBadges.includes(achievement.id)) continue;

        if (achievement.condition(stats)) {
            // Unlock this badge
            await updateDoc(userRef, {
                badges: arrayUnion({
                    badgeId: achievement.id,
                    unlockedAt: serverTimestamp(),
                }),
                totalXP: increment(achievement.xpReward),
            });
            newlyUnlocked.push(achievement);
        }
    }

    return newlyUnlocked;
}
