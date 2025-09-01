document.addEventListener('DOMContentLoaded', async () => {
    const config = await fetch('/plugins/sillytavern-mastodon-bot/config').then(res => res.json());
    document.getElementById('mastodon-url').value = config.mastodon_url;
    document.getElementById('access-token').value = config.access_token;
    document.getElementById('bot-handle').value = config.bot_handle;
    document.getElementById('character-file').value = config.character_file;

    document.getElementById('save-config').addEventListener('click', async () => {
        const newConfig = {
            mastodon_url: document.getElementById('mastodon-url').value,
            access_token: document.getElementById('access-token').value,
            bot_handle: document.getElementById('bot-handle').value,
            character_file: document.getElementById('character-file').value
        };

        await fetch('/plugins/sillytavern-mastodon-bot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });

        alert('Configuration saved!');
    });
});