"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function ApiKeyPopover() {
    const [apiKey, setApiKey] = useState<string>("wag_eRP5_Rk5kT70bYitdSq1OJoCT7PG5HMv");
    const [gatewayUrl, setGatewayUrl] = useState<string>("https://whatsapp-gateway-vqk0.onrender.com");
    const [showKey, setShowKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setGatewayUrl(window.location.origin);
        }
        fetch("/api/user/api-key")
            .then(r => r.json())
            .then(d => {
                if (d?.data?.apiKey) setApiKey(d.data.apiKey);
            })
            .catch(() => {});
    }, []);

    const handleCopyKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        toast.success("API Key copied!");
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(gatewayUrl);
        setCopiedUrl(true);
        toast.success("Gateway URL copied!");
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-1.5 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xl transition-colors shadow-sm"
                    title="View Gateway API Key"
                >
                    <Key className="h-4 w-4" />
                    <span className="hidden md:inline text-xs">API Key</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-4 rounded-2xl border border-border/50 shadow-2xl glass-panel space-y-3" align="end">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-emerald-500" />
                        <h4 className="font-semibold text-sm">Gateway Credentials</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        ACTIVE
                    </span>
                </div>

                {/* Gateway URL */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase">Gateway URL</Label>
                    <div className="flex gap-1.5">
                        <Input
                            readOnly
                            value={gatewayUrl}
                            className="h-8 font-mono text-xs bg-background/80 select-all"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={handleCopyUrl}
                        >
                            {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>

                {/* API Key */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase">API Key</Label>
                    <div className="flex gap-1.5">
                        <div className="relative flex-1">
                            <Input
                                readOnly
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                className="h-8 font-mono text-xs bg-background/80 pr-8 select-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={handleCopyKey}
                        >
                            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono flex items-center justify-between">
                    <span className="truncate text-slate-400">Header: <span className="text-emerald-400">x-api-key</span></span>
                    <button onClick={handleCopyKey} className="text-emerald-400 hover:underline ml-2">
                        {copiedKey ? "Copied" : "Copy"}
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
