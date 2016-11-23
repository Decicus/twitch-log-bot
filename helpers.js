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

/**
 * Formats the timestamp into a UTC date.
 *
 * @param  {Mixed} timestamp The timestamp to format.
 * @return {String}          The formatted date.
 */
helpers.formatDate = (timestamp) => {
    timestamp = parseInt(timestamp);

    let date = new Date(timestamp).toUTCString().split(" ");
    date.shift();
    date.pop();

    return date.join(" ");
};

/**
 * Retrieves either the header or query parameter value from the request.
 *
 * @param  {Object} req  The request object.
 * @param  {String} name The name of the header/query parameter.
 * @return {Mixed}       The value or undefined.
 */
helpers.requestValue = (req, name) => {
    return (typeof req.query[name] !== 'undefined' ? req.query[name] : req.get(name));
};

/**
 * Returns the proper response based on the input value.
 *
 * @param  {Object} res   The express response object.
 * @param  {Mixed} value  The value to send back in the response.
 * @return {Mixed}
 */
helpers.response = (res, value) => {
    if (typeof value !== 'object') {
        res.setHeader('Content-Type', 'text/plain');
        return res.send(value);
    }

    return res.json(value);
};

module.exports = helpers;
