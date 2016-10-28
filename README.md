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
- Copy `index.sample.yaml` to `index.yaml` and edit each `kind` to what you wish to store it as in Google Cloud Datastore. Anything else should (by default) be left as-is.
    - The easiest way to create these indexes is by installing [Google Cloud SDK](https://cloud.google.com/sdk/), then running `gcloud init` after installing.
    - After that, while being in the directory of this bot, run `gcloud preview datastore create-indexes index.yaml` and it should create the indexes.
- Copy `channels.sample.json` to `channels.json` and edit it.
    - **It's recommended to at least remove the example channels**.
- Run the bot using `node app.js`, or alternatively use [pm2](http://pm2.keymetrics.io/).

## Updating
- Download the [latest release](https://github.com/Decicus/twitch-log-bot/releases/latest) or pull directly from `master` using `git pull`.
- Make sure dependencies are up-to-date by using `npm install`.
- Make sure `config.js` has the same properties as `config.sample.js`.
    - Delete/move config.js elsewhere and make a new `config.js` based off `config.sample.js` **if you feel like you have to**.
- Make sure `index.yaml` has the same values as `index.sample.yaml` (remember to edit the `kind`!) and update indexes using for example `gcloud preview datastore create-indexes index.yaml`.
- Run the bot using `node app.js`, or alternatively use [pm2](http://pm2.keymetrics.io/).

## Changelog
Changelog can be found here: [CHANGELOG](/CHANGELOG.md)

## Commands
Commands can be found here: [COMMANDS](/COMMANDS.md)
