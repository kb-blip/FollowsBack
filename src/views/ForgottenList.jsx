import React from 'react';
import UserRow from '../components/UserRow';

export default function ForgottenList({ snapshots }) {
    if (!snapshots || snapshots.length === 0) {
        return <div className="p-10 text-center text-apple-muted mt-20">No data available. Please add data first.</div>;
    }

    const latestSnapshot = snapshots[snapshots.length - 1] || {};
    const pending = Array.isArray(latestSnapshot?.data?.pending) ? latestSnapshot.data.pending : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-apple-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Forgotten List</h2>
                <p className="text-apple-muted text-sm mt-1">
                    You have <strong className="text-amber-600">{pending.length}</strong> pending outgoing follow requests.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden divide-y divide-apple-border">
                {pending.length === 0 ? (
                    <div className="p-12 text-center text-apple-muted text-sm">No pending requests! You're all caught up.</div>
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