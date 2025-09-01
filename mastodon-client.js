const Megalodon = require('megalodon');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    return {
        url: config.mastodon_url,
        token: config.access_token
    };
}

function createClient() {
    const { url, token } = loadConfig();
    return Megalodon.default('mastodon', url, token);
}

module.exports = createClient;