import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const SAMPLE_QUESTS = [
    {
        title: "Build a Counter App",
        description: "Create a simple React counter with increment, decrement, and reset buttons. Use useState hook to manage the counter state.",
        difficulty: "Easy",
        baseXP: 100,
        category: "React Basics"
    },
    {
        title: "React Hooks Tutorial",
        description: "Learn and implement useState, useEffect, and useContext hooks. Create a component that fetches data and displays it with proper loading states.",
        difficulty: "Easy",
        baseXP: 100,
        category: "React Basics"
    },
    {
        title: "Build a TODO List",
        description: "Create a fully functional TODO list app with add, delete, and mark as complete features. Persist data using localStorage.",
        difficulty: "Medium",
        baseXP: 150,
        category: "Web Development"
    },
    {
        title: "Implement a Search Filter",
        description: "Build a searchable list component that filters items in real-time as the user types. Include debouncing for performance.",
        difficulty: "Medium",
        baseXP: 150,
        category: "JavaScript"
    },
    {
        title: "Create a Custom Hook",
        description: "Design and implement a reusable custom React hook for form validation. It should handle multiple fields and validation rules.",
        difficulty: "Medium",
        baseXP: 200,
        category: "React Advanced"
    },
    {
        title: "Build a Weather App",
        description: "Create a weather application that fetches data from a public API. Display current weather, forecast, and handle loading/error states.",
        difficulty: "Medium",
        baseXP: 200,
        category: "API Integration"
    },
    {
        title: "Implement Authentication Flow",
        description: "Build a complete authentication system with login, signup, and protected routes using React Context and Firebase Auth.",
        difficulty: "Hard",
        baseXP: 300,
        category: "Authentication"
    },
    {
        title: "Create a Drag and Drop Interface",
        description: "Implement a drag-and-drop interface for sorting items. Use the HTML5 Drag and Drop API or a library like react-beautiful-dnd.",
        difficulty: "Hard",
        baseXP: 250,
        category: "UI/UX"
    },
    {
        title: "Build a Real-time Chat",
        description: "Create a real-time chat application using WebSockets or Firebase Realtime Database. Include features like typing indicators and message timestamps.",
        difficulty: "Hard",
        baseXP: 350,
        category: "Real-time Apps"
    },
    {
        title: "Implement State Management",
        description: "Build an app using Redux or Zustand for state management. Include async actions, selectors, and proper state organization.",
        difficulty: "Hard",
        baseXP: 300,
        category: "State Management"
    }
];

export async function createSampleQuests() {
    try {
        const questsRef = collection(db, "quests");

        // Check if quests already exist
        const snapshot = await getDocs(questsRef);
        if (!snapshot.empty) {
            console.log("Quests already exist in Firestore");
            return;
        }

        // Add all quests
        for (const quest of SAMPLE_QUESTS) {
            await addDoc(questsRef, quest);
        }

        console.log("✅ Successfully created 10 sample quests!");
    } catch (error) {
        console.error("Error creating sample quests:", error);
    }
}
