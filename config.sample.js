'use strict';

const config = {};

/**
 * See tmi.js docs for options: https://docs.tmijs.org/v1.1.2/Configuration.html
 *
 * @type {Object}
 */
config.tmi = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: "decicus",
        password: "oauth:KappaHey"
    }
};

/**
 * See Google Cloud options: https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.42.2/google-cloud
 *
 * @type {Object}
 */
config.gcloud = {
    projectId: 'grape-spaceship-123',
    keyFilename: '/path/to/key.json'
};

/**
 * Miscellaneous settings used by the bot.
 *
 * @type {Object}
 */
config.settings = {
    // The path to the JSON-file where channels are stored.
    channels: 'channels.json',
    // The name of the "Kind" on Google Cloud Datastore.
    kind: 'twitch-log-bot',
    // The command prefix for the admin commands.
    prefix: '!',
    // Array of Twitch usernames that are considered 'admins' and can use whisper commands.
    admins: [],
    // Express-related settings
    express: {
        port: 8000
    }
};

module.exports = config;
