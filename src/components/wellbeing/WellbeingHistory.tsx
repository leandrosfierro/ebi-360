"use client";

import { useState } from "react";
import { WellbeingCheckIn } from "@/lib/wellbeing/actions";
import { DOMAIN_LABELS } from "@/lib/wellbeing/constants";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Calendar, TrendingUp, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WellbeingHistoryProps {
    history: WellbeingCheckIn[];
    onSelectDay: (checkIn: WellbeingCheckIn) => void;
}

export function WellbeingHistory({ history, onSelectDay }: WellbeingHistoryProps) {
    const [period, setPeriod] = useState<7 | 30 | 90 | 'all'>(30);

    const filteredHistory = period === 'all'
        ? history
        : history.slice(0, period);

    const chartData = [...filteredHistory].reverse().map(item => ({
        date: format(new Date(item.created_at), 'dd/MM'),
        score: item.average_score,
    }));

    return (
        <div className="space-y-8 pb-12">
            {/* Trends Chart */}
            <div className="glass-card p-8 rounded-[48px] border border-white/10 shadow-2xl bg-white/40">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-black italic uppercase tracking-tight">Tendencia de Bienestar</h3>
                    </div>
                    <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5">
                        {[7, 30, 90, 'all'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${period === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                                {p === 'all' ? 'Todo' : `${p}d`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                            />
                            <YAxis
                                domain={[1, 10]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#7e22ce"
                                strokeWidth={4}
                                dot={{ r: 4, fill: '#7e22ce', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Historial Reciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onSelectDay(item)}
                            className="glass-card p-6 rounded-[32px] border border-white/10 hover:border-primary/30 transition-all cursor-pointer group bg-white/20"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight text-foreground/80">
                                            {format(new Date(item.created_at), "EEEE d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase italic px-1">
                                            Promedio: {item.average_score.toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-1">
                                        {Object.values(item.scores).slice(0, 3).map((s, i) => (
                                            <div key={i} className={`w-2 h-2 rounded-full ${s > 7 ? 'bg-emerald-400' : s < 5 ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                        ))}
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="col-span-full py-20 text-center font-bold text-muted-foreground italic bg-white/10 rounded-[40px] border border-dashed border-white/20">
                            Todavía no tenés registros. ¡Hacé tu primer check-in hoy!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
