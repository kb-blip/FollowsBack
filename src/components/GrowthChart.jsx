import React, { useMemo } from 'react';

export default function GrowthChart({ snapshots }) {
    const points = useMemo(() => {
        if (!snapshots || snapshots.length < 2) return [];

        const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let minVal = Infinity;
        let maxVal = -Infinity;
        
        sorted.forEach(s => {
            const count = s.stats.totalFollowers;
            if (count < minVal) minVal = count;
            if (count > maxVal) maxVal = count;
        });

        // Add padding
        minVal = Math.max(0, minVal - 10);
        maxVal = maxVal + 10;
        
        const width = 800;
        const height = 200;
        
        const pathData = sorted.map((snap, i) => {
            const count = snap.stats.totalFollowers;
            
            const x = (i / (sorted.length - 1)) * width;
            const y = height - ((count - minVal) / (maxVal - minVal)) * height;
            
            return { x, y, count, date: new Date(snap.date).toLocaleDateString() };
        });

        return pathData;
    }, [snapshots]);

    if (points.length < 2) return null;

    const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-apple-border p-6 mb-8 w-full overflow-x-auto">
            <h3 className="font-semibold text-apple-text mb-4">Follower Growth Tracking</h3>
            <div className="relative w-full h-[200px]">
                <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible preserve-3d">
                    {/* Grid lines */}
                    {[0, 0.5, 1].map(ratio => (
                        <line key={ratio} x1="0" y1={200 * ratio} x2="800" y2={200 * ratio} stroke="#E5E5EA" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                    
                    {/* Gradient fill */}
                    <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Line area */}
                    <path
                        d={`${pathString} L ${points[points.length-1].x} 200 L 0 200 Z`}
                        fill="url(#blueGradient)"
                    />
                    
                    {/* Trajectory */}
                    <path
                        d={pathString}
                        fill="none"
                        stroke="#007AFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-sm"
                    />

                    {/* Datapoints */}
                    {points.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#007AFF" strokeWidth="2" className="transition-transform group-hover:scale-150" />
                            <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[10px] fill-apple-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                {p.count}
                            </text>
                            <text x={p.x} y={215} textAnchor="middle" className="text-[10px] fill-apple-muted">
                                {p.date}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
