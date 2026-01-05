"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Mail, CheckCircle, Loader2, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, firebaseUser, isEmailVerified, resendVerificationEmail, refreshUser, loading: authLoading } = useAuth();

    const [resending, setResending] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    // Redirect if already verified
    useEffect(() => {
        if (isEmailVerified && user) {
            router.replace(user.onboardingCompleted ? "/profile" : "/onboarding");
        }
    }, [isEmailVerified, user, router]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Check verification status periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            if (firebaseUser && !isEmailVerified) {
                await firebaseUser.reload();
                if (firebaseUser.emailVerified) {
                    await refreshUser();
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [firebaseUser, isEmailVerified, refreshUser]);

    const handleResend = async () => {
        if (cooldown > 0) return;

        setResending(true);
        const success = await resendVerificationEmail();
        setResending(false);

        if (success) {
            setCooldown(60); // 60 second cooldown
        }
    };

    const handleCheckStatus = async () => {
        if (!firebaseUser) return;

        setCheckingStatus(true);
        await firebaseUser.reload();
        await refreshUser();
        setCheckingStatus(false);

        if (firebaseUser.emailVerified) {
            router.replace(user?.onboardingCompleted ? "/profile" : "/onboarding");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-8 border border-purple-500/30">
                    <Mail className="w-12 h-12 text-purple-400" />
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-4">Verify Your Email</h1>

                    <p className="text-gray-400 mb-6">
                        We&apos;ve sent a verification link to<br />
                        <span className="text-white font-medium">{user?.email}</span>
                    </p>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-purple-300">
                            📧 Check your inbox and click the verification link to continue.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checkingStatus}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                        >
                            {checkingStatus ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    I&apos;ve Verified My Email
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleResend}
                            disabled={resending || cooldown > 0}
                            className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : cooldown > 0 ? (
                                `Resend in ${cooldown}s`
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    Resend Verification Email
                                </>
                            )}
                        </button>
                    </div>

                    {/* Help text */}
                    <p className="mt-6 text-sm text-gray-500">
                        Didn&apos;t receive the email? Check your spam folder or try a different email address.
                    </p>

                    {/* Skip for demo */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <Link
                            href="/onboarding"
                            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                        >
                            Skip for now (Demo mode) →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
