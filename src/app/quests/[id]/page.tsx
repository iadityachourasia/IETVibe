"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Quest } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { completeQuest } from "@/lib/quests";
import { AchievementDef } from "@/lib/achievements";
import { ArrowLeft, Code2, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { QuestChat } from "@/components/quests/QuestChat";

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const questId = params.id as string;

    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [earnedXP, setEarnedXP] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState<AchievementDef[]>([]);

    useEffect(() => {
        const loadQuest = async () => {
            try {
                const questRef = doc(db, "quests", questId);
                const questSnap = await getDoc(questRef);

                if (questSnap.exists()) {
                    setQuest({
                        id: questSnap.id,
                        ...questSnap.data()
                    } as Quest);
                }
            } catch (error) {
                console.error("Error loading quest:", error);
            } finally {
                setLoading(false);
            }
        };

        loadQuest();
    }, [questId]);

    const handleSubmit = async () => {
        if (!user || !quest) return;

        setError("");

        if (code.trim().length <= 10) {
            setError("Code must be more than 10 characters!");
            return;
        }

        setSubmitting(true);
        try {
            const result = await completeQuest(user.uid, questId, code);
            setEarnedXP(result.earnedXP);
            setUnlockedBadges(result.unlockedBadges);
            setShowSuccess(true);

            // Redirect to profile after 3 seconds (longer if badges unlocked)
            setTimeout(() => {
                router.push("/profile");
            }, result.unlockedBadges.length > 0 ? 4000 : 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit quest");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-gray-400">Loading quest...</div>
            </div>
        );
    }

    if (!quest) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <div className="text-gray-400 mb-4">Quest not found</div>
                <Link href="/quests" className="text-purple-400 hover:underline">
                    Back to Quests
                </Link>
            </div>
        );
    }

    const difficultyColors = {
        Easy: "bg-green-500/20 text-green-400 border-green-500/40",
        Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        Hard: "bg-red-500/20 text-red-400 border-red-500/40",
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <Link href="/quests" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Quests
                </Link>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Quest Info & Submission */}
                    <div className="lg:col-span-2">
                        {/* Quest Header */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                            <div className="flex items-start justify-between mb-4">
                                <span className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold border",
                                    difficultyColors[quest.difficulty]
                                )}>
                                    {quest.difficulty}
                                </span>
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-xl font-bold">{quest.baseXP} XP</span>
                                    <span className="text-sm text-gray-500">(+50 bonus for 100+ chars)</span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold mb-4">{quest.title}</h1>
                            <p className="text-gray-300 mb-4">{quest.description}</p>

                            {quest.category && (
                                <div className="text-sm text-gray-500">
                                    Category: <span className="text-purple-400">{quest.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Code Submission */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Code2 className="text-blue-400" />
                                Submit Your Solution
                            </h2>

                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here... (minimum 10 characters)"
                                className="w-full h-64 p-4 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                                disabled={submitting || showSuccess}
                            />

                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    {code.length} characters
                                    {code.length > 100 && <span className="text-green-400 ml-2">✨ Bonus eligible!</span>}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || showSuccess || !user}
                                    className={clsx(
                                        "px-6 py-3 rounded-lg font-bold transition-all",
                                        submitting || showSuccess || !user
                                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
                                    )}
                                >
                                    {submitting ? "Submitting..." : showSuccess ? "Completed!" : "Submit Solution"}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat */}
                    <div className="lg:col-span-1">
                        <QuestChat questId={questId} />
                    </div>

                </div>
            </div>

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 p-8 rounded-2xl border border-purple-500/50 text-center animate-scale-in">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Quest Completed!</h2>
                        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
                            +{earnedXP} XP!
                        </div>

                        {/* Badge Notifications */}
                        {unlockedBadges.length > 0 && (
                            <div className="my-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="text-yellow-400 font-bold mb-2">🎉 Badges Unlocked!</div>
                                <div className="flex justify-center gap-4">
                                    {unlockedBadges.map((badge) => (
                                        <div key={badge.id} className="text-center">
                                            <div className="text-4xl">{badge.icon}</div>
                                            <div className="text-sm text-gray-300">{badge.name}</div>
                                            {badge.xpReward > 0 && (
                                                <div className="text-xs text-purple-400">+{badge.xpReward} XP</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-gray-300">Redirecting to your profile...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
