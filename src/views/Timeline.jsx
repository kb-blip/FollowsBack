import React from 'react';
import { compareSnapshots } from '../lib/processor';
import { Clock, ArrowRight, UserMinus, UserX, AlertCircle, ExternalLink } from 'lucide-react';

export default function Timeline({ snapshots }) {
    if (!snapshots || snapshots.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-apple-muted mb-4">
                    <Clock size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-apple-text">Not Enough Data</h2>
                <p className="text-apple-muted mt-2 max-w-sm">The timeline requires at least 2 uploads to compare your history. Upload another snapshot in the future to see who dropped off!</p>
            </div>
        );
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    const { lost } = compareSnapshots(previous, current);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-apple-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Activity Timeline</h2>
                <p className="text-apple-muted text-sm mt-1">Track account name changes, deactivations, and unfollowers.</p>
            </div>

            {lost.length === 0 ? (
                <div className="p-12 text-center text-apple-muted text-sm bg-white border border-apple-border rounded-2xl shadow-sm">
                    No timeline activity detected since your last sync. Great job! 🎉
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden divide-y divide-apple-border">
                    {lost.map(user => (
                        <div key={user.username} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {/* Dynamic Icon Profile Bubble */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${user.status === 'Renamed' ? 'bg-blue-50 text-apple-blue border-blue-100' :
                                    user.status === 'Deactivated' ? 'bg-gray-100 text-gray-400 border-gray-200' :
                                        'bg-rose-50 text-apple-rose border-rose-100'
                                    }`}>
                                    {user.status === 'Renamed' ? <AlertCircle size={18} /> :
                                        user.status === 'Deactivated' ? <UserX size={18} /> :
                                            <UserMinus size={18} />}
                                </div>

                                {/* Username Info Block */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold text-sm ${user.status === 'Deactivated' ? 'text-apple-muted line-through opacity-70' : 'text-apple-text'}`}>
                                            @{user.username}
                                        </span>
                                        {user.status === 'Renamed' && (
                                            <>
                                                <ArrowRight size={14} className="text-apple-muted" />
                                                <span className="font-semibold text-sm text-apple-blue">@{user.renamedTo}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-apple-muted text-xs mt-0.5">
                                        Followed you on {user.timestamp ? new Date(user.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                </div>
                            </div>

                            {/* Status Badges & Action Links */}
                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${user.status === 'Renamed' ? 'bg-blue-50 text-apple-blue border-blue-100' :
                                    user.status === 'Deactivated' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                                        'bg-rose-50 text-apple-rose border-rose-100'
                                    }`}>
                                    {user.status}
                                </span>

                                {/* Hide external link if the account is deactivated (since it doesn't exist anymore) */}
                                {user.status !== 'Deactivated' && (
                                    <a href={`https://instagram.com/${user.status === 'Renamed' ? user.renamedTo : user.username}`}
                                        target="_blank" rel="noreferrer"
                                        className="text-apple-muted hover:text-apple-blue transition-colors p-1">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}