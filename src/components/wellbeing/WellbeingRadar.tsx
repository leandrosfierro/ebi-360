"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { DOMAIN_LABELS } from "@/lib/wellbeing/constants";

interface WellbeingRadarProps {
    scores: Record<string, number>;
}

export function WellbeingRadar({ scores }: WellbeingRadarProps) {
    const data = Object.entries(scores).map(([key, value]) => ({
        subject: DOMAIN_LABELS[key] || key,
        value: value,
        fullMark: 10,
    }));

    return (
        <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        axisLine={false}
                        tickCount={6}
                    />
                    <Radar
                        name="Bienestar"
                        dataKey="value"
                        stroke="#7e22ce"
                        fill="#7e22ce"
                        fillOpacity={0.5}
                        animationBegin={0}
                        animationDuration={1500}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
