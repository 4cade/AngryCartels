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

var User = mongoose.model('User', userSchema);

module.exports = User;