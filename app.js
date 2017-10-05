'use strict';
const config = require('./config');
const h = require('./helpers');
const pkg = require('./package');
const settings = config.settings;
const datastore = require('@google-cloud/datastore')(config.gcloud);
const express = require('express');
const fs = require('fs');
const request = require('request');
const swig = require('swig');
const tmi = require('tmi.js');

const client = new tmi.client(config.tmi);
const web = express();
const twitchSettings = config.settings.twitch || {};
const baseApi = request.defaults({
    baseUrl: 'https://api.twitch.tv/kraken',
    method: 'GET',
    headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': 'OAuth ' + (config.tmi.identity.password || '').replace('oauth:', ''),
        'Client-ID': twitchSettings.clientId || ''
    },
    json: true,
});

/**
 * Channels the bot has joined (and will join on start).
 *
 * @type {Array}
 */
let channels = [];

/**
 * Cache to map usernames to user IDs and vice versa.
 *
 * @type {Object}
 */
let cache = {
    ids: {},
    names: {},
};

/**
 * Get user data based on username.
 *
 * @param  {String}   username
 * @param  {Function} callback
 * @return {Void}
 */
const getUser = (username, callback) => {
    if (typeof callback !== 'function') {
        callback = () => {};
    }

    if (cache.names[username]) {
        callback(cache.names[username]);
        return;
    }

    baseApi({
        'url': '/users?login=' + username
    }, (err, response, body) => {
        if (err) {
            callback(false);
            return console.error(err);
        }

        if (!body.users[0]) {
            callback(false);
            return console.error(`User ${username} does not exist!`);
        }

        const user = body.users[0];
        const {_id, display_name, name} = user;

        const userToCache = {
            display_name,
            _id,
            name,
        };

        cache.ids[_id] = userToCache;
        cache.names[name] = userToCache;
        console.log(`Loaded ${name} (${_id}) into cache.`);

        callback(userToCache);
    });
};

/**
 * Which users to ignore in channels by the bot.
 *
 * @type {Object}
 */
let ignore = {};

/**
 * Reads a file and parses it as JSON.
 *
 * @return {Mixed}
 */
const readJson = (filename) => {
    try {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    } catch (error) {
        console.log(error);
        return false;
    }
};


/**
 * JSON-encodes the input and writes it to the specified file path.
 *
 * @param  {String} filename
 * @param  {Object|Array} input
 * @return {Void}
 */
const saveJson = (filename, input) => {
    fs.writeFile(filename, JSON.stringify(input, null, 4), (error) => {
        if (error) {
            console.log(error);
        }
    });
};

/**
 * Loads channels from file
 *
 * @return {Void}
 */
const loadChannels = () => {
    let read = readJson(settings.channels || __dirname + '/channels.json');

    if (read === false) {
        return;
    }

    channels = read;
};

// Load channels on startup
loadChannels();

// Cache channel data
channels.forEach((chan) => {
    getUser(chan);
});

/**
 * Saves channels to file.
 *
 * @return {Void}
 */
const saveChannels = () => {
    saveJson(settings.channels || __dirname + '/channels.json', channels);
};

/**
 * Loads the ignore list from file.
 *
 * @return {Void}
 */
const loadIgnore = () => {
    let read = readJson(settings.ignore || __dirname + '/ignore.json');

    if (read === false) {
        return;
    }

    ignore = read;
};

// Load ignore list on startup.
loadIgnore();

/**
 * Saves the ignore list to file.
 *
 * @return {Void}
 */
const saveIgnore = () => {
    saveJson(settings.ignore || __dirname + '/ignore.json', ignore);
};

/**
 * Admin commands controlled by whispers.
 *
 * @type {Object}
 */
const cmds = {};

/**
 * Adds a user to the ignore list for the specified channel, then saves the ignore list.
 */
cmds['ignore'] = (username, user, input) => {
    if (!input[0] || !input[1]) {
        client.whisper(username, 'Both channel and username has to be specified');
        return;
    }

    let channel = h.fmtChannel(input[0]);
    let name = h.fmtChannel(input[1]);

    if (!ignore[channel]) {
        ignore[channel] = [];
    }

    let list = ignore[channel];
    if (list.indexOf(name) >= 0) {
        client.whisper(username, `${name} is already ignored in ${channel}`);
        return;
    }

    list.push(name);
    saveIgnore();
    client.whisper(username, `${name} has been added to the ignore list for ${channel}`);
};

