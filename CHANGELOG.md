# Changelog

## Version 0.10.1

- **Subscriptions**: Resubs with no message will no longer include ` - Message: <No Message>` at the end and simply omit it.
- **Subscriptions**: Months should be reported correctly when resubscribing.
    - Resub messages only care about total months subscribed, not "streak months".
- **Subscriptions**: Tiers will now display correctly as `Tier 1/Tier 2/Tier 3` instead of `1000/2000/3000`
    - This only applies to new messages. Older messages already logged will still include `1000/2000/3000`.
    - Twitch Prime subscriptions will still show as `Prime`, unless Twitch changes that in the future.
- **Timeouts / Bans**: Reasons will be omitted from new messages, as timeout/ban reasons are no longer sent via chat.
    - This does not affect timeout lengths, they will still be included as-is.
    - Future bans will now only show up as `* BAN`.
- **Web UI**: The `limit` and `offset` fields will be disabled while retrieving messages, preventing input mid-retrieval.

## Version 0.10.0

- Added `userAgentBlacklist` option in the configuration file.
    - A simple `.includes()` match on the user agent, which returns a `403 Forbidden`.
- Updated npm dependencies.

## Version 0.9.1

- Fix error logs being spammed with exceptions whenever a username that does not exist (banned/deactivated) was looked up.
- Fix messages over 1500 bytes not being logged.
- Updated dependencies.

## Version 0.9.0

- Added support for bans and timeouts, with (timeout) lengths and timeout/ban reason.
- Updated a few project dependencies and the code using said dependencies.

## Version 0.8.3

- Add username to table cell where display name is in certain cases.
    - Specifically where the lowercased version of the display name is different from the username (CJK names).
- Allow people to search for user IDs directly, instead of usernames.
- Fix an issue where channel data (such as IDs) wouldn't be cached when autoconnect wasn't enabled.
    - This would cause errors when trying to fetch messages from a specific channel.

## Version 0.8.2

- Fallback to searching by username instead of user ID when unable to retrieve the ID.
    - Happens in instances where the Twitch API request fails, or the user doesn't "exist" (suspended, deactivated etc).
- Fix "bug" (more of an oversight) where `twitchnotify` messages were being logged as normal messages. These are now ignored.
    - This was introduced in [Version 0.8.0](#version-080) where tmi.js was updated to 1.2.1 and subscription messages were changed.
- Fix `index.sample.yaml` that should have been updated in [Version 0.7.0](#version-070) (I'm sorry).

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
