"use client";

import {FormEventHandler, useEffect, useState} from "react";
import {devAuth, handleDevAuthRedirect} from "@/app/actions/devAuth";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

export default function DevAuthDialog() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputKey, setInputKey] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleDevAuthRedirect().then();
    }, []);

    const handleLogin: FormEventHandler = async e => {
        try {
            e.preventDefault();
            setLoading(true);
            const res = await devAuth(inputKey);

            if (res.success) {
                setIsAuthenticated(true);
            } else {
                alert(res.message);
            }
        } finally {
            setLoading(false);
            await handleDevAuthRedirect();
        }
    };

    return (
        <Dialog open={!isAuthenticated}>
            <DialogContent className="w-full max-w-lg" showClose={false}>
                <form onSubmit={handleLogin}>
                    <DialogHeader>
                        <DialogTitle>Enter Dev API Key</DialogTitle>
                        <DialogDescription>
                            To proceed using this WebApp you should have an Dev API Key.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input type="password" value={inputKey} onChange={e => setInputKey(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
