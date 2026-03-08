import React from 'react';

export default function StatsCard({ title, value, subtext, trend }) {
    return (
        <div className="flex flex-col p-5 bg-zinc-900/10 border border-zinc-800/60 rounded-xl relative overflow-hidden">
            <h3 className="text-zinc-400 text-xs font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-zinc-100 tracking-tight">{value}</span>
                {trend !== undefined && trend !== 0 && (
                    <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}
                    </span>
                )}
            </div>
            {subtext && <p className="text-zinc-600 text-[10px] mt-2">{subtext}</p>}
        </div>
    );
}