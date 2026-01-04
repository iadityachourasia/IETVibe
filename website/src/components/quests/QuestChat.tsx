"use client";

import { useEffect, useState, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";
import { ChatMessage } from "@/types";
import { Send, Heart, User as UserIcon } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export function QuestChat({ questId }: { questId: string }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = query(
            collection(db, "discussions", questId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatMessage[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [questId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!user || !newMessage.trim()) return;

        try {
            await addDoc(collection(db, "discussions", questId, "messages"), {
                userId: user.uid,
                userName: user.name || "Anonymous",
                userAvatar: user.photoURL,
                content: newMessage.trim(),
                timestamp: serverTimestamp(),
                upvotes: []
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const toggleUpvote = async (msg: ChatMessage) => {
        if (!user) return;
        const msgRef = doc(db, "discussions", questId, "messages", msg.id);
        const hasUpvoted = msg.upvotes.includes(user.uid);

        await updateDoc(msgRef, {
            upvotes: hasUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10 font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Quest Discussion
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div key={msg.id} className="group flex gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                            {msg.userAvatar ? (
                                <Image src={msg.userAvatar} alt={msg.userName} width={32} height={32} className="object-cover" />
                            ) : (
                                <UserIcon className="w-5 h-5 m-1.5 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-bold text-sm text-gray-300">{msg.userName}</span>
                                <span className="text-xs text-gray-500">
                                    {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                </span>
                            </div>
                            <div className="bg-black/20 rounded-lg rounded-tl-none p-3 text-sm text-gray-300 inline-block">
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1 ml-1">
                                <button
                                    onClick={() => toggleUpvote(msg)}
                                    className={clsx(
                                        "text-xs flex items-center gap-1 transition-colors hover:text-red-400",
                                        msg.upvotes.includes(user?.uid || "") ? "text-red-500" : "text-gray-500"
                                    )}
                                >
                                    <Heart className={clsx("w-3 h-3", msg.upvotes.includes(user?.uid || "") && "fill-current")} />
                                    {msg.upvotes.length || 0}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={user ? "Ask a question..." : "Sign in to chat"}
                    disabled={!user}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button
                    type="submit"
                    disabled={!user || !newMessage.trim()}
                    className="p-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
