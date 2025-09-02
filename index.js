const path = require('path');
const fs = require('fs');
const express = require('express');

const createClient = require('./megalodon-client');
const { loadProfile, saveProfile } = require('./memory-store');
const { stripHtmlTags } = require('./utils');

let stream = null;
let pluginAPI = null;
let client = null;

let pluginPath = '';

module.exports = {
    name: 'mastodon-bridge',
    init(app, _pluginAPI) {
        pluginAPI = _pluginAPI;
        pluginPath = __dirname;

        const configPath = path.join(pluginPath, 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath));

        // Serve Web UI files
        app.use('/plugins/mastodon-bridge/webui', express.static(path.join(pluginPath, 'webui')));

        app.get('/plugins/mastodon-bridge/config', (req, res) => {
            const config = JSON.parse(fs.readFileSync(configPath));
            res.json(config);
        });

        app.post('/plugins/mastodon-bridge/config', express.json(), (req, res) => {
            fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
            res.json({ success: true });
            restartStream();
        });

        // Register UI tab
        pluginAPI.addSettingTab({
            id: 'mastodon-bridge-settings',
            name: 'Mastodon Bridge',
            icon: 'fab fa-mastodon',
            html: fs.readFileSync(path.join(pluginPath, 'webui', 'webui.html'), 'utf8'),
            scripts: [path.join(pluginPath, 'webui', 'webui.js')],
            stylesheets: [path.join(pluginPath, 'webui', 'webui.css')]
        });

        startStream();
    }
};

function startStream() {
    if (stream) stream.stop();
    client = createClient();

    const config = JSON.parse(fs.readFileSync(path.join(pluginPath, 'config.json')));
    const botHandle = config.bot_handle.replace(/^@/, '');

    stream = client.streamUser();

    stream.on('update', async status => {
        const account = status.data.account.acct;

        if (!status.data.mentions.some(m => m.acct === botHandle)) return;

        const text = stripHtmlTags(status.data.content);
        const userId = account;
        const profile = loadProfile(userId);

        profile.thread.push(`User: ${text}`);

        const response = await pluginAPI.chat.sendToCharacter({
            user: 'mastodon:' + userId,
            message: text,
            context: profile.thread.join('\n'),
            character: config.character_file
        });

        profile.thread.push(`Bot: ${response.reply}`);
        profile.last_reply_id = status.data.id;

        saveProfile(userId, profile);

        await client.postStatus(`@${userId} ${response.reply}`, {
            in_reply_to_id: status.data.id,
            visibility: 'public'
        });
    });

    stream.on('error', err => console.error('Mastodon stream error:', err));
}

function restartStream() {
    if (stream) stream.stop();
    startStream();
}
