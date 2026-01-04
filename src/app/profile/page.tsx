"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { UserBadge } from "@/types";
import { Flame, Target, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    const nextLevelXP = user.level * 1000; // Simple curve: 1000 XP per level
    const progress = (user.totalXP / nextLevelXP) * 100;

    // Get user's unlocked badges
    const userBadges: UserBadge[] = user.badges || [];
    const unlockedIds = userBadges.map(b => b.badgeId);

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Profile Header */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                            <Image
                                src={user.photoURL || "/placeholder-user.jpg"}
                                alt={user.name || "User"}
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center border-4 border-black font-bold">
                            {user.level}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                        <p className="text-gray-400 mb-4">{user.specialization || "Novice Explorer"} • Joined 2024</p>

                        <div className="max-w-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-purple-400 font-medium">{user.totalXP} XP</span>
                                <span className="text-gray-500">{nextLevelXP} XP</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <StatBadge icon={Flame} value={user.streak} label="Day Streak" color="text-orange-500" />
                        <StatBadge icon={Target} value={user.questsCompleted.length} label="Quests" color="text-green-500" />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Achievements Section */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> Achievements
                        </h2>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {ACHIEVEMENTS.map((achievement) => {
                                    const isUnlocked = unlockedIds.includes(achievement.id);
                                    const userBadge = userBadges.find(b => b.badgeId === achievement.id);

                                    // Calculate progress for locked badges
                                    let progressText = "";
                                    if (!isUnlocked) {
                                        if (achievement.id === "first-step" || achievement.id === "10-quest-club" || achievement.id === "speed-demon") {
                                            const needed = achievement.id === "first-step" ? 1 : achievement.id === "10-quest-club" ? 10 : 5;
                                            progressText = `${user.questsCompleted.length}/${needed}`;
                                        } else if (achievement.id === "100-xp") {
                                            progressText = `${user.totalXP}/100`;
                                        } else if (achievement.id === "7-day-streak") {
                                            progressText = `${user.streak}/7`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={clsx(
                                                "relative group p-4 rounded-xl text-center transition-all",
                                                isUnlocked
                                                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
                                                    : "bg-white/5 border border-white/10 opacity-60"
                                            )}
                                            title={isUnlocked && userBadge?.unlockedAt
                                                ? `Unlocked: ${new Date(userBadge.unlockedAt.seconds * 1000).toLocaleDateString()}`
                                                : achievement.description}
                                        >
                                            <div className={clsx("text-4xl mb-2", !isUnlocked && "grayscale")}>
                                                {achievement.icon}
                                            </div>
                                            <div className="text-xs font-bold truncate">{achievement.name}</div>
                                            {!isUnlocked && progressText && (
                                                <div className="text-xs text-gray-500 mt-1">{progressText}</div>
                                            )}
                                            {isUnlocked && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats / Inventory */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="text-blue-500" /> Stats
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                                <span className="text-gray-400">Current Rank</span>
                                <span className="font-bold">Bronze III</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                                <span className="text-gray-400">Classification</span>
                                <span className="font-bold text-purple-400">{user.specialization || "None"}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatBadge({ icon: Icon, value, label, color }: { icon: React.ElementType, value: number, label: string, color: string }) {
    return (
        <div className="flex flex-col items-center bg-black/40 p-4 rounded-xl border border-white/5 min-w-[100px]">
            <Icon className={clsx("w-6 h-6 mb-2", color)} />
            <span className="text-xl font-bold">{value}</span>
            <span className="text-xs text-gray-500 uppercase">{label}</span>
        </div>
    );
}
