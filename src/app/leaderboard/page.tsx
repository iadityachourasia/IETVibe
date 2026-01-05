"use client"
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useState, useEffect } from 'react'
import { User } from '@/types'
import Image from 'next/image'

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("totalXP", "desc"), limit(50))

        // Timeout after 5 seconds of no data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timer);
            const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[]
            setLeaderboard(data)
            setLoading(false)
        }, (err) => {
            console.error("Leaderboard error:", err);
            clearTimeout(timer);
            setLoading(false);
        })

        return () => {
            clearTimeout(timer);
            unsubscribe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white pt-20">
                <div className="w-12 h-12 border-4 border-iet-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse font-mono">{`Connecting to IET Servers...`}</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 pt-20">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 
                     bg-clip-text text-transparent mb-8 text-center drop-shadow-sm filter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-davv-gold to-orange-500">🏆 IETVibe Leaderboard</span>
            </h1>

            {leaderboard.length === 0 ? (
                <div className="text-center p-12 bg-gray-900/50 rounded-3xl border border-white/10">
                    <p className="text-gray-400 mb-4">No data found in this dimension.</p>
                    <p className="text-xs text-gray-600">If this persists, verify your Firestore connection or visit the Admin Dashboard to populate data.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {leaderboard.map((user, i) => (
                        <div key={user.uid} className={`p-6 rounded-2xl border transition-all duration-300
                ${i === 0 ? 'bg-gradient-to-r from-davv-gold/80 to-orange-500/80 text-white shadow-2xl scale-105 border-none'
                                : 'bg-gray-900/50 border-iet-blue/30 hover:border-iet-blue/50 hover:scale-[1.02]'}`}>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-black w-12 flex justify-center">
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-r from-iet-blue to-vibe-purple 
                                 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/20 relative">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.name || "User"}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-2xl">👤</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-xl truncate ${i === 0 ? 'text-white' : 'text-gray-100'}`}>
                                        {user.name || 'IET Coder'} {i === 0 && '👑'}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm opacity-90 mt-1">
                                        <div className={`px-3 py-1 rounded-full font-mono font-bold
                          ${i === 0 ? 'bg-black/20 text-white' : 'bg-green-500/20 text-green-400'}`}>
                                            {user.totalXP?.toLocaleString() || 0} XP
                                        </div>
                                        <div className={`px-3 py-1 rounded-full font-mono
                          ${i === 0 ? 'bg-black/20 text-white' : 'bg-iet-blue/20 text-blue-300'}`}>
                                            Level {user.level || 1}
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full
                          ${i === 0 ? 'bg-black/20 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                            {user.questsCompleted?.length || 0} quests
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
