"use client";

import React, {useState} from "react";
import {signIn, useSession} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState("serhii.lyzun@gmail.com");
    const [isLoading, setIsLoading] = useState(false);

    const {update} = useSession();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            await signIn("resend", {redirectTo: PAGES_URLS.indices, email});
            await update();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="flex flex-col p-6 bg-white rounded-lg shadow-md">
                <h1 className="mb-4 text-2xl font-bold text-center">Sign In</h1>
                <label htmlFor="email" className="mb-2 text-sm font-medium">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="px-4 py-2 mb-4 border border-gray-300 rounded"
                />
                <button
                    disabled={isLoading}
                    type="submit"
                    className={`px-4 py-2 font-bold text-white rounded ${
                        isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    );
};

export default SignIn;
