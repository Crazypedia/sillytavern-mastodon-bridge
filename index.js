const path = require('path');
const fs = require('fs');
const express = require('express');

const createClient = require('./mastodon-client');
const { loadProfile, saveProfile } = require('./memory-store');
const { stripHtmlTags } = require('./utils');

let stream = null;
let pluginAPI = null;
let client = null;

const CONFIG_PATH = path.join(__dirname, 'config.json');

module.exports = {
    name: 'sillytavern-mastodon-bot',
    init(app, _pluginAPI) {
        pluginAPI = _pluginAPI;
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH));

        // Serve Web UI
        app.use('/plugins/sillytavern-mastodon-bot/webui', express.static(path.join(__dirname, 'webui')));

        app.get('/plugins/sillytavern-mastodon-bot/config', (req, res) => {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
            res.json(config);
        });

        app.post('/plugins/sillytavern-mastodon-bot/config', express.json(), (req, res) => {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(req.body, null, 2));
            res.json({ success: true });
            restartStream();
        });

        startStream();
    }
};

function startStream() {
    if (stream) stream.stop();
    client = createClient();

    stream = client.streamUser();

    stream.on('update', async status => {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
        const botHandle = config.bot_handle.replace(/^@/, '');
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