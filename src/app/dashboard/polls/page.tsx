"use client";

import { useState } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Vote, ListOrdered, Plus, Trash2, Send, CheckCircle2, Phone, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function PollsAndListsPage() {
    const { sessionId } = useSession();
    const [activeTab, setActiveTab] = useState<"poll" | "list">("poll");

    // Poll State
    const [pollTargets, setPollTargets] = useState("");
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState<string[]>(["Option 1", "Option 2", "Option 3"]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [pollLoading, setPollLoading] = useState(false);

    // List / Menu State
    const [listTargets, setListTargets] = useState("");
    const [listTitle, setListTitle] = useState("");
    const [listOptions, setListOptions] = useState<string[]>(["Option 1", "Option 2", "Option 3"]);
    const [listFooter, setListFooter] = useState("Reply with number to choose");
    const [listLoading, setListLoading] = useState(false);

    // Helpers for Poll Options
    const handleAddPollOption = () => {
        if (pollOptions.length >= 12) {
            return toast.warning("WhatsApp polls support a maximum of 12 options");
        }
        setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`]);
    };

    const handleRemovePollOption = (index: number) => {
        if (pollOptions.length <= 2) {
            return toast.warning("A poll must have at least 2 options");
        }
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const next = [...pollOptions];
        next[index] = value;
        setPollOptions(next);
    };

    // Helpers for List Options
    const handleAddListOption = () => {
        setListOptions([...listOptions, `Option ${listOptions.length + 1}`]);
    };

    const handleRemoveListOption = (index: number) => {
        if (listOptions.length <= 1) {
            return toast.warning("A list menu must have at least 1 option");
        }
        setListOptions(listOptions.filter((_, i) => i !== index));
    };

    const handleListOptionChange = (index: number, value: string) => {
        const next = [...listOptions];
        next[index] = value;
        setListOptions(next);
    };

    // Send Poll
    const handleSendPoll = async () => {
        if (!sessionId) return toast.error("No active session selected");
        if (!pollTargets.trim()) return toast.error("Please enter at least one target phone number");
        if (!pollQuestion.trim()) return toast.error("Please enter a poll question");

        const cleanOptions = pollOptions.map(o => o.trim()).filter(Boolean);
        if (cleanOptions.length < 2) return toast.error("Poll must have at least 2 valid options");

        const numbers = pollTargets.split(/[\n,]+/).map(s => s.trim().replace(/[^0-9]/g, "")).filter(Boolean);
        if (numbers.length === 0) return toast.error("Invalid phone numbers");

        setPollLoading(true);
        let sentCount = 0;
        let failCount = 0;

        for (const num of numbers) {
            const jid = `${num}@s.whatsapp.net`;
            try {
                const res = await fetch(`/api/messages/${sessionId}/${encodeURIComponent(jid)}/poll`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: pollQuestion.trim(),
                        options: cleanOptions,
                        selectableCount: allowMultiple ? cleanOptions.length : 1
                    })
                });
                const data = await res.json();
                if (data.status) {
                    sentCount++;
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        setPollLoading(false);
        if (sentCount > 0) {
            toast.success(`Poll sent successfully to ${sentCount} recipient(s)!`);
        }
        if (failCount > 0) {
            toast.error(`Failed to send poll to ${failCount} recipient(s)`);
        }
    };

    // Send List Menu
    const handleSendList = async () => {
        if (!sessionId) return toast.error("No active session selected");
        if (!listTargets.trim()) return toast.error("Please enter at least one target phone number");
        if (!listTitle.trim()) return toast.error("Please enter a menu title");

        const cleanOptions = listOptions.map(o => o.trim()).filter(Boolean);
        if (cleanOptions.length === 0) return toast.error("Please enter at least one option");

        const numbers = listTargets.split(/[\n,]+/).map(s => s.trim().replace(/[^0-9]/g, "")).filter(Boolean);
        if (numbers.length === 0) return toast.error("Invalid phone numbers");

        setListLoading(true);
        let sentCount = 0;
        let failCount = 0;

        for (const num of numbers) {
            const jid = `${num}@s.whatsapp.net`;
            try {
                const res = await fetch(`/api/messages/${sessionId}/${encodeURIComponent(jid)}/list`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: listTitle.trim(),
                        options: cleanOptions,
                        footer: listFooter.trim() || undefined
                    })
                });
                const data = await res.json();
                if (data.status) {
                    sentCount++;
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        setListLoading(false);
        if (sentCount > 0) {
            toast.success(`Menu list sent successfully to ${sentCount} recipient(s)!`);
        }
        if (failCount > 0) {
            toast.error(`Failed to send to ${failCount} recipient(s)`);
        }
    };

    return (
        <SessionGuard>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Vote className="h-7 w-7 text-emerald-600" />
                            Interactive Polls & Menus
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Send native interactive polls and numbered option menus directly to WhatsApp users.
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="inline-flex rounded-xl bg-muted p-1 border border-border/50">
                        <button
                            type="button"
                            onClick={() => setActiveTab("poll")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === "poll"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Vote className="h-4 w-4" />
                            Interactive Poll
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("list")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === "list"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <ListOrdered className="h-4 w-4" />
                            Menu / List
                        </button>
                    </div>
                </div>

                {/* Main Content Grid: Form + Live Preview */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Editor Form */}
                    <div className="lg:col-span-7 space-y-6">
                        {activeTab === "poll" ? (
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Vote className="h-5 w-5 text-emerald-500" />
                                        Create WhatsApp Poll
                                    </CardTitle>
                                    <CardDescription>
                                        Recipients can vote directly using interactive buttons inside their WhatsApp chat.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Target Numbers */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            Target Phone Number(s)
                                        </Label>
                                        <Textarea
                                            placeholder="e.g. 919876543210 (or separate multiple numbers by commas or newlines)"
                                            rows={2}
                                            value={pollTargets}
                                            onChange={e => setPollTargets(e.target.value)}
                                            className="font-mono text-xs sm:text-sm"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Include country code (e.g. 91 for India, 1 for US) without +, spaces, or dashes.
                                        </p>
                                    </div>

                                    {/* Poll Question */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                            Poll Question
                                        </Label>
                                        <Input
                                            placeholder="e.g. Which course would you like to enroll in?"
                                            value={pollQuestion}
                                            onChange={e => setPollQuestion(e.target.value)}
                                        />
                                    </div>

                                    {/* Poll Options */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold">Voting Options ({pollOptions.length}/12)</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddPollOption}
                                                disabled={pollOptions.length >= 12}
                                                className="h-7 text-xs gap-1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Option
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {pollOptions.map((option, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                                                        {idx + 1}.
                                                    </span>
                                                    <Input
                                                        value={option}
                                                        onChange={e => handlePollOptionChange(idx, e.target.value)}
                                                        placeholder={`Option ${idx + 1}`}
                                                        className="text-xs sm:text-sm h-9"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemovePollOption(idx)}
                                                        disabled={pollOptions.length <= 2}
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Multiple choice toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-semibold">Allow Multiple Answers</Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Allow voters to select more than one option.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={allowMultiple}
                                            onCheckedChange={setAllowMultiple}
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <Button
                                        type="button"
                                        onClick={handleSendPoll}
                                        disabled={pollLoading}
                                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                    >
                                        <Send className="h-4 w-4" />
                                        {pollLoading ? "Sending Poll..." : "Send Interactive Poll Now"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ListOrdered className="h-5 w-5 text-sky-500" />
                                        Create Menu / Option List
                                    </CardTitle>
                                    <CardDescription>
                                        Sends a formatted interactive menu where customers can reply with a number to choose.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Target Numbers */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            Target Phone Number(s)
                                        </Label>
                                        <Textarea
                                            placeholder="e.g. 919876543210 (or separate multiple numbers by commas or newlines)"
                                            rows={2}
                                            value={listTargets}
                                            onChange={e => setListTargets(e.target.value)}
                                            className="font-mono text-xs sm:text-sm"
                                        />
                                    </div>

                                    {/* Menu Title */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Menu Title / Header</Label>
                                        <Input
                                            placeholder="e.g. 🎓 Welcome to Rohan's LMS Portal"
                                            value={listTitle}
                                            onChange={e => setListTitle(e.target.value)}
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold">Menu Options ({listOptions.length})</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddListOption}
                                                className="h-7 text-xs gap-1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Item
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {listOptions.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                                                        {idx + 1}.
                                                    </span>
                                                    <Input
                                                        value={opt}
                                                        onChange={e => handleListOptionChange(idx, e.target.value)}
                                                        placeholder={`Item ${idx + 1}`}
                                                        className="text-xs sm:text-sm h-9"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveListOption(idx)}
                                                        disabled={listOptions.length <= 1}
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Footer Instruction</Label>
                                        <Input
                                            placeholder="e.g. Reply with 1, 2, or 3 to proceed"
                                            value={listFooter}
                                            onChange={e => setListFooter(e.target.value)}
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <Button
                                        type="button"
                                        onClick={handleSendList}
                                        disabled={listLoading}
                                        className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                                    >
                                        <Send className="h-4 w-4" />
                                        {listLoading ? "Sending Menu List..." : "Send Menu List Now"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Live WhatsApp Mobile Preview */}
                    <div className="lg:col-span-5 sticky top-24">
                        <Card className="border-border/60 shadow-md overflow-hidden bg-slate-900 text-slate-100">
                            <CardHeader className="bg-slate-950/60 border-b border-slate-800 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        WhatsApp Live Preview
                                    </CardTitle>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                        {activeTab === "poll" ? "Native Poll" : "Option Menu"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {/* Chat Bubble */}
                                {activeTab === "poll" ? (
                                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-emerald-950/70 border border-emerald-500/30 text-emerald-50 space-y-3 shadow-md">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                            <Vote className="h-4 w-4" />
                                            <span>WhatsApp Poll</span>
                                        </div>
                                        <p className="font-semibold text-sm leading-snug">
                                            {pollQuestion.trim() || "Your Poll Question Will Appear Here"}
                                        </p>
                                        <p className="text-[10px] text-emerald-300/70 font-mono">
                                            {allowMultiple ? "Select one or more" : "Select one"}
                                        </p>
                                        <div className="space-y-1.5 pt-1">
                                            {pollOptions.map((opt, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs font-medium"
                                                >
                                                    <span className="truncate pr-2">{opt || `Option ${i + 1}`}</span>
                                                    <div className="h-4 w-4 rounded-full border-2 border-emerald-400/60 flex items-center justify-center flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end pt-1">
                                            <span className="text-[9px] text-slate-400 font-mono">12:00 PM ✓✓</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-slate-800 border border-slate-700 text-slate-100 space-y-2 shadow-md">
                                        <p className="font-bold text-sm text-sky-400">
                                            {listTitle.trim() || "Menu Header Title"}
                                        </p>
                                        <div className="space-y-1 text-xs text-slate-200 font-mono py-1">
                                            {listOptions.map((opt, i) => (
                                                <div key={i}>
                                                    <span className="text-sky-300 font-bold">{i + 1}.</span> {opt || `Item ${i + 1}`}
                                                </div>
                                            ))}
                                        </div>
                                        {listFooter && (
                                            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/60">
                                                _{listFooter}_
                                            </p>
                                        )}
                                        <div className="flex justify-end pt-1">
                                            <span className="text-[9px] text-slate-400 font-mono">12:00 PM ✓✓</span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] text-slate-400 text-center italic">
                                    👆 This is how your message appears on customer phones.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SessionGuard>
    );
}
