import React from 'react';
import UserRow from '../UserRow';
import { compareSnapshots } from '../processor';

export default function Timeline({ snapshots }) {
    if (!snapshots || snapshots.length < 2) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center border border-dashed border-zinc-800/60 rounded-xl mt-10">
                <h3 className="text-zinc-300 font-medium mb-2">Not enough data</h3>
                <p className="text-zinc-500 text-sm">The timeline requires at least 2 uploads to compare who unfollowed you. Upload another snapshot later!</p>
            </div>
        );
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    const { lost } = compareSnapshots(previous, current);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-zinc-800/60 pb-4">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Unfollower Timeline</h2>
                <p className="text-zinc-500 text-sm mt-1">Accounts that stopped following you between your last two uploads.</p>
            </div>

            {lost.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm border border-zinc-800/50 rounded-xl">No unfollowers detected since last sync! 🎉</div>
            ) : (
                <div className="divide-y divide-zinc-800/40 border border-zinc-800/40 rounded-xl overflow-hidden bg-zinc-900/10">
                    {lost.map(user => (
                        <UserRow key={user.username} username={user.username} status="Unfollowed" timestamp={user.timestamp} />
                    ))}
                </div>
            )}
        </div>
    );
}