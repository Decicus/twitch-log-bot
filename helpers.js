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

/**
 * Returns a new date string of "now" when it's called.
 *
 * @return {String}
 */
helpers.now = () => {
    let date = new Date().toUTCString().split(" ");
    date.shift();
    date.pop();
    return date.join(" ") + " UTC";
};

module.exports = helpers;
