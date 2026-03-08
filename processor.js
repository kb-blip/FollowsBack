import JSZip from 'jszip';

const extractUser = (item) => {
    try {
        if (item.string_list_data && item.string_list_data[0]) {
            return {
                username: item.string_list_data[0].value,
                timestamp: item.string_list_data[0].timestamp,
                href: item.string_list_data[0].href,
            };
        }
        return { username: item.value || item.username || "unknown" };
    } catch (e) {
        return { username: "unknown" };
    }
};

export const processZipUpload = async (file) => {
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(file);

    const rawData = {
        followers: [],
        following: [],
        pending: []
    };

    // Helper to find and parse JSON files buried anywhere inside the zip
    const parseZipFiles = async (filenameSubstring, targetArray) => {
        const filePaths = Object.keys(unzipped.files).filter(name =>
            name.includes(filenameSubstring) && name.endsWith('.json')
        );

        for (const path of filePaths) {
            const content = await unzipped.files[path].async('string');
            const parsed = JSON.parse(content);

            const normalize = (data) => {
                if (Array.isArray(data)) return data;
                const keys = Object.keys(data);
                if (keys.length === 1 && Array.isArray(data[keys[0]])) return data[keys[0]];
                return [];
            };

            targetArray.push(...normalize(parsed).map(extractUser));
        }
    };

    // Extract exactly what we need
    await parseZipFiles('followers_1.json', rawData.followers);
    await parseZipFiles('following.json', rawData.following);
    await parseZipFiles('pending_follow_requests.json', rawData.pending);

    if (rawData.followers.length === 0 && rawData.following.length === 0) {
        throw new Error("Could not find Instagram connection files in this ZIP.");
    }

    return createSnapshot(rawData);
};

const createSnapshot = ({ followers, following, pending }) => {
    const followerSet = new Set(followers.map(u => u.username));
    const followingSet = new Set(following.map(u => u.username));

    const nonMutuals = following.filter(u => !followerSet.has(u.username));
    const fans = followers.filter(u => !followingSet.has(u.username));
    const mutuals = following.filter(u => followerSet.has(u.username));

    return {
        id: Date.now(),
        date: new Date().toISOString(),
        stats: {
            totalFollowers: followers.length,
            totalFollowing: following.length,
            mutualCount: mutuals.length,
            nonMutualCount: nonMutuals.length,
            pendingCount: pending.length,
        },
        data: { followers, following, nonMutuals, fans, pending }
    };
};

export const compareSnapshots = (oldSnap, newSnap) => {
    if (!oldSnap || !newSnap) return { lost: [], gained: [], churnRate: 0 };

    const newFollowerSet = new Set(newSnap.data.followers.map(u => u.username));
    const oldFollowerSet = new Set(oldSnap.data.followers.map(u => u.username));

    const lostFollowers = oldSnap.data.followers.filter(u => !newFollowerSet.has(u.username));
    const newFollowers = newSnap.data.followers.filter(u => !oldFollowerSet.has(u.username));

    return { lost: lostFollowers, gained: newFollowers };
};

export const getMutualPercentage = (stats) => {
    if (!stats || stats.totalFollowing === 0) return 0;
    return ((stats.mutualCount / stats.totalFollowing) * 100).toFixed(1);
};