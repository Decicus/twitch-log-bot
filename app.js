'use strict';
const config = require('./config');
const h = require('./helpers');
const settings = config.settings;
const datastore = require('@google-cloud/datastore')(config.gcloud);
const express = require('express');
const fs = require('fs');
const swig = require('swig');
const tmi = require('tmi.js');

const client = new tmi.client(config.tmi);
const web = express();

/**
 * Channels the bot has joined (and will join on start).
 *
 * @type {Array}
 */
let channels = [];

/**
 * Loads channels from file
 *
 * @return {Void}
 */
const loadChannels = () => {
    try {
        channels = JSON.parse(fs.readFileSync((settings.channels || __dirname + "/channels.json"), 'utf-8'));
    } catch (error) {
        console.log(error);
        channels = [];
    }
};

// Load channels on startup
loadChannels();

/**
 * Saves channels to file.
 *
 * @return {Void}
 */
const saveChannels = () => {
    fs.writeFile((settings.channels || __dirname + "/channels.json"), JSON.stringify(channels, null, 4), (error) => {
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
        username: user.username,
        user_id: user['user-id'],
        user: {
            display_name: (user['display-name'] || user.username),
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
    console.log(`[${h.now()}] Successfully connected.`);
    settings.autoconnect = settings.autoconnect || {};

    if (channels.length > 0 && settings.autoconnect.enabled !== false) {
        // concat channels array to get a new array instance.
        let temp = channels.concat();
        let queue = setInterval(() => {
            client.join(temp[0]);
            temp.shift();

            if (temp.length === 0) {
                clearInterval(queue);
            }
        }, settings.autoconnect.delay || 1000);
    }
});

client.on('join', (channel, user, self) => {
    if (!self) {
        return;
    }

    console.log(`[${h.now()}] ${user} joined ${channel}`);
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

if (settings.express.enabled) {
    web.engine('html', swig.renderFile);
    web.set('view engine', 'html');
    web.set('views', __dirname + '/views');

    web.get('/', (req, res) => {
        res.render("home");
    });

    web.get('/api/channels', (req, res) => {
        res.send({
            success: true,
            channels: channels
        });
    });

    web.get('/api/messages', (req, res) => {
        let channel = req.get('channel');
        let user = (req.get('user').trim() || "");
        let limit = (parseInt(req.get('limit')) || 25);
        let offset = (parseInt(req.get('offset')) || 0);

        let max = (settings.queryLimit || 200);
        if (limit > max) {
            limit = max;
        }

        if ((!channel || channel.length === 0) && (!user || user.length === 0)) {
            res.send({
                success: false,
                error: "No channel or user specified"
            });
            return;
        }

        let query = datastore.createQuery(settings.kind);

        if (channel && channel.length > 0) {
            query = query.filter('channel', '=', channel)
                .order('channel');
        }

        if (user && user.length > 0) {
            user = user.toLowerCase();
            query = query.filter('username', '=', user);
        }

        query = query
            .offset(offset)
            .limit(limit);

        query = query.order('timestamp', {
            descending: true
        });

        datastore.runQuery(query, (err, entities) => {
            if (err) {
                // TODO: Handle errors properly
                console.log(err);
                res.send({
                    success: false,
                    error: 'An error occurred'
                });
            } else {
                res.send({
                    success: true,
                    messages: entities
                });
            }
        });
    });

    web.get('/api/*', function(req, res) {
        res.send({
            success: false,
            error: '404 not found'
        });
    });

    let webport = settings.express.port || 8000;
    web.listen(webport, () => {
        console.log(`Web interface listening on port ${webport}`);
    });
}

client.connect();
