import React from 'react';
import UserRow from '../components/UserRow';
import { compareSnapshots } from '../lib/processor';

export default function Timeline({ snapshots }) {
    if (!snapshots || snapshots.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-apple-muted mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <h2 className="text-2xl font-semibold text-apple-text">Not Enough Data</h2>
                <p className="text-apple-muted mt-2 max-w-sm">The timeline requires at least 2 uploads to compare your history. Upload another snapshot in the future to see who unfollowed you!</p>
            </div>
        );
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    const { lost } = compareSnapshots(previous, current);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-apple-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Unfollower Timeline</h2>
                <p className="text-apple-muted text-sm mt-1">Accounts that stopped following you between your last two uploads.</p>
            </div>

            {lost.length === 0 ? (
                <div className="p-12 text-center text-apple-muted text-sm bg-white border border-apple-border rounded-2xl shadow-sm">
                    No unfollowers detected since your last sync. Great job! 🎉
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden divide-y divide-apple-border">
                    {lost.map(user => (
                        <UserRow key={user.username} username={user.username} status="Unfollowed" timestamp={user.timestamp} />
                    ))}
                </div>
            )}
        </div>
    );
}