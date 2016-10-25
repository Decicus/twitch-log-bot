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
    let data = {
        channel: channel,
        channel_id: user['room-id'],
        user: {
            id: user['user-id'],
            name: user.username,
            display_name: (user['display_name'] || user.username),
            type: user['user-type'],
            color: user.color,
            badges: user.badges,
            subscriber: user.subscriber,
            turbo: user.turbo
        },
        message: message,
        timestamp: user['tmi-sent-ts']
    };
});
