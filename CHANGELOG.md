# Changelog

## Version 0.7.0
- Lookups are now done via user IDs instead of names. This will account for users that have changed their names.

## Version 0.6.0
- Added support for logging resub messages. The format is currently:
    - `Resub (X months) - Message: MSG`
    - Where `X` is the number of months and `MSG` is the message the user sent with their resub.
    - If the user didn't specify any message, `<No Message>` will be used as a placeholder.

## Version 0.5.2
- Fix bug/oversight where cheering/bit messages were not being logged.

## Version 0.5.1
- Fix bug where `/me` (aka `ACTION`) messages were not being logged.

## Version 0.5.0
- Adds support for specifying an "offset" in the web interface.
- API for messages now allows query parameters instead of headers.
    - Headers are still allowed to keep it backwards-compatible.
- API now allows messages to be returned in "plaintext", by specifying `plain` as a query parameter or header.

## Version 0.4.2
- Fix error when ignore list for channel did not exist.
- Fix minor error in home view for handling errors.
- Add a `count` field in the `/api/messages` route.

## Version 0.4.1
- Commands `ignore` and `unignore` will now display the correct username that was ignored, instead of the username of the admin that did the command.
    - This is just a minor fix, as the name saved to the ignore list was correct, but the message sent back to the admin was incorrect.

## Version 0.4.0
- Add a per-channel ignore list.
- Added `ignore` and `unignore` commands for use with the ignore list.

## Version 0.3.1
- Adds a 'Refresh' button to the homepage, so that you can retrieve messages without changing from one channel to another, then back.
- Error messages now properly work.
- Added a proper `LICENSE` file to the repository.

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
