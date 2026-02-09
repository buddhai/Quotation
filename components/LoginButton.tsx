'use client';

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn("google")}
            className="w-full bg-[#3182f6] hover:bg-[#1b64da] text-white font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg"
        >
            <LogIn size={24} />
            <span>Start with Google</span>
        </button>
    );
}
