"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Mail, Lock, Eye, EyeOff, User, Loader2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function SignupPage() {
    const router = useRouter();
    const { signUpWithEmail, signInWithGoogle, clearError, user, loading: authLoading } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const validateEmail = (emailStr: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    };

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        if (!password) return { level: 0, label: "", color: "" };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
        if (score <= 3) return { level: 2, label: "Medium", color: "bg-yellow-500" };
        return { level: 3, label: "Strong", color: "bg-green-500" };
    }, [password]);

    const passwordsMatch = password && confirmPassword && password === confirmPassword;
    const isFormValid = firstName.trim().length >= 2 &&
        lastName.trim().length >= 1 &&
        validateEmail(email) &&
        password.length >= 6 &&
        passwordsMatch &&
        acceptedTerms;

    // Redirect if already logged in
    if (!authLoading && user) {
        router.replace(user.onboardingCompleted ? "/profile" : "/onboarding");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!isFormValid) return;

        setLoading(true);
        const success = await signUpWithEmail(email, password, firstName, lastName);
        setLoading(false);

        if (success) {
            router.push("/verify-email");
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
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Begin your learning adventure</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full pl-10 pr-3 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                                        required
                                        minLength={2}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="w-full px-3 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                                    required
                                    minLength={1}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={clsx(
                                        "w-full pl-10 pr-3 py-3 bg-black/40 border rounded-xl text-white placeholder-gray-500 text-sm",
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

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Password Strength Meter */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                className={clsx(
                                                    "h-1 flex-1 rounded-full transition-all",
                                                    level <= passwordStrength.level ? passwordStrength.color : "bg-gray-700"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className={clsx(
                                        "text-xs",
                                        passwordStrength.level === 1 && "text-red-400",
                                        passwordStrength.level === 2 && "text-yellow-400",
                                        passwordStrength.level === 3 && "text-green-400"
                                    )}>
                                        {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={clsx(
                                        "w-full pl-10 pr-10 py-3 bg-black/40 border rounded-xl text-white placeholder-gray-500 text-sm",
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
                                        confirmPassword && !passwordsMatch ? "border-red-500/50" : "border-white/10"
                                    )}
                                    required
                                />
                                {confirmPassword && passwordsMatch && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                )}
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50"
                            />
                            <span className="text-sm text-gray-400">
                                I agree to the{" "}
                                <Link href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className={clsx(
                                "w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all",
                                loading || !isFormValid
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] shadow-lg"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
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

                    {/* Login Link */}
                    <p className="mt-6 text-center text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
