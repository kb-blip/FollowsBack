import JSZip from 'jszip';

const extractUser = (item) => {
    try {
        if (item.string_list_data && item.string_list_data[0]) {
            return {
                username: item.string_list_data[0].value || "unknown",
                timestamp: item.string_list_data[0].timestamp || null,
            };
        }
        return { username: item.value || item.username || "unknown", timestamp: item.timestamp || null };
    } catch (e) {
        return { username: "unknown" };
    }
};

const normalize = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        let largestArray = [];
        for (const key in data) {
            if (Array.isArray(data[key]) && data[key].length > largestArray.length) {
                largestArray = data[key];
            }
        }
        return largestArray;
    }
    return [];
};

export const processZipUpload = async (file) => {
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(file);
    const rawData = { followers: [], following: [], pending: [] };

    const parseZipFiles = async (exactFilename, targetArray) => {
        const filePaths = Object.keys(unzipped.files).filter(name =>
            name.endsWith(`/${exactFilename}`) || name === exactFilename
        );
        for (const path of filePaths) {
            const content = await unzipped.files[path].async('string');
            targetArray.push(...normalize(JSON.parse(content)).map(extractUser));
        }
    };

    await parseZipFiles('followers_1.json', rawData.followers);
    await parseZipFiles('following.json', rawData.following);
    await parseZipFiles('pending_follow_requests.json', rawData.pending);

    // Fail-safe: No longer crashes if files are missing due to a partial date-range export
    if (rawData.followers.length === 0 && rawData.following.length === 0 && rawData.pending.length === 0) {
        throw new Error("No data found. Ensure you exported 'followers_and_following' from Instagram.");
    }
    return createSnapshot(rawData);
};

export const processFolderUpload = async (filesArray) => {
    const rawData = { followers: [], following: [], pending: [] };

    const readFileAsync = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(JSON.parse(e.target.result));
        reader.onerror = reject;
        reader.readAsText(file);
    });

    for (const file of filesArray) {
        const name = file.name;
        if (!name.endsWith('.json')) continue;
        if (name === 'followers_1.json') rawData.followers.push(...normalize(await readFileAsync(file)).map(extractUser));
        else if (name === 'following.json') rawData.following.push(...normalize(await readFileAsync(file)).map(extractUser));
        else if (name === 'pending_follow_requests.json') rawData.pending.push(...normalize(await readFileAsync(file)).map(extractUser));
    }

    if (rawData.followers.length === 0 && rawData.following.length === 0 && rawData.pending.length === 0) {
        throw new Error("No data found. Please check your extracted folder.");
    }
    return createSnapshot(rawData);
};

const createSnapshot = ({ followers, following, pending }) => {
    const validFollowers = followers.filter(u => u.username !== 'unknown');
    const validFollowing = following.filter(u => u.username !== 'unknown');
    const validPending = pending.filter(u => u.username !== 'unknown');

    const followerSet = new Set(validFollowers.map(u => u.username));
    const followingSet = new Set(validFollowing.map(u => u.username));

    const nonMutuals = validFollowing.filter(u => !followerSet.has(u.username));
    const fans = validFollowers.filter(u => !followingSet.has(u.username));
    const mutuals = validFollowing.filter(u => followerSet.has(u.username));

    return {
        id: Date.now(),
        date: new Date().toISOString(),
        stats: {
            totalFollowers: validFollowers.length,
            totalFollowing: validFollowing.length,
            mutualCount: mutuals.length,
            nonMutualCount: nonMutuals.length,
            pendingCount: validPending.length,
        },
        data: { followers: validFollowers, following: validFollowing, mutuals, nonMutuals, fans, pending: validPending }
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