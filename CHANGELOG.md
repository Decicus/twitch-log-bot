# Changelog

## Version 0.8.2
- Fallback to searching by username instead of user ID when unable to retrieve the ID.
    - Happens in instances where the Twitch API request fails, or the user doesn't "exist" (suspended, deactivated etc).
- Fix "bug" (more of an oversight) where `twitchnotify` messages were being logged as normal messages. These are now ignored.
    - This was introduced in [Version 0.8.0](#version-080) where tmi.js was updated to 1.2.1 and subscription messages were changed.
- Fix `index.sample.yaml` that should have been updated in [Version 0.7.0](#version-080) (I'm sorry).

## Version 0.8.1
- Fix bug where the resub "plan" wasn't logging correctly due to referring to the wrong parameter on the event.

## Version 0.8.0
- Twitch has [done some changes to the subscription system](https://discuss.dev.twitch.tv/t/subscriptions-beta-changes/10023), which allows new subscriptions to share a message, just like resubs.
- Fix bug where quitting the bot wouldn't properly exit the process.

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
