var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    gamesPlayed: Number,
    wins: Number,
    losses: Number,
    friends: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}]
});

/**
 * Find a user if exists; return error otherwise
 *
 * @param rawusername {string} - username of potential user
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.findUser = function(rawusername, callback) {
    var username = rawusername.toLowerCase();
    User.find({ username: username }, function(err, result) {
        if (err) {
            callback('User not found');
        } else if (result.length > 0) {
            callback(null, result[0]);
        } else {
            callback('User not found');
        }
    });
}

/**
 * Assert username is valid; return error otherwise
 *
 * @param username {string} - username of a potential user
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.authenticateUser = function(username, callback) {
    User.findUser(username, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, {username: result.username});
        }
    });
}

/**
 * Get a user's profile if exists; return error otherwise
 *
 * @param username {string} - username of a potential user
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.findUserProfile = function(username, callback) {
    User.findUser(username, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                username: result.username,
                name: result.name,
                stats: {
                    gamesPlayed: result.gamesPlayed,
                    wins: result.wins,
                    losses: result.losses
                },
                friends: result.friends
            });
        }
    });
}

var User = mongoose.model('User', userSchema);

module.exports = User;