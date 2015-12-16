var board = require('./board.js');

var users = {};
var userGenNum = 0;
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
		var playerName = games[host]["players"][index];
		users[playerName].emit(call, data);
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

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    emitAll('chat message', msg);
 });

  // handle games

  socket.on('create game', function() {
  	games[socket.username] = {
  		"host": socket.username,
  		"players": [socket.username],
  		"data": {}
  	}
  	socket.inGame = "" + socket.username;
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
  	emitAll('updated games', games);
  });

  socket.on('leave game', function(game) {
  	games[game]["players"] = games[game]["players"].filter(
  		function(el) { return el !== socket.username });
  	emitAll('updated games', games);
  	socket.inGame = null;
  });

  socket.on('get games', function() {
  	socket.emit('updated games', games);
  });

  socket.on('start game', function() {
  	//TODO actually populate the game with stuff and make everyone go into the game
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

  })
}








