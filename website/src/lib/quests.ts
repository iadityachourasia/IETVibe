import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";
import { checkAndUnlockBadges, AchievementDef } from "./achievements";

export function calculateXP(baseXP: number, code: string): number {
    const bonus = code.length > 100 ? 50 : 0;
    return baseXP + bonus;
}

export interface QuestCompletionResult {
    earnedXP: number;
    unlockedBadges: AchievementDef[];
}

export async function completeQuest(userId: string, questId: string, code: string): Promise<QuestCompletionResult> {
    if (!userId || !questId || !code) {
        throw new Error("Missing required parameters");
    }

    // Validate code length
    if (code.trim().length <= 10) {
        throw new Error("Code must be more than 10 characters");
    }

    // Get quest details
    const questRef = doc(db, "quests", questId);
    const questSnap = await getDoc(questRef);

    if (!questSnap.exists()) {
        throw new Error("Quest not found");
    }

    const quest = questSnap.data();
    const earnedXP = calculateXP(quest.baseXP, code);

    // Update user stats
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        totalXP: increment(earnedXP),
        questsCompleted: arrayUnion(questId)
    });

    // Check and unlock badges
    const unlockedBadges = await checkAndUnlockBadges(userId);

    return { earnedXP, unlockedBadges };
}
