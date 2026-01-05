"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithEmail, signInWithGoogle, authError, clearError, user, loading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect if already logged in
    if (!authLoading && user) {
        router.replace(user.onboardingCompleted ? "/profile" : "/onboarding");
        return null;
    }

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateEmail(email)) {
            return;
        }

        if (password.length < 6) {
            return;
        }

        setLoading(true);
        const success = await signInWithEmail(email, password);
        setLoading(false);

        if (success) {
            router.push("/onboarding");
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signInWithGoogle();
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 
                                      rounded-2xl flex items-center justify-center shadow-2xl mb-4">
                            <span className="text-xl font-black text-gray-900">IET</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to continue your quest</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={clsx(
                                        "w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder-gray-500",
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
                                        authError ? "border-red-500/50" : "border-white/10"
                                    )}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={clsx(
                                        "w-full pl-12 pr-12 py-3 bg-black/40 border rounded-xl text-white placeholder-gray-500",
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
                                        authError ? "border-red-500/50" : "border-white/10"
                                    )}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50"
                                />
                                <span className="text-gray-400">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all",
                                loading
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-500">or continue with</span>
                        </div>
                    </div>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white text-gray-900 font-medium rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
