"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Code, PenTool, Wrench, ArrowRight, ArrowLeft, CheckCircle2, Building, BookOpen, Calendar, User, Loader2 } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

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
        description: "Architect systems, optimize performance, and build tools.",
        color: "from-orange-500 to-red-500",
    },
] as const;

const BRANCHES = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Other",
];

const YEARS = [
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
    { value: 5, label: "Alumni" },
];

export default function OnboardingPage() {
    const { user, updateUserProfile } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [bio, setBio] = useState(user?.bio || "");
    const [college, setCollege] = useState(user?.college || "IET DAVV, Indore");
    const [branch, setBranch] = useState(user?.branch || "");
    const [year, setYear] = useState<number>(user?.year || 1);
    const [selectedSpec, setSelectedSpec] = useState<typeof SPECIALIZATIONS[number]["id"] | null>(
        user?.specialization || null
    );

    const totalSteps = 3;

    if (!user) return null;

    const canProceed = () => {
        switch (step) {
            case 1: return true;
            case 2: return college.trim().length > 0 && branch.length > 0 && year > 0;
            case 3: return selectedSpec !== null;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < totalSteps && canProceed()) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;

        console.log("Submitting onboarding...");
        setLoading(true);

        try {
            const success = await updateUserProfile({
                bio,
                college,
                branch,
                year,
                specialization: selectedSpec as 'Coding' | 'Design' | 'Engineering',
                onboardingCompleted: true,
            });

            if (success) {
                console.log("Onboarding complete, navigating to profile");
                router.push("/profile");
            } else {
                console.error("Update failed, staying on onboarding");
            }
        } catch (error) {
            console.error("Error during onboarding submit:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
                        <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                    {step === 1 && (
                        <div>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.firstName || user.name?.split(' ')[0]}! 👋</h1>
                                <p className="text-gray-400">Let&apos;s set up your profile</p>
                            </div>
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30 bg-gradient-to-br from-purple-500 to-blue-500">
                                        {user.photoURL ? (
                                            <Image src={user.photoURL} alt="Profile" width={96} height={96} className="object-cover w-full h-full" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                                                {(user.firstName?.[0] || user.name?.[0] || '?').toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <User className="inline w-4 h-4 mr-2" />Bio (Optional)
                                </label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={200} rows={4} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
                                <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/200</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Academic Details 🎓</h1>
                                <p className="text-gray-400">Help us personalize your experience</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2"><Building className="inline w-4 h-4 mr-2" />College / Institution</label>
                                    <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Enter your college name" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2"><BookOpen className="inline w-4 h-4 mr-2" />Branch / Department</label>
                                    <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer">
                                        <option value="" className="bg-gray-900">Select your branch</option>
                                        {BRANCHES.map((b) => (<option key={b} value={b} className="bg-gray-900">{b}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2"><Calendar className="inline w-4 h-4 mr-2" />Year of Study</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {YEARS.map((y) => (
                                            <button key={y.value} onClick={() => setYear(y.value)} className={clsx("py-3 rounded-xl font-medium transition-all text-sm", year === y.value ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10")}>{y.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Choose Your Path 🚀</h1>
                                <p className="text-gray-400">Select your specialization for personalized quests</p>
                            </div>
                            <div className="grid gap-4">
                                {SPECIALIZATIONS.map((spec) => {
                                    const Icon = spec.icon;
                                    const isSelected = selectedSpec === spec.id;
                                    return (
                                        <button key={spec.id} onClick={() => setSelectedSpec(spec.id)} className={clsx("relative group p-6 rounded-2xl border text-left transition-all duration-300", isSelected ? "bg-white/10 border-purple-500/50 ring-2 ring-purple-500/50" : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10")}>
                                            <div className="flex items-center gap-4">
                                                <div className={clsx("w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br", spec.color)}>
                                                    <Icon className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-1">{spec.label}</h3>
                                                    <p className="text-sm text-gray-400">{spec.description}</p>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                        {step > 1 ? (
                            <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />Back
                            </button>
                        ) : <div />}

                        {step < totalSteps ? (
                            <button onClick={handleNext} disabled={!canProceed()} className={clsx("flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all", canProceed() ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105" : "bg-gray-800 text-gray-500 cursor-not-allowed")}>
                                Next<ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={!canProceed() || loading} className={clsx("flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all", canProceed() && !loading ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105" : "bg-gray-800 text-gray-500 cursor-not-allowed")}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup<CheckCircle2 className="w-5 h-5" /></>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
