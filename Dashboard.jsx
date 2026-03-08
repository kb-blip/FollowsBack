import React, { useMemo } from 'react';
import StatsCard from './StatsCard';
import UserRow from './UserRow';
import { getMutualPercentage, compareSnapshots } from './processor';
import databaseSeed from './src/data/database.json';

export default function Dashboard({ snapshots }) {
    const sourceSnapshots = Array.isArray(snapshots) && snapshots.length > 0 ? snapshots : databaseSeed;
    const currentSnapshot = sourceSnapshots[sourceSnapshots.length - 1];
    const previousSnapshot = sourceSnapshots[sourceSnapshots.length - 2];

    const comparison = useMemo(() => {
        return compareSnapshots(previousSnapshot, currentSnapshot);
    }, [currentSnapshot, previousSnapshot]);

    if (!currentSnapshot) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-xl font-bold text-zinc-200">No Data Available</h2>
                <p className="text-zinc-500 mt-2">Go to Ingestion to upload your first snapshot.</p>
            </div>
        );
    }

    const stats = currentSnapshot.stats || {
        totalFollowers: 0,
        totalFollowing: 0,
        mutualCount: 0,
        nonMutualCount: 0,
    };
    const data = currentSnapshot.data || {};
    const nonMutuals = Array.isArray(data.nonMutuals) ? data.nonMutuals : [];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-100">The Pulse</h2>
                    <p className="text-zinc-500 text-sm mt-1">Snapshot from {currentSnapshot.date ? new Date(currentSnapshot.date).toLocaleDateString() : 'Unknown date'}</p>
                </div>
                {comparison.lost.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full text-rose-500 text-sm font-medium">
                        -{comparison.lost.length} Followers since last sync
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Followers"
                    value={stats.totalFollowers}
                    trend={comparison.gained.length - comparison.lost.length}
                    color="zinc"
                />
                <StatsCard
                    title="Following"
                    value={stats.totalFollowing}
                    color="zinc"
                />
                <StatsCard
                    title="Mutual Ratio"
                    value={`${getMutualPercentage(stats)}%`}
                    subtext="Accounts that follow you back"
                    color="violet"
                />
                <StatsCard
                    title="Non-Mutuals"
                    value={stats.nonMutualCount}
                    subtext="Following who don't follow back"
                    color="rose"
                />
            </div>

            {/* Recent Non-Mutuals Preview */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
                    <h3 className="font-medium text-zinc-200">Top Non-Mutuals</h3>
                    <button className="text-xs text-rose-500 hover:text-rose-400 font-medium">View All</button>
                </div>
                <div className="divide-y divide-zinc-900">
                    {nonMutuals.slice(0, 5).map(user => (
                        <UserRow key={user.username} username={user.username} status="Non-Mutual" timestamp={user.timestamp} />
                    ))}
                </div>
            </div>
        </div>
    );
}