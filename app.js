'use strict';
const tmi = require('tmi.js');
const gcloud = require('google-cloud');
const config = require('./config');

const client = new tmi.client(config.tmi);

client.connect();

client.on('message', (channel, user, message, self) => {
    if (self) {
        return;
    }
    
    channel = channel.replace("#", "");
    
    // TODO: The rest.
});