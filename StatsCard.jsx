import React from 'react';

export default function StatsCard({ title, value, subtext, trend, color = "rose" }) {
    const colorClasses = {
        rose: "text-rose-500",
        violet: "text-violet-500",
        zinc: "text-zinc-100"
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2 font-sans">{title}</h3>
            <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold font-mono ${colorClasses[color]}`}>{value}</span>
                {trend && (
                    <span className={`text-xs font-medium mb-1 ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}
                    </span>
                )}
            </div>
            {subtext && <p className="text-zinc-600 text-xs mt-2">{subtext}</p>}
        </div>
    );
}