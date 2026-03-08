import React from 'react';
import UserRow from '../components/UserRow';

export default function ForgottenList({ snapshots }) {
    if (!snapshots || snapshots.length === 0) return <div className="text-zinc-500 text-center mt-20">No data available.</div>;

    const latestSnapshot = snapshots[snapshots.length - 1] || {};
    const pending = Array.isArray(latestSnapshot?.data?.pending) ? latestSnapshot.data.pending : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">The Forgotten List</h2>
                <p className="text-zinc-500 mt-1">
                    You have <span className="text-rose-400 font-bold">{pending.length}</span> pending outgoing follow requests.
                </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-900">
                {pending.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No pending requests! You're all caught up.</div>
                ) : (
                    pending.map(user => (
                        <UserRow
                            key={user.username}
                            username={user.username}
                            status="Pending"
                            timestamp={user.timestamp}
                        />
                    ))
                )}
            </div>
        </div>
    );
}