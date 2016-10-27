# twitch-log-bot
Twitch Log Bot is a bot that will join Twitch channels and store chat messages using Google Cloud Datastore.

## Setup
- Setup [Google Cloud Datastore](https://console.cloud.google.com/datastore/).
- Setup [node & npm](https://nodejs.org/).
- Install dependencies using `npm install`.
- Copy `config.sample.js` to `config.js` and edit the values (see comments in the config-file).
- Copy `index.sample.yaml` to `index.yaml` and edit the `kind` to what you wish to store it as in Google Cloud Datastore. Anything else should (by default) be left as-is.
- Run bot with `node app.js`.
