import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function UserRow({ username, status, timestamp }) {
    const getStatusDot = () => {
        if (status === 'Non-Mutual') return 'bg-rose-500';
        if (status === 'Mutual') return 'bg-emerald-500';
        if (status === 'Pending') return 'bg-amber-500';
        return 'bg-zinc-600';
    };

    return (
        <div className="flex items-center justify-between p-4 hover:bg-zinc-800/20 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 font-medium text-xs uppercase">
                    {username.substring(0, 2)}
                </div>
                <div className="flex flex-col">
                    <span className="text-zinc-200 font-medium text-sm">{username}</span>
                    {timestamp && <span className="text-zinc-600 text-[10px]">{new Date(timestamp * 1000).toLocaleDateString()}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot()}`} />
                    <span className="text-xs text-zinc-400 font-medium">{status}</span>
                </div>
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-200 transition-colors p-1">
                    <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
}