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
    },
    channels: ["#decicus"]
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

module.exports = config;