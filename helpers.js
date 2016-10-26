const helpers = {};

/**
 * Formats channel names consistently.
 *
 * @param  {String} channel The channel name to format
 * @return {String}
 */
helpers.fmtChannel = (channel) => {
    return channel.replace("#", "").toLowerCase();
}

module.exports = helpers;
