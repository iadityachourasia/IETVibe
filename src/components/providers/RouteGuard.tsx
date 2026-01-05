"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (user) {
            // Redirect logged-in users away from auth pages
            if (AUTH_ROUTES.includes(pathname)) {
                router.replace(user.onboardingCompleted ? "/profile" : "/onboarding");
                return;
            }

            // Redirect to onboarding if not completed (except for certain pages)
            if (!user.onboardingCompleted && pathname !== "/onboarding" && pathname !== "/verify-email" && !PUBLIC_ROUTES.includes(pathname)) {
                router.replace("/onboarding");
                return;
            }

            // If onboarding completed and on onboarding page, redirect to profile
            if (user.onboardingCompleted && pathname === "/onboarding") {
                router.replace("/profile");
            }
        }
    }, [user, loading, pathname, router]);

    if (loading && !PUBLIC_ROUTES.includes(pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
