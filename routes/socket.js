var board = require('./board.js');
var game = require('./game.js');

var users = {};
var userGenNum = 1;
var games = {};

function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);  
     }
   }
   return userNames;
}

function emitAll(call, data) {
	for(user in users) {
		if(users[user]) {
			users[user].emit(call, data);
		}
	}
}

function emitInGame(host, call, data) {
	for(var index in games[host]["players"]) {
    // game has started
    console.log(games[host]["players"][index]);
    if(typeof games[host]["players"][index] == "object") {
      var playerName = games[host]["players"][index]["name"];
      users[playerName].emit(call, data);
    }
    // game has not been started
		else {
      var playerName = games[host]["players"][index];
      users[playerName].emit(call, data);
    }
  }
}

module.exports = function(socket){
  console.log('a user connected');
  users[userGenNum] = socket;
  socket.username = userGenNum;
  userGenNum++;

  //TODO LOGIN
  socket.on('login', function(username) {
  	socket.username = username;
  	users[username] = socket;
  });

  socket.on('get client name', function() {
  	socket.emit('send client name', socket.username);
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
    users[socket.username] = null;
  });

  // instant messaging

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    emitInGame(socket.inGame, 'chat message', msg);
 });

  // handle games

  socket.on('create game', function() {
  	games[socket.username] = {
  		"host": socket.username,
  		"players": [socket.username],
  		"data": {}
  	}
  	socket.inGame = "" + socket.username;
    console.log(socket.username + " created a game");
  	emitAll('updated games', games);
  });

  socket.on('stop hosting game', function() {
  	emitInGame(socket.username, 'kick game', {});
  	games[socket.username] = null;
  	emitAll('updated games', games);
  	socket.inGame = null;
  });

  socket.on('join game', function(host) {
  	games[host]["players"].push(socket.username);
  	socket.inGame = host;
    console.log(socket.username + " joined " + host + "'s game");
  	emitAll('updated games', games);
  });

  socket.on('leave game', function() {
  	games[socket.inGame]["players"] = games[socket.inGame]["players"].filter(
  		function(el) { return el !== socket.username });
    console.log(socket.username + " left " + socket.inGame + "'s game");
  	emitAll('updated games', games);
  	socket.inGame = null;
  });

  socket.on('get games', function() {
  	socket.emit('updated games', games);
  });

  socket.on('start game', function() {
  	// actually populate the game with stuff and make everyone go into the game
    games[socket.inGame] = game.initializeBoard(games[socket.inGame]);
    
    emitInGame(socket.inGame, 'start game', {});
  });

  socket.on('roll', function() {

  });

  socket.on('trade', function(tradeInfo) {

  });

  socket.on('buy house', function(info) {

  });

  socket.on('sell house', function(info) {

  });

  socket.on('mortgage', function(info) {

  });

  socket.on('request game data', function() {
    socket.emit('game data', games[socket.inGame]);
  })
}