/**
 * Attempts to join the channel if it hasn't already been joined, then saves the channel list.
 */
cmds['join'] = (username, user, input) => {
    if (input[0]) {
        let channel = h.fmtChannel(input[0]);
        if (channels.indexOf(channel) >= 0) {
            client.whisper(username, `${channel} is already joined.`);
        } else {
            getUser(channel, (user) => {
                if (!user) {
                    client.whisper(username, `Error occurred getting data on ${channel}.`);
                    return;
                }

                client.join(channel).then(() => {
                    channels.push(channel);
                    saveChannels();
                    client.whisper(username, `Successfully joined ${channel} and added the channel to the list.`);
                }).catch((err) => {
                    client.whisper(username, `An error occurred joining ${channel}: ${err}`);
                });
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
    client.whisper(username, 'PONG');
};

/**
 * Removes a user from the ignore list for the specified channel, then saves the ignore list.
 */
cmds['unignore'] = (username, user, input) => {
    if (!input[0] || !input[1]) {
        client.whisper(username, 'Both channel and username has to be specified');
        return;
    }

    let channel = h.fmtChannel(input[0]);
    let name = h.fmtChannel(input[1]);

    if (!ignore[channel]) {
        ignore[channel] = [];
    }

    let list = ignore[channel];
    let index = list.indexOf(name);
    if (index === -1) {
        client.whisper(username, `${name} isn't ignored in ${channel}`);
        return;
    }

    list.splice(index, 1);
    saveIgnore();
    client.whisper(username, `${name} has been removed from the ignore list for ${channel}`);
};

/**
 * Returns the app version.
 */
cmds['version'] = (username) => {
    client.whisper(username, pkg.version);
};

/**
 * Handles chat messages
 */
const handleMessage = (channel, user, message) => {
    channel = h.fmtChannel(channel);

    /**
     * Ignore legacy "twitchnotify" subscriber messages.
     *
     * These should no longer show up anyways.
     */
    if (user.username === 'twitchnotify') {
        return;
    }

    /**
     * Ignore users in the ignore list.
     */
    if (ignore[channel] && ignore[channel].indexOf(user.username) >= 0) {
        return;
    }

    /**
     * Formats data so we don't log _all_ the junk included in the userstate.
     *
     * @type {Object}
     */
    const data = {
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

    const key = datastore.key([settings.kind, user.id]);
    datastore.insert({
        key: key,
        data: data
    }, (err) => {
        if (err) {
            console.log(err);
        }
    });
};

/**
 * Handles the different subscription events
 */
const handleSubs = (channel, username, m, msg, userstate, methods) => {
    channel = h.fmtChannel(channel);

    if (ignore[channel] && ignore[channel].indexOf(username) >= 0) {
        return;
    }

    let ts = Date.now().toString();
    msg = msg || '<No Message>';

    getUser(username, (cachedUser) => {
        let user_id = null;
        if (cachedUser) {
            user_id = cachedUser._id;
        }

        /**
         * 'resub' event: This will be the amount of months the user has been subbed for (https://docs.tmijs.org/v1.2.1/Events.html#resub)
         * 'subscription' event: This will be an object with the plan/method information (https://docs.tmijs.org/v1.2.1/Events.html#subscription)
         */
        const prefix = typeof m === 'number' ? `Resub (${m} months) - Plan: [${methods.plan}] ${methods.planName}` : `Subscription - Plan: [${m.plan}] ${m.planName}`;

        const data = {
            channel: channel,
            channel_id: cache.names[channel]._id,
            username: username,
            user_id: user_id,
            user: {
                display_name: username
            },
            message: `${prefix} - Message: ${msg}`,
            timestamp: ts
        };

        const key = datastore.key([settings.kind, username + '_' + ts]);
        datastore.insert({
            key: key,
            data: data
        }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });
};

client.on('action', handleMessage);
client.on('chat', handleMessage);
client.on('cheer', handleMessage);
client.on('resub', handleSubs);
client.on('subscription', handleSubs);

client.on('connected', () => {
    console.log(`[${h.now()}] Successfully connected.`);
    settings.autoconnect = settings.autoconnect || {};

    if (channels.length > 0 && settings.autoconnect.enabled !== false) {
        // concat channels array to get a new array instance.
        let temp = channels.concat();
        let queue = setInterval(() => {
            const chan = temp[0];

            client.join(chan);
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
        let input = message.split(' ');
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
        res.render('home');
    });

    web.get('/api/channels', (req, res) => {
        res.send({
            success: true,
            channels: channels
        });
    });

    web.get('/api/messages', (req, res) => {
        let channel = (h.requestValue(req, 'channel') || '');
        let user = (h.requestValue(req, 'user') || '');
        user = user.trim();
        channel = channel.trim();
        let limit = (parseInt(h.requestValue(req, 'limit')) || 25);
        let offset = (parseInt(h.requestValue(req, 'offset')) || 0);
        let plain = (typeof h.requestValue(req, 'plain') !== 'undefined' ? true : false);
        let useUserId = (typeof h.requestValue(req, 'userid') !== 'undefined' ? true : false);

        let max = (settings.queryLimit || 200);
        if (limit > max) {
            limit = max;
        }

        if ((!channel || channel.length === 0) && (!user || user.length === 0)) {
            let message = 'No channel or user specified';
            if (plain) {
                h.response(res, message);
                return;
            }

            h.response(res, {
                success: false,
                error: message
            });
            return;
        }

        let query = datastore.createQuery(settings.kind);

        if (channel && channel.length > 0) {
            query = query.filter('channel_id', '=', cache.names[channel]._id)
                .order('channel_id');
        }

        if (user && user.length > 0) {
            user = user.toLowerCase();
        }

        const userGet = (user && user.length > 0) ? user : channel;
        const handleUser = (cachedUser) => {
            if (!useUserId) {
                if (user && user.length > 0) {
                    /**
                     * User does not "exist", but may just be sitewide suspended/deleted.
                     * Fallback to search by username.
                     *
                     * Eventually I wanna get the user_id from one of the resulting
                     * messages in the query and use that to query more messages by
                     * the user, but as of right now this is just a quickfix.
                     *
                     * This does not account for channels that are banned, which is
                     * something else I'll have to "fix" at a later date.
                     * For now: Don't get suspended.
                     */
                    if (cachedUser) {
                        query = query.filter('user_id', '=', cachedUser._id);
                    } else {
                        query = query.filter('username', '=', user);
                    }
                }
            } else {
                query = query.filter('user_id', '=', cachedUser);
            }

            query = query
                .offset(offset)
                .limit(limit);

            query = query.order('timestamp', {
                descending: true
            });

            datastore.runQuery(query, (err, messages) => {
                if (err) {
                    const message = 'Unable to retrieve messages for this user/channel.';
                    console.error(err);
                    res.status(404);

                    if (plain) {
                        h.response(res, message);
                        return;
                    }

                    h.response(res, {
                        success: false,
                        error: message
                    });
                    return;
                }

                if (plain) {
                    if (messages.length > 0) {
                        let result = '';
                        for (let index in messages) {
                            let msg = messages[index];

                            result += `[#${msg.channel}][${msg.user.display_name}][${h.formatDate(msg.timestamp)}] - ${msg.message}\r\n`;
                        }

                        h.response(res, result);
                    } else {
                        h.response(res, 'No messages found.');
                    }
                    return;
                }

                h.response(res, {
                    success: true,
                    count: messages.length,
                    messages: messages
                });
            });
        };

        if (useUserId) {
            handleUser(user);
        } else {
            getUser(userGet, handleUser);
        }
    });

    web.get('/api/*', function(req, res) {
        res.send({
            success: false,
            error: '404 not found'
        });
    });

    /**
     * Basic error handling.
     */
    web.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
        if (err.status === 404) {
            res.send('Page not found.');
        }

        res.send('Internal server error');
    });

    let webport = settings.express.port || 8000;
    web.listen(webport, () => {
        console.log(`Web interface listening on port ${webport}`);
    });
}

client.connect();

process.on('SIGINT', () => {
    client.disconnect()
        .then(() => {
            console.log('Successfully disconnected from Twitch chat server.');
            process.exit(0);
        })
        .catch((err) => {
            console.error(`Error occurred disconnecting from Twitch chat server: ${err}`);
            process.exit(1);
        });
});
