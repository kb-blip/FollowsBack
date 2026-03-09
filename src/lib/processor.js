import JSZip from 'jszip';

// Deep Crawler: Recursively hunts down Instagram's user records
const extractAllStringListData = (obj, results = []) => {
    if (!obj) return results;
    if (Array.isArray(obj)) {
        obj.forEach(item => extractAllStringListData(item, results));
    } else if (typeof obj === 'object') {
        if (obj.string_list_data) {
            results.push(obj);
        } else {
            for (const key in obj) {
                extractAllStringListData(obj[key], results);
            }
        }
    }
    return results;
};

// Extracts the username, falling back to parsing the URL if Instagram removed it
const extractUser = (item) => {
    try {
        const data = item.string_list_data[0];
        let username = data.value;

        if (!username && data.href) {
            // Parses "https://www.instagram.com/_u/username" into "username"
            const parts = data.href.split('?')[0].split('/').filter(Boolean);
            username = parts[parts.length - 1];
        }

        return {
            username: username || "unknown",
            timestamp: data.timestamp || null,
        };
    } catch (e) {
        return { username: "unknown", timestamp: null };
    }
};

const uniqueByUsername = (users) => {
    const map = new Map();
    users.forEach((user) => {
        if (!map.has(user.username)) map.set(user.username, user);
    });
    return Array.from(map.values());
};

export const processZipUpload = async (file) => {
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(file);
    const rawData = { followers: [], following: [], pending: [] };

    let maxDate = 0;

    const parseZipFiles = async (fileMatchLogic, targetArray) => {
        const filePaths = Object.keys(unzipped.files).filter(fileMatchLogic);
        for (const path of filePaths) {
            const entry = unzipped.files[path];
            if (entry.date && entry.date.getTime() > maxDate) {
                maxDate = entry.date.getTime();
            }
            const content = await entry.async('string');
            const records = extractAllStringListData(JSON.parse(content));
            targetArray.push(...records.map(extractUser));
        }
    };

    await parseZipFiles(name => name.includes('/followers_') && name.endsWith('.json'), rawData.followers);
    await parseZipFiles(name => name.endsWith('/following.json') || name === 'following.json', rawData.following);
    await parseZipFiles(name => name.endsWith('/pending_follow_requests.json') || name === 'pending_follow_requests.json', rawData.pending);

    if (rawData.followers.length === 0 && rawData.following.length === 0 && rawData.pending.length === 0) {
        throw new Error("No data found. Ensure you exported 'followers_and_following' from Instagram.");
    }
    return createSnapshot(rawData, maxDate > 0 ? maxDate : null);
};

export const processFolderUpload = async (filesArray) => {
    // Group files by top-level directory payload
    const grouped = {};
    for (const file of filesArray) {
        if (!file.webkitRelativePath) continue;
        const topLevel = file.webkitRelativePath.split('/')[0];
        if (!grouped[topLevel]) grouped[topLevel] = [];
        grouped[topLevel].push(file);
    }

    const readFileAsync = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(JSON.parse(e.target.result));
        reader.onerror = reject;
        reader.readAsText(file);
    });

    const parsedSnapshots = [];

    for (const [folderName, groupFiles] of Object.entries(grouped)) {
        const rawData = { followers: [], following: [], pending: [] };
        let maxDate = 0;
        
        for (const file of groupFiles) {
            if (file.lastModified && file.lastModified > maxDate) {
                maxDate = file.lastModified;
            }
            const name = file.name;
            if (!name.endsWith('.json')) continue;

            if (name.startsWith('followers_')) {
                const records = extractAllStringListData(await readFileAsync(file));
                rawData.followers.push(...records.map(extractUser));
            } else if (name === 'following.json') {
                const records = extractAllStringListData(await readFileAsync(file));
                rawData.following.push(...records.map(extractUser));
            } else if (name === 'pending_follow_requests.json') {
                const records = extractAllStringListData(await readFileAsync(file));
                rawData.pending.push(...records.map(extractUser));
            }
        }
        
        if (rawData.followers.length > 0 || rawData.following.length > 0) {
            parsedSnapshots.push(createSnapshot(rawData, maxDate > 0 ? maxDate : null));
        }
    }

    if (parsedSnapshots.length === 0) {
        throw new Error("No data found. Please check your extracted folder.");
    }
    
    return parsedSnapshots;
};

const createSnapshot = ({ followers, following, pending }, dateHint = null) => {
    // Deduplicate upfront before assembling arrays
    const validFollowers = uniqueByUsername(followers.filter(u => u.username !== 'unknown'));
    const validFollowing = uniqueByUsername(following.filter(u => u.username !== 'unknown'));
    const validPending = uniqueByUsername(pending.filter(u => u.username !== 'unknown'));

    const followerSet = new Set(validFollowers.map(u => u.username));
    const followingSet = new Set(validFollowing.map(u => u.username));

    const nonMutuals = validFollowing.filter(u => !followerSet.has(u.username));
    const fans = validFollowers.filter(u => !followingSet.has(u.username));

    const timestampMs = dateHint || Date.now();

    return {
        id: timestampMs,
        date: new Date(timestampMs).toISOString(),
        stats: {
            totalFollowers: validFollowers.length,
            totalFollowing: validFollowing.length,
            nonMutualCount: nonMutuals.length,
            pendingCount: validPending.length,
        },
        data: { followers: validFollowers, following: validFollowing, nonMutuals, fans, pending: validPending }
    };
};

export const compareSnapshots = (oldSnap, newSnap) => {
    if (!oldSnap || !newSnap) return { lost: [], gained: [] };

    const oldFollowers = oldSnap?.data?.followers || [];
    const newFollowers = newSnap?.data?.followers || [];
    const oldFollowing = oldSnap?.data?.following || [];
    const newFollowing = newSnap?.data?.following || [];

    const newFollowerSet = new Set(newFollowers.map(u => u.username));
    const oldFollowerSet = new Set(oldFollowers.map(u => u.username));
    const newFollowingSet = new Set(newFollowing.map(u => u.username));
    const oldFollowingSet = new Set(oldFollowing.map(u => u.username));

    let rawLost = oldFollowers.filter(u => !newFollowerSet.has(u.username));
    let rawGained = newFollowers.filter(u => !oldFollowerSet.has(u.username));

    // THE RENAMED & DEACTIVATED ACCOUNT ENGINE
    const gainedByTimestamp = new Map();
    rawGained.forEach(u => {
        if (u.timestamp) gainedByTimestamp.set(u.timestamp, u.username);
    });

    const lost = [];
    rawLost.forEach(u => {
        if (u.timestamp && gainedByTimestamp.has(u.timestamp)) {
            // They changed their username
            lost.push({ ...u, renamedTo: gainedByTimestamp.get(u.timestamp), status: 'Renamed', actionDate: newSnap.date });
        } else if (oldFollowingSet.has(u.username) && !newFollowingSet.has(u.username)) {
            // They vanished from your Followers AND your Following simultaneously (Deactivated or Blocked)
            lost.push({ ...u, status: 'Deactivated', actionDate: newSnap.date });
        } else {
            // Standard Unfollow
            lost.push({ ...u, status: 'Unfollowed', actionDate: newSnap.date });
        }
    });

    return { lost, gained: rawGained };
};

export const recalculateTimeline = (snapshots) => {
    // Sort array by date chronologically
    const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Rebuild diffs for each except the first one
    return sorted.map((snap, i) => {
        if (i === 0) {
            snap.diff = { lost: [], gained: [] };
        } else {
            snap.diff = compareSnapshots(sorted[i - 1], snap);
        }
        return snap;
    });
};