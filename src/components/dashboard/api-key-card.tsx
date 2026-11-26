"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Copy, Check, Eye, EyeOff, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ApiKeyCard() {
    const [apiKey, setApiKey] = useState<string>("wag_eRP5_Rk5kT70bYitdSq1OJoCT7PG5HMv");
    const [gatewayUrl, setGatewayUrl] = useState<string>("https://whatsapp-gateway-vqk0.onrender.com");
    const [showKey, setShowKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setGatewayUrl(window.location.origin);
        }
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        try {
            const res = await fetch("/api/user/api-key");
            if (res.ok) {
                const data = await res.json();
                if (data?.data?.apiKey) {
                    setApiKey(data.data.apiKey);
                }
            }
        } catch {
            // keep fallback
        }
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        toast.success("API Key copied to clipboard!");
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(gatewayUrl);
        setCopiedUrl(true);
        toast.success("Gateway URL copied to clipboard!");
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!confirm("Are you sure you want to regenerate your API Key? Any external project using your previous key will need to be updated.")) {
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/user/api-key", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                if (data?.data?.apiKey) {
                    setApiKey(data.data.apiKey);
                    setShowKey(true);
                    toast.success("New API Key generated successfully!");
                }
            } else {
                toast.error("Failed to generate API Key");
            }
        } catch {
            toast.error("Error generating API Key");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                Gateway API Credentials
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                                    Active
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-0.5">
                                Use these credentials to connect your other projects (LMS, CRM, n8n, Zapier) to this gateway.
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Gateway URL */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gateway Base URL</Label>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={gatewayUrl}
                                className="font-mono text-xs sm:text-sm bg-background/80 select-all"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleCopyUrl}
                                title="Copy Gateway URL"
                                className="flex-shrink-0"
                            >
                                {copiedUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gateway API Key</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    readOnly
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    className="font-mono text-xs sm:text-sm bg-background/80 pr-10 select-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    title={showKey ? "Hide key" : "Show key"}
                                >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleCopyKey}
                                title="Copy API Key"
                                className="flex-shrink-0"
                            >
                                {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* HTTP Header Preview */}
                <div className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="truncate">
                        <span className="text-slate-400">Header: </span>
                        <span className="text-emerald-400 font-semibold">x-api-key: </span>
                        <span>{showKey ? apiKey : `${apiKey.slice(0, 8)}••••••••••••••••••••••••`}</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyKey}
                        className="text-xs h-7 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                        {copiedKey ? "Copied" : "Copy"}
                    </Button>
                </div>

                <div className="flex justify-end pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="text-xs text-muted-foreground hover:text-destructive"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                        Regenerate API Key
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
