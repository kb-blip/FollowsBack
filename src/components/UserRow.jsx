import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function UserRow({ username, status, timestamp }) {
    const getStatusBadge = () => {
        // Inside getStatusBadge()...
        if (status === 'Non-Mutual') return 'bg-rose-50 text-apple-rose border-rose-100';
        if (status === 'Fan') return 'bg-purple-50 text-purple-600 border-purple-100';
        if (status === 'Renamed') return 'bg-blue-50 text-blue-600 border-blue-100';
        if (status === 'Pending') return 'bg-amber-50 text-amber-600 border-amber-100';
        return 'bg-gray-100 text-apple-muted border-gray-200';
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-apple-muted font-semibold text-sm uppercase shadow-sm">
                    {username.substring(0, 2)}
                </div>
                <div className="flex flex-col">
                    <span className="text-apple-text font-medium text-sm">{username}</span>
                    {timestamp && <span className="text-apple-muted text-xs">{new Date(timestamp * 1000).toLocaleDateString()}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusBadge()}`}>
                    {status}
                </span>
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="text-apple-muted hover:text-apple-blue transition-colors p-1">
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}