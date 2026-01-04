"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (user) {
            // If user is logged in but hasn't completed onboarding (no specialization)
            // and is not already on the onboarding page
            if (!user.specialization && pathname !== "/onboarding") {
                router.replace("/onboarding");
            }

            // If user is logged in AND has completed onboarding
            // but tries to access onboarding page
            if (user.specialization && pathname === "/onboarding") {
                router.replace("/profile");
            }
        }
    }, [user, loading, pathname, router]);

    return <>{children}</>;
}
