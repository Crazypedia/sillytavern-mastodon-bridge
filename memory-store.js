const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, 'memory', 'profiles');

function ensureProfileDir() {
    if (!fs.existsSync(PROFILE_DIR)) {
        fs.mkdirSync(PROFILE_DIR, { recursive: true });
    }
}

function getProfilePath(userId) {
    return path.join(PROFILE_DIR, `${userId}.json`);
}

function loadProfile(userId) {
    ensureProfileDir();
    const filePath = getProfilePath(userId);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return { thread: [], last_reply_id: null };
}

function saveProfile(userId, data) {
    ensureProfileDir();
    const filePath = getProfilePath(userId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
    loadProfile,
    saveProfile
};