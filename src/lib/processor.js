import JSZip from 'jszip';

// Extractor for Instagram's nested JSON structure
const extractUser = (item) => {
    try {
        if (item.string_list_data && item.string_list_data[0]) {
            return {
                username: item.string_list_data[0].value || "unknown",
                timestamp: item.string_list_data[0].timestamp || null,
            };
        }
        return {
            username: item.value || item.username || "unknown",
            timestamp: item.timestamp || null
        };
    } catch (e) {
        return { username: "unknown" };
    }
};

// AGGRESSIVE NORMALIZER: Hunts down the actual array of users, 
// ignoring any weird metadata Instagram throws into the file.
const normalize = (data) => {
    if (Array.isArray(data)) return data;

    if (data && typeof data === 'object') {
        let largestArray = [];
        // Loop through every key in the object to find the biggest array
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
        // Use exact matching to prevent reading the wrong files
        const filePaths = Object.keys(unzipped.files).filter(name =>
            name.endsWith(`/${exactFilename}`) || name === exactFilename
        );

        for (const path of filePaths) {
            const content = await unzipped.files[path].async('string');
            const parsed = JSON.parse(content);
            targetArray.push(...normalize(parsed).map(extractUser));
        }
    };

    await parseZipFiles('followers_1.json', rawData.followers);
    await parseZipFiles('following.json', rawData.following);
    await parseZipFiles('pending_follow_requests.json', rawData.pending);

    if (rawData.followers.length === 0 && rawData.following.length === 0) {
        throw new Error("Could not find data in this ZIP. Did you export 'followers_and_following'?");
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

        // Exact name checks
        if (name === 'followers_1.json') {
            rawData.followers.push(...normalize(await readFileAsync(file)).map(extractUser));
        } else if (name === 'following.json') {
            rawData.following.push(...normalize(await readFileAsync(file)).map(extractUser));
        } else if (name === 'pending_follow_requests.json') {
            rawData.pending.push(...normalize(await readFileAsync(file)).map(extractUser));
        }
    }

    if (rawData.followers.length === 0 && rawData.following.length === 0) {
        throw new Error("Could not find Instagram connection files in this folder.");
    }
    return createSnapshot(rawData);
};

const createSnapshot = ({ followers, following, pending }) => {
    // Filter out 'unknowns' before executing the set math
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
        data: {
            followers: validFollowers,
            following: validFollowing,
            mutuals,
            nonMutuals,
            fans,
            pending: validPending
        }
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