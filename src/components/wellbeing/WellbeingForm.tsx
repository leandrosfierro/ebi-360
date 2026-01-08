"use client";

import { useState } from "react";
import { WELLBEING_DOMAINS, WellbeingDomainId } from "@/lib/wellbeing/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WellbeingFormProps {
    onSave: (scores: Record<string, number>, note: string) => Promise<void>;
    isLoading?: boolean;
}

export function WellbeingForm({ onSave, isLoading: parentLoading }: WellbeingFormProps) {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isComplete = WELLBEING_DOMAINS.every(d => !!scores[d.id]);

    const handleScoreChange = (domainId: WellbeingDomainId, value: number) => {
        setScores(prev => ({ ...prev, [domainId]: value }));
    };

    const getFeedback = (score: number) => {
        if (score <= 4) return "Podés arrancar por algo simple hoy";
        if (score >= 8) return "Bien ahí, sostené lo que te viene funcionando";
        return null;
    };

    const handleSubmit = async () => {
        if (!isComplete) return;
        setIsLoading(true);
        try {
            await onSave(scores, note);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {WELLBEING_DOMAINS.map((domain, index) => (
                    <motion.div
                        key={domain.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-[32px] border border-white/10 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                {domain.label}
                            </Label>
                            {scores[domain.id] && (
                                <span className="text-2xl font-black text-primary italic">
                                    {scores[domain.id]}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                <button
                                    key={val}
                                    onClick={() => handleScoreChange(domain.id as WellbeingDomainId, val)}
                                    className={`
                                        w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center
                                        ${scores[domain.id] === val
                                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                                            : "bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10"}
                                    `}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {scores[domain.id] && getFeedback(scores[domain.id]) && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-[10px] font-bold text-primary/80 italic mt-2 px-1"
                                >
                                    {getFeedback(scores[domain.id])}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card p-8 rounded-[40px] border border-white/10 space-y-4 max-w-2xl mx-auto">
                <Label htmlFor="note" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    ¿Cómo te sentís hoy? (Opcional)
                </Label>
                <Textarea
                    id="note"
                    placeholder="Escribí algo breve..."
                    value={note}
                    onChange={(e) => setNote(e.target.value.substring(0, 280))}
                    className="min-h-[100px] rounded-[24px] border-white/10 bg-white/5 p-6 focus:ring-primary text-base"
                />
                <div className="flex justify-end gap-2 text-[10px] text-muted-foreground font-medium px-2">
                    {note.length} / 280
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!isComplete || isLoading || parentLoading}
                    className="w-full py-8 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading || parentLoading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-6 w-6" />
                    )}
                    Guardar Check-in
                </Button>

                {!isComplete && (
                    <p className="text-center text-[11px] text-muted-foreground font-medium">
                        Completá los 6 dominios para guardar
                    </p>
                )}
            </div>
        </div>
    );
}
