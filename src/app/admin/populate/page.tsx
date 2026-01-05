"use client"
import { db, auth } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function PopulateDemo() {
    const [authState, setAuthState] = useState<string>("Loading...")

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setAuthState(user ? `Logged in as ${user.email || 'Anonymous'}` : "Not logged in")
        })
        return unsub
    }, [])

    const testConnection = async () => {
        const t = toast.loading("Testing Firestore connection...")
        try {
            // Try to read a non-existent doc with a timeout
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout (5s)")), 5000));
            const read = getDoc(doc(db, "system", "status"));
            await Promise.race([read, timeout]);
            toast.success("Connection OK!", { id: t })
        } catch (e) {
            console.error(e)
            toast.error(`Connection failed: ${e instanceof Error ? e.message : 'Unknown'}`, { id: t })
        }
    }

    const populateDemo = async () => {
        const demoUsers = [
            { name: 'IET TopCoder', totalXP: 5000, level: 5, questsCompleted: 18, online: true },
            { name: 'React Master', totalXP: 3200, level: 4, questsCompleted: 12, online: true },
            { name: 'Algo King', totalXP: 2800, level: 3, questsCompleted: 10, online: false },
            { name: 'CSS Wizard', totalXP: 2100, level: 3, questsCompleted: 8, online: true },
            { name: 'Firebase Pro', totalXP: 1800, level: 2, questsCompleted: 7, online: false },
            { name: 'Next.js Ninja', totalXP: 1450, level: 2, questsCompleted: 6, online: true },
            { name: 'Code Warrior', totalXP: 1200, level: 2, questsCompleted: 5, online: false },
            { name: 'Debug Queen', totalXP: 950, level: 1, questsCompleted: 4, online: true },
            { name: 'Git Guru', totalXP: 700, level: 1, questsCompleted: 3, online: false },
            { name: 'Newbie Coder', totalXP: 150, level: 1, questsCompleted: 1, online: true }
        ]

        if (authState === "Not logged in") {
            const t = toast.loading("Logging in anonymously for write access...")
            try {
                await signInAnonymously(auth);
                toast.success("Logged in anonymously", { id: t })
            } catch (e) {
                toast.error("Auth failed: " + (e instanceof Error ? e.message : 'Unknown'), { id: t })
                return;
            }
        }

        const loadingToast = toast.loading('Populating demo data...');
        let successCount = 0;

        try {
            for (const user of demoUsers) {
                const userId = user.name.replace(/\s+/g, '').toLowerCase() + "_demo";
                console.log(`Setting user: ${userId}`);

                // Add a timeout per request
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout on ${userId}`)), 3000));
                const write = setDoc(doc(db, "users", userId), {
                    uid: userId,
                    name: user.name,
                    totalXP: user.totalXP,
                    level: user.level,
                    questsCompleted: new Array(user.questsCompleted).fill("quest_id_placeholder"),
                    online: user.online,
                    lastQuestDate: serverTimestamp(),
                    joinedAt: serverTimestamp(),
                    email: `${userId}@ietvibe.demo`,
                    photoURL: null
                }, { merge: true });

                await Promise.race([write, timeout]);

                successCount++;
                console.log(`Success ${successCount}/${demoUsers.length}`);
            }
            toast.success(`🚀 ${successCount} users created!`, { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error(`Failed after ${successCount} users: ${e instanceof Error ? e.message : 'Unknown'}`, { id: loadingToast });
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8 pt-20">
            <h1 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                🎮 Admin Dashboard
            </h1>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 mb-8 backdrop-blur-md">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Status</p>
                        <p className="text-lg font-mono text-blue-400">{authState}</p>
                    </div>
                    <button onClick={testConnection} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-all">
                        Test Firestore
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border border-blue-500/30 shadow-2xl">
                <p className="text-blue-100 mb-6 text-lg">Initialize demo universe:</p>
                <ul className="text-blue-200 mb-8 space-y-2 text-sm opacity-80">
                    <li>• Creates 10 ranked users including 🥇 IET TopCoder</li>
                    <li>• Sets transactional XP levels</li>
                    <li>• Requires Anonymous or Google login for write permission</li>
                </ul>
                <button onClick={populateDemo} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200">
                    🚀 POPULATE DEMO DATA
                </button>
            </div>

            <p className="mt-8 text-center text-xs text-gray-600">
                If population hangs, ensure Firestore is enabled and project ID is correct in .env.local
            </p>
        </div>
    )
}
