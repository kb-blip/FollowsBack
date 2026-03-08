import React from 'react';

export default function StatsCard({ title, value, subtext, trend }) {
    return (
        <div className="flex flex-col p-6 bg-white border border-apple-border rounded-2xl shadow-sm hover:shadow-apple transition-shadow">
            <h3 className="text-apple-muted text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-apple-text tracking-tight">{value}</span>
                {trend !== undefined && trend !== 0 && (
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-[#34C759]' : 'text-apple-rose'}`}>
                        {trend > 0 ? '+' : ''}{trend}
                    </span>
                )}
            </div>
            {subtext && <p className="text-apple-muted text-xs mt-2">{subtext}</p>}
        </div>
    );
}