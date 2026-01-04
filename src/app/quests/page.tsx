"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Quest } from "@/types";
import Link from "next/link";
import { Filter, Trophy, Zap } from "lucide-react";
import clsx from "clsx";
import { createSampleQuests } from "@/lib/sampleQuests";

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

export default function QuestsPage() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<DifficultyFilter>("All");

    useEffect(() => {
        const loadQuests = async () => {
            try {
                // Initialize sample quests if needed
                await createSampleQuests();

                const questsRef = collection(db, "quests");
                const snapshot = await getDocs(questsRef);
                const questsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Quest[];

                setQuests(questsData);
            } catch (error) {
                console.error("Error loading quests:", error);
            } finally {
                setLoading(false);
            }
        };

        loadQuests();
    }, []);

    const filteredQuests = filter === "All"
        ? quests
        : quests.filter(q => q.difficulty === filter);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-gray-400">Loading quests...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                        <Trophy className="text-yellow-500" />
                        Quest Board
                    </h1>
                    <p className="text-gray-400">Complete quests to earn XP and level up your skills!</p>
                </div>

                {/* Filter */}
                <div className="mb-8 flex items-center gap-4">
                    <Filter className="text-gray-500" />
                    <div className="flex gap-2">
                        {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map((difficulty) => (
                            <button
                                key={difficulty}
                                onClick={() => setFilter(difficulty)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg font-medium transition-colors",
                                    filter === difficulty
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                {difficulty}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quest Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                    ))}
                </div>

                {filteredQuests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No quests found for this difficulty level.
                    </div>
                )}
            </div>
        </div>
    );
}

function QuestCard({ quest }: { quest: Quest }) {
    const difficultyColors = {
        Easy: "bg-green-500/10 text-green-400 border-green-500/20",
        Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        Hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <Link href={`/quests/${quest.id}`}>
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold border",
                        difficultyColors[quest.difficulty]
                    )}>
                        {quest.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-purple-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{quest.baseXP} XP</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                    {quest.title}
                </h3>

                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {quest.description}
                </p>

                {quest.category && (
                    <div className="text-xs text-gray-500">
                        {quest.category}
                    </div>
                )}
            </div>
        </Link>
    );
}
