# Commands
The bot supports commands that are fully controlled through whispers. Commands are, as of 0.1.0 and onwards, only available for admins (specified in the `config.js` file).

All commands need to be prefixed with what is specified in the `config.js` file. By default it's `!`.

Parameters are specified as `<required>`, `[optional]` and `(none)`.

| Command | Parameters | Description |
| :---: | :---: | :---: |
| `join`       | `<channel>` | Joins the specified channel and adds it to the list of channels |
| `ignore`     | `<channel>` `<username>` | Adds the username to the ignore list for the specified channel. |
| `leave`      | `<channel>` | Leaves the specified channel and removes it from the list of channels |
| `part`       | `<channel>` | Alias of `leave` |
| `ping`       | `(none)`    | Replies with `PONG` (for testing purposes) |
| `unignore`   | `<channel>` `<username>` | Removes the username from the ignore list for the specified channel. |
| `version`    | `(none)`    | Replies with the app version. |
