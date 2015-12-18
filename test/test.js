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
                    friends: 0
                })).save(function(err, result) {
                    if (!err) {
                        userId1 = result._id;
                    }
                    (new User({
                        username: 'shu',
                        password: 'kawaii',
                        name: 'Shu Maiko',
                        email: 'theonlyshu@gmail.com',
                        gamesPlayed: 0,
                        wins: 0,
                        losses: 0,
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
            // test nonexistant user
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
            // test nonexistant user
            it('should return error when user does not exist', function (done) {
                User.authenticateUser('hello', function(err, result) {
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

    });

});