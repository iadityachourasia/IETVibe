"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { resetPassword, user, loading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    // Redirect if already logged in
    if (!authLoading && user) {
        router.replace("/profile");
        return null;
    }

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) return;

        setLoading(true);
        const success = await resetPassword(email);
        setLoading(false);

        if (success) {
            setSent(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-gray-400">We&apos;ll send you a reset link</p>
                </div>

                {/* Reset Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-400 mb-6">
                                We&apos;ve sent a password reset link to<br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Didn&apos;t receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                            >
                                Try different email
                            </button>
                        </div>
                    ) : (
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
                                            email && !validateEmail(email) ? "border-red-500/50" : "border-white/10"
                                        )}
                                        required
                                    />
                                </div>
                                {email && !validateEmail(email) && (
                                    <p className="mt-1 text-xs text-red-400">Please enter a valid email address</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !validateEmail(email)}
                                className={clsx(
                                    "w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all",
                                    loading || !validateEmail(email)
                                        ? "bg-gray-700 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
