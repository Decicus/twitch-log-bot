'use strict';
const config = require('./config');
const h = require('./helpers');
const settings = config.settings;
const datastore = require('@google-cloud/datastore')(config.gcloud);
const express = require('express');
const fs = require('fs');
const tmi = require('tmi.js');

const client = new tmi.client(config.tmi);

/**
 * Channels the bot has joined (and will join on start).
 *
 * @type {Array}
 */
let channels = JSON.parse(fs.readFileSync(settings.channels, 'utf-8'));

/**
 * Loads channels from file
 *
 * @return {Void}
 */
const loadChannels = () => {
    channels = JSON.parse(fs.readFileSync(settings.channels, 'utf-8'));
};

/**
 * Saves channels to file.
 *
 * @return {Void}
 */
const saveChannels = () => {
    fs.writeFile(settings.channels, JSON.stringify(channels, null, 4), (error) => {
        if (error) {
            console.log(error);
        }
    });
};

/**
 * Admin commands controlled by whispers.
 *
 * @type {Object}
 */
const cmds = {};

/**
 * Attempts to join the channel if it hasn't already been joined, then saves the current list.
 */
cmds['join'] = (username, user, input) => {
    if (input[0]) {
        let channel = h.fmtChannel(input[0]);
        if (channels.indexOf(channel) >= 0) {
            client.whisper(username, `${channel} is already joined.`);
        } else {
            client.join(channel).then(() => {
                channels.push(channel);
                saveChannels();
                client.whisper(username, `Successfully joined ${channel} and added the channel to the list.`);
            }).catch((err) => {
                client.whisper(username, `An error occurred joining ${channel}: ${err}`);
            });
        }
    } else {
        client.whisper(username, 'A channel name has to be specified.');
    }
};

/**
 * Leaves the specified channel and removes it from the channel list.
 */
cmds['leave'] = (username, user, input) => {
    if (input[0]) {
        let channel = h.fmtChannel(input[0]);
        let index = channels.indexOf(channel);
        if (index >= 0) {
            client.part(channel).then(() => {
                channels.splice(index, 1);
                saveChannels();
                client.whisper(username, `Successfully left ${channel} and removed the channel from the list.`);
            }).catch((err) => {
                client.whisper(username, `An error occurred leaving ${channel}: ${err}`);
            });
        } else {
            client.whisper(username, `${channel} has not been added to the list yet.`);
        }
    } else {
        client.whisper(username, 'A channel name has to be specified.');
    }
};

/**
 * Alias of cmds.leave().
 */
cmds['part'] = cmds['leave'];

/**
 * Ping pong.
 */
cmds['ping'] = (username) => {
    client.whisper(username, "PONG");
};

client.on('chat', (channel, user, message, self) => {
    channel = h.fmtChannel(channel);

    /**
     * Formats data so we don't log _all_ the junk included in the userstate.
     *
     * @type {Object}
     */
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

    let key = datastore.key([settings.kind, user.id]);
    datastore.insert({
        key: key,
        data: data
    }, (err) => {
        if (err) {
            console.log(err);
        }
    });
});

client.on('connected', () => {
    let date = new Date().toUTCString().split(" ");
    date.shift();
    date.pop();
    console.log(`Successfully connected at: ${date.join(" ")} UTC`);

    if (channels.length > 0) {
        // concat channels array to get a new array instance.
        let temp = channels.concat();
        let queue = setInterval(() => {
            client.join(temp[0]);
            temp.shift();

            if (temp.length === 0) {
                clearInterval(queue);
            }
        }, 1000);
    }
});

client.on('join', (channel, user, self) => {
    if (!self) {
        return;
    }

    console.log(`${user} joined ${channel}`);
});

client.on('whisper', (username, user, message) => {
    username = h.fmtChannel(username);
    /**
     * Handles admin commands through whispers
     */
    if (settings.admins.indexOf(username) >= 0 && message.startsWith(settings.prefix)) {
        let input = message.split(" ");
        // remove prefix from command name
        let command = input[0].slice(settings.prefix.length).toLowerCase();
        if (cmds[command]) {
            // remove the command name from input, because the methods don't need it
            input.shift();
            cmds[command](username, user, input);
        }
    }
});

client.connect();
