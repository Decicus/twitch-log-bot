# Twitch Log Bot
Twitch Log Bot is a bot that will join Twitch channels and store chat messages using Google Cloud Datastore.

The web interface is just a basic interface to allow you to see past messages in a channel to see their chat history.  
It is designed to be simple and only do lookups per-channel (and optionally: per-user).  
If you want something that has more features, take a look at [CBenni's Logviewer](https://github.com/CBenni/logviewer) which is also hosted at [cbenni.com](https://cbenni.com/).

## Setup
- Setup [Google Cloud Datastore](https://console.cloud.google.com/datastore/).
- Setup [node & npm](https://nodejs.org/).
- Install dependencies using `npm install`.
- Copy `config.sample.js` to `config.js` and edit the values (see comments in the config-file).
- Copy `index.sample.yaml` to `index.yaml` and edit the `kind` to what you wish to store it as in Google Cloud Datastore. Anything else should (by default) be left as-is.
- Copy `channels.sample.json` to `channels.json` and edit it.
    - **It's recommended to at least remove the example channels**.
- Run bot with `node app.js`.

## Updating
- Download the newest release or pull directly from `master` using `git pull`.
- Make sure dependencies are up-to-date by using `npm install`.
- Make sure `config.js` matches `config.sample.js`.
    - Delete/move config.js elsewhere and make a new `config.js` based off `config.sample.js` **if you feel like you have to**.
- Run the bot using `node app.js`.

## Changelog
Changelog can be found here: [CHANGELOG](/CHANGELOG.md)

## Commands
Commands can be found here: [COMMANDS](/COMMANDS.md)
