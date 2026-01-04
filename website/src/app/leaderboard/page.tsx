"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { Crown, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for leaderboard updates
        const q = query(
            collection(db, "users"),
            orderBy("totalXP", "desc"),
            limit(50) // Get more to find current user's context
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
                uid: doc.id,
                ...doc.data(),
            })) as User[];
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const top10 = users.slice(0, 10);

    // Find current user's rank and nearby users
    const currentUserIndex = users.findIndex((u) => u.uid === currentUser?.uid);

    // Get 3 above and 3 below current user (if not in top 10)
    let nearbyUsers: { user: User; rank: number }[] = [];
    if (currentUserIndex > 9) {
        const start = Math.max(0, currentUserIndex - 3);
        const end = Math.min(users.length, currentUserIndex + 4);
        nearbyUsers = users.slice(start, end).map((u, i) => ({
            user: u,
            rank: start + i + 1,
        }));
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-gray-400">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Trophy className="text-yellow-500" />
                        Leaderboard
                    </h1>
                    <p className="text-gray-400">Top learners in the community</p>
                </div>

                {/* Top 3 Podium */}
                <div className="flex justify-center items-end gap-4 mb-12">
                    {top10.slice(0, 3).map((user, index) => (
                        <PodiumCard
                            key={user.uid}
                            user={user}
                            rank={index + 1}
                            isCurrentUser={user.uid === currentUser?.uid}
                        />
                    ))}
                </div>

                {/* Rest of Top 10 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
                    <div className="p-4 border-b border-white/10 text-sm text-gray-500 uppercase tracking-widest">
                        Top 10
                    </div>
                    {top10.slice(3).map((user, index) => (
                        <LeaderboardRow
                            key={user.uid}
                            user={user}
                            rank={index + 4}
                            isCurrentUser={user.uid === currentUser?.uid}
                        />
                    ))}
                </div>

                {/* Current User Context (if not in top 10) */}
                {nearbyUsers.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 text-sm text-gray-500 uppercase tracking-widest">
                            Your Ranking
                        </div>
                        {nearbyUsers.map(({ user, rank }) => (
                            <LeaderboardRow
                                key={user.uid}
                                user={user}
                                rank={rank}
                                isCurrentUser={user.uid === currentUser?.uid}
                            />
                        ))}
                    </div>
                )}

                {/* Current user not found */}
                {currentUser && currentUserIndex === -1 && (
                    <div className="text-center text-gray-500 py-8">
                        Complete quests to appear on the leaderboard!
                    </div>
                )}
            </div>
        </div>
    );
}

function PodiumCard({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
    const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
    const colors = {
        1: "from-yellow-500 to-amber-600",
        2: "from-gray-300 to-gray-400",
        3: "from-orange-400 to-orange-600",
    };
    const icons = {
        1: <Crown className="w-6 h-6 text-yellow-400" />,
        2: <Medal className="w-5 h-5 text-gray-300" />,
        3: <Medal className="w-5 h-5 text-orange-400" />,
    };

    return (
        <div className={clsx(
            "flex flex-col items-center",
            rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"
        )}>
            <div className={clsx(
                "relative mb-2",
                isCurrentUser && "ring-4 ring-yellow-500/50 rounded-full"
            )}>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                    <Image
                        src={user.photoURL || "/placeholder-user.jpg"}
                        alt={user.name || "User"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="absolute -top-2 -right-2">
                    {icons[rank as 1 | 2 | 3]}
                </div>
            </div>

            <div className="text-center mb-2">
                <div className="font-bold text-sm truncate max-w-[100px]">{user.name}</div>
                <div className="text-xs text-purple-400">{user.totalXP} XP</div>
            </div>

            <div className={clsx(
                "w-20 rounded-t-lg bg-gradient-to-b flex items-end justify-center pb-2 font-bold text-2xl",
                heights[rank as 1 | 2 | 3],
                colors[rank as 1 | 2 | 3]
            )}>
                {rank}
            </div>
        </div>
    );
}

function LeaderboardRow({ user, rank, isCurrentUser }: { user: User; rank: number; isCurrentUser: boolean }) {
    return (
        <div className={clsx(
            "flex items-center gap-4 p-4 border-b border-white/5 last:border-0 transition-colors",
            isCurrentUser ? "bg-yellow-500/10 border-l-4 border-l-yellow-500" : "hover:bg-white/5"
        )}>
            <div className="w-8 text-center font-bold text-gray-500">
                #{rank}
            </div>

            <div className={clsx(
                "w-10 h-10 rounded-full overflow-hidden border-2",
                isCurrentUser ? "border-yellow-500" : "border-white/10"
            )}>
                <Image
                    src={user.photoURL || "/placeholder-user.jpg"}
                    alt={user.name || "User"}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="flex-1">
                <div className={clsx(
                    "font-medium",
                    isCurrentUser && "text-yellow-400"
                )}>
                    {user.name}
                    {isCurrentUser && <span className="ml-2 text-xs text-yellow-500">(You)</span>}
                </div>
                <div className="text-xs text-gray-500">Level {user.level}</div>
            </div>

            <div className="text-right">
                <div className="font-bold text-purple-400">{user.totalXP} XP</div>
                <div className="text-xs text-gray-500">{user.questsCompleted?.length || 0} quests</div>
            </div>
        </div>
    );
}
