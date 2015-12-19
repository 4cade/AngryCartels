var assert = require('assert');
var mongoose = require('mongoose');
var User = require('../models/User');

var userId1 = null; // for user zach
var userId2 = null; // for user shu

describe('Init', function() {

    before(function (done) {
        mongoose.connect('mongodb://localhost/model_test', function() {
            mongoose.connection.db.dropDatabase();
            User.createNewUser('alex', 'code831', 'Alex Luh', 'aluh831@gmail.com', function() {
                (new User({
                    username: 'zach',
                    password: 'mikuNYC',
                    name: 'Zach Miranda',
                    email: 'zachm@gmail.com',
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    friendList: [],
                    friends: 100
                })).save(function(err, result) {
                    if (!err) {
                        userId1 = result._id;
                    }
                    (new User({
                        username: 'shu',
                        password: 'kawaii',
                        name: 'Shu Maiko',
                        email: 'theonlyshu@gmail.com',
                        gamesPlayed: 6,
                        wins: 5,
                        losses: 1,
                        friendList: [],
                        friends: 0
                    })).save(function(err, result) {
                        if (!err) {
                            userId2 = result._id;
                        }
                        done();
                    });
                });
            });
        });
    });

    // test user model
    describe('User', function() {

        // test findUser
        describe('#findUser', function() {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.findUser('hello', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'User not found');
                    done();
                });
            });

            // test existing user
            it('should not return error when user exists', function (done) {
                User.findUser('alex', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'alex');
                    done();
                });
            });
        });

        // test authenticateUser
        describe('#authenticateUser', function() {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.authenticateUser('testuser', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test existing user
            it('should not return error when user exists', function (done) {
                User.authenticateUser('zach', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'zach');
                    done();
                });
            });
        });

        // test findUserProfile
        describe('#findUserProfile', function () {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.findUserProfile('bob', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test existing user
            it('should not return error when user exists', function (done) {
                User.findUserProfile('shu', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'shu');
                    assert.equal(result.stats.gamesPlayed, 6);
                    done();
                });
            });

            // test existing user with different capitalization
            it('should not return error when user exists even if capitalized', function (done) {
                User.findUserProfile('Zach', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'zach');
                    assert.equal(result.friends, 100);
                    done();
                });
            });

        });

        // test checkPassword
        describe('#checkPassword', function () {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.checkPassword('Santa', 'hohoho', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Incorrect username/password combination');
                    done();
                });
            });

            // test incorrect password for existing user
            it('should return error when password incorrect', function (done) {
                User.checkPassword('zach', 'testpass', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Incorrect username/password combination');
                    done();
                });
            });

            // test correct password for existing user
            it('should not return error when user exists', function (done) {
                User.checkPassword('alex', 'code831', function(err, result) {
                    assert.equal(err, null);
                    done();
                });
            });

            // test existing user different capitalization
            it('should not return error when user exists even if capitalized', function (done) {
                User.checkPassword('Shu', 'kawaii', function(err, result) {
                    assert.equal(err, null);
                    done();
                });
            });

            // test existing user with password capitalized differently
            it('should return error when password has different capitalization', function (done) {
                User.checkPassword('shu', 'KaWaii', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Incorrect username/password combination');
                    done();
                });
            });

        });

        // test createNewUser
        describe('#createNewUser', function() {
            // test creating an already existing user
            it('should return error when user already exists', function (done) {
                User.createNewUser('alex', 'password', 'name', 'email@gmail.com', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'User already exists');
                    done();
                });
            });

            // test username min length
            it('should return error when username too short', function (done) {
                User.createNewUser('hi', 'password', 'name', 'snail@gmail.com', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Invalid username (must be between 3 and 16 characters and consist of letters, numbers, underscores, and hyphens)');
                    done();
                });
            });

            // test username max length
            it('should return error when username too long', function (done) {
                User.createNewUser('thisisasuperlongname', 'password', 'name', 'long@gmail.com', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Invalid username (must be between 3 and 16 characters and consist of letters, numbers, underscores, and hyphens)');
                    done();
                });
            });

            // test username with invalid characters
            it('should return error when username has invalid characters', function (done) {
                User.createNewUser('mi<>yu', 'password', 'name', 'rushhour@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Invalid username (must be between 3 and 16 characters and consist of letters, numbers, underscores, and hyphens)');
                    done();
                });
            });

            // test email with invalid format
            it('should return error when email is not in a valid format', function (done) {
                User.createNewUser('luke', 'password', 'name', 'N0TvalidEma!l', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Must have valid email address');
                    done();
                });
            });

            // test non-unique email
            it('should return error when email already taken', function (done) {
                User.createNewUser('bryan', 'password', 'name', 'theonlyshu@gmail.com', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'User already exists');
                    done();
                });
            });

            // test short password
            it('should return error when password too short', function (done) {
                User.createNewUser('MIT', 'pass', 'name', 'MIT@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Password must be at least 6 characters long');
                    done();
                });
            });

            // test creating new user
            it('should not return error when user does not exist', function (done) {
                User.createNewUser('n00b', 'password', 'name', 'n00b@gmail.com', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result, {username: 'n00b'});
                    done();
                });
            });

            // test creating new user with different capitalization
            it('should not return error when username capitalized', function (done) {
                User.createNewUser('MonoPolY', 'password', 'name', 'richguy@gmail.com', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result, {username: 'monopoly'});
                    done();
                });
            });

        });

        // test addFriend
        describe('#addFriend', function () {
            // test adding new friend
            it('should not return error when adding new friend', function (done) {
                User.addFriend('alex', userId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.friendList.length, 1);
                    assert.equal(result.friends, 1);
                    assert.deepEqual(result.friendList[0], userId1);
                    done();
                });
            });

            // test adding user already in friend list
            it('should return error when adding existing friend', function (done) {
                User.addFriend('alex', userId1, function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Already friends');
                    done();
                });
            });

        });

        // test removeFriend
        describe('#removeFriend', function () {
            // test removing nonexistent friend
            it('should return error when not friends', function (done) {
                User.removeFriend('alex', userId2, function(err, result) {
                    assert.notEqual(err, null);
                    assert.equal(err, 'Not friends');
                    done();
                });
            });

            // test removing friend
            it('should not return error when friend exists', function (done) {
                User.removeFriend('alex', userId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.friends, 0);
                    assert.equal(result.friendList.length, 0);
                    done();
                });
            });
        });

    });

});