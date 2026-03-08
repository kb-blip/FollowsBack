import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function UserRow({ username, status, timestamp }) {
    const statusColors = {
        'Non-Mutual': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        'Mutual': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Unfollowed': 'bg-zinc-800 text-zinc-400 border-zinc-700',
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="text-zinc-200 font-mono text-sm">{username}</p>
                    <p className="text-zinc-600 text-xs">{timestamp ? new Date(timestamp * 1000).toLocaleDateString() : 'Unknown Date'}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[status] || statusColors['Unfollowed']}`}>
                    {status}
                </span>
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-100 transition-colors">
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}