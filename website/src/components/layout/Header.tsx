"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogIn, LogOut, Trophy } from "lucide-react";

export function Header() {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Hackvento
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/quests" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Quests
                    </Link>
                    <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Leaderboard
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-white">{user.name}</span>
                                <span className="text-xs text-purple-400">Lvl {user.level} • {user.totalXP} XP</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
