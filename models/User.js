var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    gamesPlayed: Number,
    wins: Number,
    losses: Number,
    friendList: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    friends: Number
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
            User.find({_id: { $in: result.friendList}}, function(err, friendList) {
                if (err) {
                    callback('Users not found');
                } else {
                    var listFriends = friendList.map(function(item) {
                        return {
                            name: item.name
                        }
                    });
                    callback(null, {
                        username: result.username,
                        name: result.name,
                        stats: {
                            gamesPlayed: result.gamesPlayed,
                            wins: result.wins,
                            losses: result.losses
                        },
                        friendList: listFriends,
                        friends: result.friends
                    });
                }
            });
        }
    });
}

/**
 * Authenticate a user
 *
 * @param username {string} - username to check
 * @param password {string} - password to check
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.checkPassword = function(username, password, callback) {
    User.findUser(username, function(err, result) {
        if (err) {
            callback('Incorrect username/password combination');
        } else {
            if (result.password === password) {
                callback(null, {username: result.username});
            } else {
                callback('Incorrect username/password combination');
            }
        }
    });
}

/**
 * Create a new user
 * @param rawusername {string} - username to create
 * @param password {string} - password
 * @param name {string} - name
 * @param rawemail {string} - email
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.createNewUser = function(rawusername, password, name, rawemail, callback) {
    var username = rawusername.toLowerCase();
    var email = rawemail.toLowerCase();
    if (username.match('^[a-z0-9_-]{3,16}$')) {
        if (typeof password === 'string') {
            if (password.length >= 6) {
                if (email.match('.+\@.+\..+')) {
                    User.find({$or: [{username: username}, {email: email}]}, function(err, result) {
                        if (err) {
                            callback(err);
                        } else if (result.length === 0) {
                            var user = new User({
                                username: username,
                                password: password,
                                name: name,
                                email: email,
                                gamesPlayed: 0,
                                wins: 0,
                                losses: 0,
                                friendList: [],
                                friends: 0
                            });
                            user.save(function(err, result) {
                                if (err) {
                                    callback('Error saving user');
                                } else {
                                    callback(null, {username: username});
                                }
                            });
                        } else {
                            callback('User already exists');
                        }
                    });
                } else callback('Must have valid email address');
            } else callback('Password must be at least 6 characters long');
        } else callback('Invalid password');
    } else callback('Invalid username (must be between 3 and 16 characters and consist of letters, numbers, underscores, and hyphens)');
}

/**
 * Add user as new friend
 *
 * @param username {string} - username
 * @param userId {string} - user id of friend to be added; must be valid user
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.addFriend = function(username, userId, callback) {
    User.findUser(username, function(err, user) {
        if (err) {
            callback(err);
        } else {
            if (user.friendList.indexOf(userId) > -1) {
                callback('Already friends');
            } else {
                user.friendList.push(userId);
                user.friends += 1;
                user.save(function(err, result) {
                    if (err) {
                        callback('Error saving user');
                    } else {
                        User.findUserProfile(username, callback);
                    }
                });
            }
        }
    });
}

/**
 * Unfriend a user
 *
 * @param username {string} - username
 * @param userId {string} - user id of user to be unfriended; must be valid user
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.removeFriend = function(username, userId, callback) {
    User.findUser(username, function(err, user) {
        if (err) {
            callback(err);
        } else {
            if (user.friendList.indexOf(userId) == -1) {
                callback('Not friends');
            } else {
                user.friendList.splice(user.friendList.indexOf(userId), 1);
                user.friends -= 1;
                user.save(function(err, result) {
                    if (err) {
                        callback('Error saving user');
                    } else {
                        User.findUserProfile(username, callback);
                    }
                });
            }
        }
    });
}

/**
 * Increment user's number of games played
 *
 * @param username {string} - username
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.incrementGamesPlayed = function(username, callback) {
    User.findUser(username, function(err, user) {
        if (err) {
            callback(err);
        } else {
            user.gamesPlayed += 1;
            user.save(function(err, result) {
                if (err) {
                    callback('Error saving user');
                } else {
                    callback(null, {gamesPlayed: user.gamesPlayed});
                }
            });
        }
    });
}

/**
 * Increment user's number of games won
 *
 * @param username {string} - username
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.incrementWins = function(username, callback) {
    User.findUser(username, function(err, user) {
        if (err) {
            callback(err);
        } else {
            user.wins += 1;
            user.save(function(err, result) {
                if (err) {
                    callback('Error saving user');
                } else {
                    callback(null, {wins: user.wins});
                }
            });
        }
    });
}

/**
 * Increment user's number of games lost
 *
 * @param username {string} - username
 * @param callback {function} - function to be called with err and result
 */
userSchema.statics.incrementLosses = function(username, callback) {
    User.findUser(username, function(err, user) {
        if (err) {
            callback(err);
        } else {
            user.losses += 1;
            user.save(function(err, result) {
                if (err) {
                    callback('Error saving user');
                } else {
                    callback(null, {losses: user.losses});
                }
            });
        }
    });
}

var User = mongoose.model('User', userSchema);

module.exports = User;