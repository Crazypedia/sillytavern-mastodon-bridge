const Megalodon = require('megalodon');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    return {
        url: config.instance_url,
        token: config.access_token,
        service: config.service || 'mastodon'
    };
}

function createClient() {
    const { url, token, service } = loadConfig();
    return Megalodon.default(service, url, token);
}

module.exports = createClient;
