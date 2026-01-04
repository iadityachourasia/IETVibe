"use client";

import { useState } from "react";
import { runPopulation } from "@/lib/demoData";
import { Database, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

export default function PopulatePage() {
    const [status, setStatus] = useState("idle"); // idle, running, success, error
    const [error, setError] = useState("");

    const handleRun = async () => {
        setStatus("running");
        try {
            await runPopulation();
            setStatus("success");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-black">
            <div className="max-w-md w-full p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-purple-500/20">
                        <Database className="w-12 h-12 text-purple-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Populate Demo Data</h1>
                <p className="text-gray-400 mb-8">
                    This will generate 20 sample users, complete quests, and add chat messages.
                    <br />
                    <span className="text-yellow-500 text-xs flex items-center justify-center gap-1 mt-2">
                        <AlertTriangle className="w-3 h-3" /> Use this only in development/test!
                    </span>
                </p>

                {status === "idle" && (
                    <button
                        onClick={handleRun}
                        className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:opacity-90 transition-opacity"
                    >
                        Start Population
                    </button>
                )}

                {status === "running" && (
                    <div className="flex flex-col items-center text-purple-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        Processing...
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center text-green-400">
                        <CheckCircle className="w-12 h-12 mb-2" />
                        <div className="font-bold">Data Created Successfully!</div>
                        <p className="text-sm text-gray-500 mt-2">Check Leaderboard and Quests.</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
                        <div className="font-bold mb-1">Error</div>
                        <div className="text-sm">{error}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
