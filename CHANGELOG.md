# Changelog

## Version 0.3.0
- Allows searching for just username.
- Re-organized the table for messages in a little bit more logical structure.

## Version 0.2.1
- Channels are now sorted alphabetically in the web interface's list.

## Version 0.2.0
- Created a frontend that integrates with `/api/*` routes.
- Add a property in `config.settings` that allows users to enable/disable the auto-connecting to Twitch channels (`true/false`).
    - As of right now, the bot does a strict check if that is set to `false`, so that version 0.1.0 users don't break instantly by updating the bot, but not the config-file.
- Move API endpoints to `/api/*`, and serve frontend via `/`.
- Rename the `channels.default.json` sample-file to `channels.sample.json` to stay consistent.

## Version 0.1.0
- First release.
- Has support for admin commands: `join`, `leave/part`, `ping`
