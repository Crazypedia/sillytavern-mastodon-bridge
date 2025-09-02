document.addEventListener('DOMContentLoaded', async () => {
    const config = await fetch('/plugins/mastodon-bridge/config').then(res => res.json());
    document.getElementById('instance-url').value = config.instance_url;
    document.getElementById('service-type').value = config.service || 'mastodon';
    document.getElementById('access-token').value = config.access_token;
    document.getElementById('bot-handle').value = config.bot_handle;
    document.getElementById('character-file').value = config.character_file;

    document.getElementById('save-config').addEventListener('click', async () => {
        const newConfig = {
            instance_url: document.getElementById('instance-url').value,
            service: document.getElementById('service-type').value,
            access_token: document.getElementById('access-token').value,
            bot_handle: document.getElementById('bot-handle').value,
            character_file: document.getElementById('character-file').value
        };

        await fetch('/plugins/mastodon-bridge/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });

        alert('Configuration saved!');
    });
});
