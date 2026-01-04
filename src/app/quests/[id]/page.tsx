"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, runTransaction, serverTimestamp, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Quest } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { QuestChat } from "@/components/quests/QuestChat";
import { ArrowLeft, Code2, Zap } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import toast from "react-hot-toast";

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const questId = params.id as string;

    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Kept for backward compatibility if we want to show badges here, 
    // but simplified logic uses toast for success now.
    // We can still use the popup if we want, but user asked for logic upgrade.
    // The user requested explicit submitQuest function.

    useEffect(() => {
        const loadQuest = async () => {
            try {
                const questRef = doc(db, "quests", questId);
                const questSnap = await getDoc(questRef);
                if (questSnap.exists()) {
                    setQuest({ id: questSnap.id, ...questSnap.data() } as Quest);
                }
            } catch (error) {
                console.error("Error loading quest:", error);
            } finally {
                setLoading(false);
            }
        };
        loadQuest();
    }, [questId]);

    const submitQuest = async () => {
        if (!user || !quest) return;
        if (!code.trim()) {
            toast.error("Enter some code!");
            return;
        }

        setSubmitting(true);
        try {
            const xpEarned = quest.baseXP + (code.length > 100 ? 50 : 0);

            // Record quest completion
            await setDoc(doc(db, `users/${user.uid}/quests`, questId), {
                questId,
                completedAt: serverTimestamp(),
                code: code.trim(),
                xpEarned
            }, { merge: true });

            // Update User Stats transactionally
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await transaction.get(userRef);

                if (!userSnap.exists()) throw "User does not exist!";

                const currentXP = userSnap.data().totalXP || 0;
                const newXP = currentXP + xpEarned;
                const newLevel = Math.floor(newXP / 1000) + 1; // Simple level formula

                transaction.update(userRef, {
                    totalXP: newXP,
                    questsCompleted: increment(1), // Basic counter, actual list is subcollection
                    level: newLevel,
                    lastQuestDate: serverTimestamp(),
                    online: true
                });
            });

            toast.success(`+${xpEarned} XP! 🎉 Level ${Math.floor((user.totalXP + xpEarned) / 1000) + 1}`, {
                duration: 5000,
                icon: '🚀'
            });

            setCode("");
            router.push("/profile?newLevel=true");

        } catch (error) {
            console.error(error);
            toast.error("Submission failed! Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 flex justify-center text-gray-400">Loading...</div>;
    if (!quest) return <div className="min-h-screen pt-20 text-center text-gray-400">Quest not found</div>;

    const difficultyColors = {
        Easy: "bg-green-500/20 text-green-400 border-green-500/40",
        Medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",
        Hard: "bg-red-500/20 text-red-500 border-red-500/40",
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                <Link href="/quests" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Quests
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quest Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex justify-between items-start mb-4">
                                <span className={clsx("px-4 py-2 rounded-full text-sm font-bold border", difficultyColors[quest.difficulty])}>
                                    {quest.difficulty}
                                </span>
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-xl font-bold">{quest.baseXP} XP</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{quest.title}</h1>
                            <p className="text-gray-300">{quest.description}</p>
                        </div>

                        {/* Submission */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Code2 className="text-blue-400" /> Submit Solution
                            </h2>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here... (100+ chars for bonus!)"
                                className="w-full h-64 p-4 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                                disabled={submitting}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-500">
                                    {code.length} chars {code.length > 100 && <span className="text-green-400 ml-2">✨ Bonus!</span>}
                                </div>
                                <button
                                    onClick={submitQuest}
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {submitting ? "Submitting..." : "Submit Solution 🚀"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <QuestChat questId={questId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
