"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";

export function Header() {
    const { user, loading, logout } = useAuth();

    return (
        <header className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 
                       shadow-2xl sticky top-0 z-50 border-b border-blue-500/30">
            <div className="max-w-6xl mx-auto px-6 py-5">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 
                           rounded-2xl flex items-center justify-center shadow-2xl 
                           group-hover:scale-110 transition-all duration-300">
                            <span className="text-2xl font-black text-gray-900 drop-shadow-lg">IET</span>
                        </div>
                        <div className="hidden lg:block">
                            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-400 
                            via-orange-400 to-yellow-500 bg-clip-text text-transparent 
                            drop-shadow-lg">IETVibe</h1>
                            <p className="text-blue-100 text-sm font-medium">IET DAVV Skill Quests • Khandwa Road</p>
                        </div>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-blue-100">
                        <Link href="/quests" className="px-4 py-2 rounded-xl hover:bg-white/10 font-medium transition-all hover:scale-105">🎯 Quests</Link>
                        <Link href="/leaderboard" className="px-4 py-2 rounded-xl hover:bg-white/10 font-medium transition-all hover:scale-105">🏆 Leaderboard</Link>
                        <Link href="/profile" className="px-4 py-2 rounded-xl hover:bg-white/10 font-medium transition-all hover:scale-105">👤 Profile</Link>
                    </nav>

                    {loading ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden relative">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.name || "User"}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-white font-bold">
                                            {user.name?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium text-white max-w-[120px] truncate">{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 ml-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-blue-100 hover:text-white font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all hover:scale-105"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Get Started</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
