import { collection, doc, setDoc, Timestamp, serverTimestamp, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Random realistic names
const USERS = [
    { name: "Alex Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    { name: "Sarah Jones", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "Mike Ross", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { name: "Emily Wang", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
    { name: "David Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { name: "Lisa Patel", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
    { name: "James Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
    { name: "Anna Garcia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" },
    { name: "Tom Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom" },
    { name: "Sophie Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie" },
    { name: "Ryan Miller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan" },
    { name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { name: "Chris Taylor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris" },
    { name: "Olivia Martin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia" },
    { name: "Daniel White", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel" },
    { name: "Grace Hall", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace" },
    { name: "Kevin Turner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin" },
    { name: "Rachel Adams", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel" },
    { name: "Brian Hill", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian" },
    { name: "Jessica Scott", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
];

const MESSAGES = [
    "This quest was super helpful!",
    "Stuck on step 3, can anyone help?",
    "I love how React handles state here.",
    "Just finished! The solution is simpler than I thought.",
    "Great improved my understanding of hooks.",
    "Does this work with Next.js 13 too?",
    "Thanks for the clear instructions.",
    "Anyone else getting a hydration error?",
    "Wow, I finally understand useEffect.",
    "This is exactly what I needed for my project.",
    "Code submission feature is cool.",
    "Level up! 🚀",
    "Can we use Redux instead of Context?",
    "The bonus XP is a nice touch.",
    "Speed running this one!",
    "Found a small typo in the description.",
    "React is awesome.",
    "Next quest: API integration!",
    "Good luck everyone!",
    "First try!"
];



// Improved version that fetches quests


export async function runPopulation() {
    try {
        console.log("Starting population...");

        // 1. Fetch Quests
        const questsSnap = await getDocs(collection(db, "quests"));
        const quests = questsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (quests.length === 0) {
            console.error("No quests found! Run sample quest creation first.");
            return;
        }

        // 2. Create Users
        // Top User (Index 0)
        // Mid Users (Index 1-5)
        // Low Users (Index 6-19)

        const userPromises = USERS.map(async (user, index) => {
            let xp = Math.floor(Math.random() * 400) + 100; // 100-500
            let completedCount = Math.floor(Math.random() * 3) + 1; // 1-3
            let level = 1;

            if (index === 0) {
                // Top User
                xp = 5000 + Math.floor(Math.random() * 500);
                completedCount = quests.length;
                level = 5;
            } else if (index <= 5) {
                // Mid User
                xp = 1000 + Math.floor(Math.random() * 1000);
                completedCount = Math.floor(Math.random() * 3) + 5; // 5-8
                level = 2;
            }

            // Select random quests to complete
            const shuffledQuests = [...quests].sort(() => 0.5 - Math.random());
            const completedQuests = shuffledQuests.slice(0, completedCount).map(q => q.id);

            // Add badges roughly corresponding to stats
            const userBadges = [];
            if (completedCount >= 1) userBadges.push({ badgeId: "first-step", unlockedAt: Timestamp.now() });
            if (completedCount >= 5) userBadges.push({ badgeId: "speed-demon", unlockedAt: Timestamp.now() }); // Fake speed
            if (completedCount >= 10) userBadges.push({ badgeId: "10-quest-club", unlockedAt: Timestamp.now() });
            if (xp >= 100) userBadges.push({ badgeId: "100-xp", unlockedAt: Timestamp.now() });
            if (index === 0) userBadges.push({ badgeId: "7-day-streak", unlockedAt: Timestamp.now() });

            const uid = `demo_user_${index}`;
            const userData = {
                uid,
                name: user.name,
                email: `${user.name.toLowerCase().replace(" ", ".")}@example.com`,
                photoURL: user.avatar,
                totalXP: xp,
                level,
                questsCompleted: completedQuests,
                specialization: ["Coding", "Design", "Engineering"][Math.floor(Math.random() * 3)],
                streak: index === 0 ? 15 : Math.floor(Math.random() * 5),
                badges: userBadges,
                authProvider: 'email',
                onboardingCompleted: true,
                firstName: user.name.split(' ')[0],
                lastName: user.name.split(' ')[1] || '',
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            };

            await setDoc(doc(db, "users", uid), userData);
            return { uid, name: user.name, photoURL: user.avatar };
        });

        const users = await Promise.all(userPromises);
        console.log("Users created.");

        // 3. Create Chat Messages
        // Quest 1 (assume first quest in list) -> 20 messages
        // Quest 2 (assume second) -> 5 messages

        if (quests.length >= 2) {
            const quest1 = quests[0];
            const quest2 = quests[1];

            // Quest 1 Messages
            for (let i = 0; i < 20; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

                await addDoc(collection(db, "discussions", quest1.id, "messages"), {
                    userId: randomUser.uid,
                    userName: randomUser.name,
                    userAvatar: randomUser.photoURL,
                    content: randomMsg,
                    timestamp: serverTimestamp(),
                    upvotes: Math.random() > 0.7 ? [users[0].uid] : [] // Occasional upvote
                });
            }

            // Quest 2 Messages
            for (let i = 0; i < 5; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

                await addDoc(collection(db, "discussions", quest2.id, "messages"), {
                    userId: randomUser.uid,
                    userName: randomUser.name,
                    userAvatar: randomUser.photoURL,
                    content: randomMsg,
                    timestamp: serverTimestamp(),
                    upvotes: []
                });
            }
        }

        console.log("Population complete!");
    } catch (error) {
        console.error("Population failed:", error);
        throw error;
    }
}
