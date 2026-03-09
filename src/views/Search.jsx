import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import UserRow from '../components/UserRow';

export default function Search({ snapshots }) {
    const [query, setQuery] = useState('');

    if (!snapshots || snapshots.length === 0) {
        return <div className="p-10 text-center text-apple-muted mt-20">No data available. Please add data first.</div>;
    }

    const currentData = snapshots[snapshots.length - 1]?.data || {};
    const followers = Array.isArray(currentData.followers) ? currentData.followers : [];
    const following = Array.isArray(currentData.following) ? currentData.following : [];
    const nonMutuals = Array.isArray(currentData.nonMutuals) ? currentData.nonMutuals : [];
    const fans = Array.isArray(currentData.fans) ? currentData.fans : [];
    
    // Aggregating lost people from timeline diffs
    const lostPeopleMap = new Map();
    snapshots.forEach(snap => {
        if (snap.diff && snap.diff.lost) {
            snap.diff.lost.forEach(u => {
                if (!lostPeopleMap.has(u.username)) lostPeopleMap.set(u.username, u);
            });
        }
    });

    const lostPeople = Array.from(lostPeopleMap.values());

    const isFollowing = (username) => following.some(u => u.username === username);
    const isFollower = (username) => followers.some(u => u.username === username);

    const getStatus = (username) => {
        if (lostPeopleMap.has(username) && !isFollower(username)) {
             return lostPeopleMap.get(username).status; // "Unfollowed", "Deactivated", "Renamed"
        }
        if (isFollowing(username) && isFollower(username)) return 'Mutual';
        if (isFollowing(username)) return 'Non-Mutual';
        if (isFollower(username)) return 'Fan';
        return 'Unknown';
    };

    const allUsersMap = new Map();
    [...followers, ...following, ...nonMutuals, ...fans, ...lostPeople].forEach(u => {
        if (!allUsersMap.has(u.username)) allUsersMap.set(u.username, { ...u, currentStatus: getStatus(u.username) });
    });

    const allUsers = Array.from(allUsersMap.values());

    const filtered = query.trim() === '' ? [] : allUsers.filter(u => u.username.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-apple-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Global Search</h2>
                <p className="text-apple-muted text-sm mt-1">Search the entire history of your connections and timeline drops.</p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="text-apple-muted" size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for an @username..."
                    className="w-full pl-11 pr-4 py-4 bg-white border border-apple-border rounded-2xl shadow-sm text-apple-text placeholder:text-apple-muted focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
                />
            </div>

            {query.trim() !== '' && (
                <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden divide-y divide-apple-border">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center text-apple-muted text-sm">No accounts found matching "{query}"</div>
                    ) : (
                        filtered.map(user => (
                            <UserRow
                                key={user.username}
                                username={user.username}
                                status={user.currentStatus}
                                timestamp={user.timestamp}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
