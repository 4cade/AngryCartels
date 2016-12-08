module.exports = (function () {

    var _utils = {};

    /**
     * Helper function to send a success (200 OK) response
     *
     * @param res {object} - response object
     * @param content {object} - content to send
     */
    _utils.sendSuccessResponse = function(res, content) {
        res.status(200).json(content).end();
    };

    /**
     * Helper function to send a failure response
     *
     * @param res {object} - response object
     * @param errcode {number} - HTTP status code to send
     * @param error {string} - error message to send
     */
    _utils.sendErrResponse = function(res, errcode, error) {
        res.status(errcode).json({
            error: error
        }).end();
    };

    Object.freeze(_utils);
    return _utils;

})();