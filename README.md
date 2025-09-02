# Mastodon Bridge

This SillyTavern server plugin connects a bot account on the Fediverse using the [Megalodon](https://github.com/h3poteto/megalodon) library. Chat replies from SillyTavern are posted back to mentions on supported services like Mastodon, Pleroma and Misskey.

## Configuration

1. Install dependencies with `npm install`.
2. Configure the plugin either by editing `config.json` or using the plugin's Settings tab in SillyTavern.
3. Provide your Fediverse instance URL, service type, access token, bot handle, and the character file SillyTavern should use.

## Usage

Enable the plugin from SillyTavern's server plugin menu. Mention the bot account on your Fediverse server to have SillyTavern generate a response and post it as a reply.
