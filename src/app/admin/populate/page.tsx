"use client"
import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function PopulateDemo() {
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

        const loadingToast = toast.loading('Creating demo universe...');

        try {
            for (const user of demoUsers) {
                // Use name as ID for demo purposes to avoid dups if run multiple times
                // In real app we'd use UIDs, but this is a specific demo script
                // We'll suffix with 'demo' to avoid collision with real users if needed, 
                // but 'IET TopCoder' is a fine ID forfirestore demo.
                const userId = user.name.replace(/\s+/g, '').toLowerCase() + "_demo";

                await setDoc(doc(db, "users", userId), {
                    uid: userId, // Ensure UID matches doc ID
                    name: user.name,
                    totalXP: user.totalXP,
                    level: user.level,
                    questsCompleted: new Array(user.questsCompleted).fill("quest_id_placeholder"), // Fake array for count
                    online: user.online,
                    lastQuestDate: serverTimestamp(),
                    joinedAt: serverTimestamp(),
                    email: `${userId}@ietvibe.demo`,
                    photoURL: null
                }, { merge: true }) // Merge so we don't overwrite if exists
            }
            toast.success('🚀 Demo data populated! Check leaderboard!', { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error('Failed to populate data', { id: loadingToast });
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8 pt-20">
            <h1 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                🎮 Demo Data Generator
            </h1>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border border-blue-500/30 shadow-2xl">
                <p className="text-blue-100 mb-6 text-lg">One-click demo data for hackathon judges:</p>
                <ul className="text-blue-200 mb-8 space-y-2">
                    <li>• 🥇 IET TopCoder (5000 XP, Level 5)</li>
                    <li>• 🥈 React Master (3200 XP, Level 4)</li>
                    <li>• 🥉 Algo King (2800 XP, Level 3)</li>
                    <li>• +7 more realistic users</li>
                </ul>
                <button onClick={populateDemo} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200">
                    🚀 POPULATE DEMO DATA
                </button>
            </div>
        </div>
    )
}
