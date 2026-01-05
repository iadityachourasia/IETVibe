"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { UserBadge, calculateRank } from "@/types";
import { Flame, Target, Trophy, Zap, Coins, Award, Edit3, Save, X, Mail, Building, BookOpen, Calendar, Loader2 } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";

// Rank colors
const RANK_COLORS: Record<string, string> = {
    'Bronze I': 'from-amber-700 to-amber-900',
    'Bronze II': 'from-amber-600 to-amber-800',
    'Bronze III': 'from-amber-500 to-amber-700',
    'Silver I': 'from-gray-400 to-gray-600',
    'Silver II': 'from-gray-300 to-gray-500',
    'Silver III': 'from-gray-200 to-gray-400',
    'Gold I': 'from-yellow-500 to-yellow-700',
    'Gold II': 'from-yellow-400 to-yellow-600',
    'Gold III': 'from-yellow-300 to-yellow-500',
    'Platinum': 'from-cyan-300 to-blue-500',
};

export default function ProfilePage() {
    const { user, updateUserProfile, isEmailVerified } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editBio, setEditBio] = useState(user?.bio || "");

    if (!user) return null;

    const rank = calculateRank(user.totalXP);
    const currentLevelXP = (user.level - 1) * 1000;
    const xpInCurrentLevel = user.totalXP - currentLevelXP;
    const progress = (xpInCurrentLevel / 1000) * 100;

    const userBadges: UserBadge[] = user.badges || [];
    const unlockedIds = userBadges.map(b => b.badgeId);

    const handleSaveBio = async () => {
        setSaving(true);
        await updateUserProfile({ bio: editBio });
        setSaving(false);
        setEditing(false);
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="max-w-6xl mx-auto">

                {/* Email Verification Banner */}
                {!isEmailVerified && user.authProvider === 'email' && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-yellow-500" />
                            <span className="text-yellow-200">Please verify your email to unlock all features.</span>
                        </div>
                        <Link href="/verify-email" className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                            Verify Now
                        </Link>
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-8">
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-50" />

                    <div className="px-8 pb-8">
                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl">
                                    {user.photoURL ? (
                                        <Image src={user.photoURL} alt={user.name || "User"} width={128} height={128} className="object-cover w-full h-full" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                                            {(user.firstName?.[0] || user.name?.[0] || '?').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Level Badge */}
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center border-4 border-black font-black text-lg shadow-lg">
                                    {user.level}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                    <h1 className="text-3xl font-bold text-white">
                                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                                    </h1>
                                    {/* Rank Badge */}
                                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r text-white", RANK_COLORS[rank] || 'from-gray-500 to-gray-700')}>
                                        {rank}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-3">
                                    {user.specialization || "Novice"} • {user.college || "IET DAVV"} • {user.branch || "Student"}
                                </p>

                                {/* Bio */}
                                {editing ? (
                                    <div className="flex items-center gap-2 max-w-lg">
                                        <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={200} className="flex-1 px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Write a short bio..." />
                                        <button onClick={handleSaveBio} disabled={saving} className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => { setEditing(false); setEditBio(user.bio || ""); }} className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-300 text-sm italic">{user.bio || "No bio yet..."}</p>
                                        <button onClick={() => setEditing(true)} className="p-1 text-gray-500 hover:text-white transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                            <StatCard icon={Zap} value={user.totalXP} label="Total XP" color="text-yellow-500" />
                            <StatCard icon={Award} value={user.level} label="Level" color="text-purple-500" />
                            <StatCard icon={Flame} value={user.streak} label="Day Streak" color="text-orange-500" />
                            <StatCard icon={Target} value={user.questsCompleted?.length || 0} label="Quests Done" color="text-green-500" />
                            <StatCard icon={Coins} value={user.coins || 0} label="Coins" color="text-amber-400" />
                        </div>

                        {/* XP Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Level {user.level}</span>
                                <span className="text-purple-400 font-medium">{xpInCurrentLevel} / 1000 XP</span>
                                <span className="text-gray-400">Level {user.level + 1}</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Achievements Section */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Trophy className="text-yellow-500" /> Achievements
                        </h2>
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {ACHIEVEMENTS.map((achievement) => {
                                    const isUnlocked = unlockedIds.includes(achievement.id);
                                    const userBadge = userBadges.find(b => b.badgeId === achievement.id);
                                    let progressText = "";
                                    if (!isUnlocked) {
                                        if (achievement.id === "first-step") progressText = `${user.questsCompleted?.length || 0}/1`;
                                        else if (achievement.id === "10-quest-club") progressText = `${user.questsCompleted?.length || 0}/10`;
                                        else if (achievement.id === "100-xp") progressText = `${user.totalXP}/100`;
                                        else if (achievement.id === "7-day-streak") progressText = `${user.streak}/7`;
                                    }
                                    return (
                                        <div key={achievement.id} className={clsx("relative group p-4 rounded-xl text-center transition-all", isUnlocked ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30" : "bg-white/5 border border-white/10 opacity-60")} title={isUnlocked && userBadge?.unlockedAt ? `Unlocked: ${new Date(userBadge.unlockedAt.seconds * 1000).toLocaleDateString()}` : achievement.description}>
                                            <div className={clsx("text-4xl mb-2", !isUnlocked && "grayscale")}>{achievement.icon}</div>
                                            <div className="text-xs font-bold truncate">{achievement.name}</div>
                                            {!isUnlocked && progressText && <div className="text-xs text-gray-500 mt-1">{progressText}</div>}
                                            {isUnlocked && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Personal Info Card */}
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-400" /> Personal Info
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{user.email}</span>
                                    {isEmailVerified && <span className="text-green-500 text-xs">✓ Verified</span>}
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Building className="w-4 h-4 text-gray-500" />
                                    <span>{user.college || "Not set"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    <span>{user.branch || "Not set"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{user.year ? `${user.year}${user.year === 1 ? 'st' : user.year === 2 ? 'nd' : user.year === 3 ? 'rd' : 'th'} Year` : "Not set"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" /> Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Rank</span>
                                    <span className={clsx("font-bold px-2 py-0.5 rounded bg-gradient-to-r text-white text-sm", RANK_COLORS[rank] || 'from-gray-500 to-gray-700')}>{rank}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Specialization</span>
                                    <span className="font-medium text-purple-400">{user.specialization || "None"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Longest Streak</span>
                                    <span className="font-medium text-orange-400">{user.longestStreak || user.streak || 0} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Member Since</span>
                                    <span className="font-medium text-gray-300">
                                        {user.createdAt && typeof user.createdAt === 'object' && 'seconds' in user.createdAt
                                            ? new Date((user.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString()
                                            : "2024"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Active Perks */}
                        {user.perks && user.perks.length > 0 && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                                <h3 className="text-lg font-bold text-white mb-4">🎁 Active Perks</h3>
                                {user.perks.filter(p => p.isActive).map((perk) => (
                                    <div key={perk.perkId} className="flex items-center justify-between py-2">
                                        <span className="text-purple-300">{perk.name}</span>
                                        <span className="text-xs text-gray-500">Active</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
    return (
        <div className="bg-black/40 backdrop-blur border border-white/5 rounded-xl p-4 text-center hover:border-white/20 transition-all">
            <Icon className={clsx("w-6 h-6 mx-auto mb-2", color)} />
            <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        </div>
    );
}
