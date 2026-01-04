"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Code, PenTool, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const SPECIALIZATIONS = [
    {
        id: "Coding",
        label: "Coding",
        icon: Code,
        description: "Master algorithms, build apps, and solve logic puzzles.",
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "Design",
        label: "Design",
        icon: PenTool,
        description: "Create beautiful interfaces, user experiences, and visual art.",
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "Engineering",
        label: "Engineering",
        icon: Wrench,
        description: "Architect systems, optimize performance, and build specific tools.",
        color: "from-orange-500 to-red-500",
    },
] as const;

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSpec, setSelectedSpec] = useState<typeof SPECIALIZATIONS[number]["id"] | null>(null);

    const handleSubmit = async () => {
        if (!user || !selectedSpec) return;

        setLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                specialization: selectedSpec
            });
            router.push("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Or generic loading

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
                    <p className="text-gray-400">Select your specialization to get personalized quests.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {SPECIALIZATIONS.map((spec) => {
                        const Icon = spec.icon;
                        const isSelected = selectedSpec === spec.id;

                        return (
                            <button
                                key={spec.id}
                                onClick={() => setSelectedSpec(spec.id)}
                                className={clsx(
                                    "relative group p-6 rounded-2xl border text-left transition-all duration-300",
                                    isSelected
                                        ? "bg-white/10 border-white/40 ring-2 ring-purple-500/50"
                                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-green-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                )}
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br",
                                    spec.color
                                )}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{spec.label}</h3>
                                <p className="text-sm text-gray-400">{spec.description}</p>
                            </button>
                        )
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedSpec || loading}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-300",
                            !selectedSpec || loading
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        )}
                    >
                        {loading ? "Initializing..." : "Start Learning"}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
