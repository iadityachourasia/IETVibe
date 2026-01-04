"use client";

import Link from "next/link";
import { ArrowRight, Shield, Trophy, Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-purple-500/30">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Hackvento 2024
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Level Up Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Community Learning
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Transform group learning into an immersive adventure. Complete quests, earn XP, and master skills together in a gamified ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/quests"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                Continue Quest
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <Link
              href="#features"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">Why Gamify Learning?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-500" />}
              title="Quest-Based Learning"
              description="Break down complex topics into bite-sized quests. Master skills one step at a time."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-blue-500" />}
              title="Collaborative Parties"
              description="Form parties with peers, share knowledge, and tackle group challenges together."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-yellow-500" />}
              title="Rewards & Recognition"
              description="Earn XP, unlock badges, and climb the leaderboard as you progress."
            />
          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Mockup) */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat label="Active Learners" value="500+" />
            <Stat label="Quests Completed" value="2.5k" />
            <Stat label="Badges Earned" value="1.2k" />
            <Stat label="Community Rating" value="4.9/5" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/50 transition-colors group">
      <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
        {value}
      </div>
      <div className="text-sm text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}
