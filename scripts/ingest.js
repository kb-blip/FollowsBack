const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DATABASE_FILE = path.join(ROOT_DIR, 'src', 'data', 'database.json');

const inflight = new Set();

function extractUser(item) {
    if (!item || typeof item !== 'object') return { username: 'unknown' };
    const nested = item.string_list_data && item.string_list_data[0];
    if (nested) {
        return { username: nested.value || 'unknown', timestamp: nested.timestamp, href: nested.href };
    }
    return { username: item.value || item.username || 'unknown', timestamp: item.timestamp, href: item.href };
}

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    const values = Object.values(payload);
    const firstArray = values.find(Array.isArray);
    return Array.isArray(firstArray) ? firstArray : [];
}

async function readJsonSafe(filePath) {
    if (!(await fs.pathExists(filePath))) return [];
    const raw = await fs.readJson(filePath);
    return normalizeArray(raw).map(extractUser).filter((u) => u.username && u.username !== 'unknown');
}

function uniqueByUsername(users) {
    const map = new Map();
    users.forEach((user) => {
        if (!map.has(user.username)) map.set(user.username, user);
    });
    return Array.from(map.values());
}

function buildSnapshot({ followers, following, pending, previousSnapshot }) {
    const followerSet = new Set(followers.map((u) => u.username));
    const followingSet = new Set(following.map((u) => u.username));

    const nonMutuals = following.filter((u) => !followerSet.has(u.username));
    const fans = followers.filter((u) => !followingSet.has(u.username));
    const mutuals = following.filter((u) => followerSet.has(u.username));

    const oldFollowers = previousSnapshot?.data?.followers || [];
    const oldFollowerSet = new Set(oldFollowers.map((u) => u.username));

    const unfollowers = oldFollowers.filter((u) => !followerSet.has(u.username));
    const newFollowers = followers.filter((u) => !oldFollowerSet.has(u.username));

    const now = new Date();

    return {
        id: now.getTime(),
        date: now.toISOString(),
        stats: {
            totalFollowers: followers.length,
            totalFollowing: following.length,
            mutualCount: mutuals.length,
            nonMutualCount: nonMutuals.length,
            pendingCount: pending.length,
            unfollowersCount: unfollowers.length,
            newFollowersCount: newFollowers.length,
        },
        diff: { unfollowers, newFollowers },
        data: { followers, following, nonMutuals, fans, pending },
    };
}

async function loadDatabase() {
    await fs.ensureDir(path.dirname(DATABASE_FILE));
    if (!(await fs.pathExists(DATABASE_FILE))) {
        await fs.writeJson(DATABASE_FILE, [], { spaces: 2 });
        return [];
    }
    return await fs.readJson(DATABASE_FILE);
}

// Recursively find the folder containing Instagram connection data
async function findTargetFolder(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            if (item.name === 'followers_and_following') {
                return path.join(dir, item.name);
            }
            const found = await findTargetFolder(path.join(dir, item.name));
            if (found) return found;
        }
    }
    return null;
}

async function processItem(itemPath) {
    if (inflight.has(itemPath)) return;
    inflight.add(itemPath);

    let targetRoot = itemPath;
    let isZip = false;

    try {
        // Handle ZIP extraction
        if (itemPath.endsWith('.zip')) {
            isZip = true;
            console.log(`[ingest] Detected ZIP. Extracting ${path.basename(itemPath)}...`);
            const zip = new AdmZip(itemPath);
            targetRoot = path.join(DATA_DIR, `extracted_${Date.now()}`);
            zip.extractAllTo(targetRoot, true);
        }

        // Find where the JSONs actually live
        const dataFolder = await findTargetFolder(targetRoot);

        if (!dataFolder) {
            if (isZip) await fs.remove(targetRoot); // clean up temp folder
            return; // Not an Instagram export
        }

        const followersPath = path.join(dataFolder, 'followers_1.json');
        const followingPath = path.join(dataFolder, 'following.json');
        const pendingPath = path.join(dataFolder, 'pending_follow_requests.json');

        if (!(await fs.pathExists(followersPath)) || !(await fs.pathExists(followingPath))) {
            return;
        }

        console.log(`[ingest] Processing data from ${path.basename(itemPath)}...`);

        const [followersRaw, followingRaw, pendingRaw] = await Promise.all([
            readJsonSafe(followersPath),
            readJsonSafe(followingPath),
            readJsonSafe(pendingPath),
        ]);

        const database = await loadDatabase();
        const latestSnapshot = database.length > 0 ? database[database.length - 1] : null;

        const snapshot = buildSnapshot({
            followers: uniqueByUsername(followersRaw),
            following: uniqueByUsername(followingRaw),
            pending: uniqueByUsername(pendingRaw),
            previousSnapshot: latestSnapshot,
        });

        database.push(snapshot);
        await fs.writeJson(DATABASE_FILE, database, { spaces: 2 });

        // Clean up the dropped file/folder entirely
        await fs.remove(itemPath);
        if (isZip) await fs.remove(targetRoot);

        console.log(`[ingest] Success! Snapshot saved to database. Raw files deleted.`);
    } catch (error) {
        console.error(`[ingest] Failed to process ${itemPath}:`, error);
    } finally {
        inflight.delete(itemPath);
    }
}

async function bootstrap() {
    await fs.ensureDir(DATA_DIR);
    await loadDatabase();

    console.log(`[ingest] 🚀 Watcher running!`);
    console.log(`[ingest] Drop a .zip or folder into /data to process.`);

    const watcher = chokidar.watch(DATA_DIR, {
        persistent: true,
        ignoreInitial: false,
        depth: 0, // Only watch the root of /data so we don't double-trigger on unzips
        awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
    });

    watcher.on('add', (filePath) => {
        if (filePath.endsWith('.zip')) processItem(filePath);
    });

    watcher.on('addDir', (dirPath) => {
        if (dirPath !== DATA_DIR) processItem(dirPath);
    });
}

bootstrap().catch((error) => console.error(error));