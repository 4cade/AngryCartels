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
    emitInGame(socket.inGame, 'chat message', socket.username + ": " + msg);
 });

  // handle games

  socket.on('create game', function() {
  	games[socket.username] = {
  		"host": socket.username,
  		"players": [socket.username]
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
  	// tell everyone that the game started, do first for minimal lag since next step is intensive
    emitInGame(socket.inGame, 'start game', {});
    // actually populate the game with stuff and make everyone go into the game
    games[socket.inGame] = game.initializeBoard(games[socket.inGame]);

    emitInGame(socket.inGame, 'game data', games[socket.inGame]);
  });

  socket.on('set order', function() {
    // assign a turn order
    games[socket.inGame] = game.setOrder(games[socket.inGame]);
    console.log('set order');
    emitInGame(socket.inGame, 'game data', games[socket.inGame]);
  });

  socket.on('roll', function() {
    // simulate actually rolling the dice
    games[socket.inGame] = game.rollDice(games[socket.inGame]);

    // say something moved
    emitInGame(socket.inGame, 'movement', games[socket.inGame]);

    // check if further actions are needed
    var actions = [];
    var action1 = game.executeLocation(games[socket.inGame]);
    if(action1 !== "nothing") {
      actions.push(action1);
    }
    if(games[socket.inGame]["message"] === "mrmonopoly") {
      actions.push("mrmonopoly");
      games[socket.inGame]["message"] = "";
    }
    emitInGame(socket.inGame, 'game actions', actions);
  });

  socket.on('mrmonopoly', function(info) {
    games[socket.inGame] = game.unleashMrMonopoly(games[socket.inGame]);
    var actions = [];
    var action = game.executeLocation(games[socket.inGame]);
    if(action !== "nothing") {
      actions.push(action);
    }
    emitInGame(socket.inGame, 'game actions', actions);
  });

  socket.on('rent', function(info) {
    games[socket.inGame] = game.payRent(info.property, info.player, games[socket.inGame]);
    games[socket.inGame]["message"] = info.player + " paid rent to " + info.player2;
    emitInGame(socket.inGame, 'rent', games[socket.inGame]);
});

  socket.on('trade', function(tradeInfo) {
    games[socket.inGame] = game.trade(info.player1, info.player2, info.properties1, info.properties2, info.wealth1, info.wealth2, games[socket.inGame]);
    games[socket.inGame]["message"] = info.player + " mortgaged " + info.property;
    emitInGame(socket.inGame, 'trade', games[socket.inGame]);
  });

  socket.on('buy property', function(info) {
    // different actions if it was auctioned
    if(info.auction) {
        games[socket.inGame] = game.buyPropertyAuction(info.property, info.player, info.price, games[socket.inGame]);
        games[socket.inGame]["message"] = info.player + " bought " + info.property + " for " + info.price;
    }
    else {
        games[socket.inGame] = game.buyPropertyAuction(info.property, info.player, games[socket.inGame]);
        games[socket.inGame]["message"] = info.player + " bought " + info.property;
    }
    emitInGame(socket.inGame, 'property bought', games[socket.inGame]);
  });

  socket.on('buy house', function(info) {
    games[socket.inGame] = game.buyHouse(info.property, info.player, games[socket.inGame]);
    games[socket.inGame]["message"] = info.player + " upgraded " + info.property;
    emitInGame(socket.inGame, 'update houses', games[socket.inGame]);
  });

  socket.on('sell house', function(info) {
    games[socket.inGame] = game.sellHouse(info.property, info.player, games[socket.inGame]);
    games[socket.inGame]["message"] = info.player + " downgraded " + info.property;
    emitInGame(socket.inGame, 'update houses', games[socket.inGame]);
  });

  socket.on('mortgage', function(info) {
    games[socket.inGame] = game.mortgageProperty(info.property, info.player, games[socket.inGame]);
    games[socket.inGame]["message"] = info.player + " mortgaged " + info.property;
    emitInGame(socket.inGame, 'mortgage', games[socket.inGame]);
  });

  socket.on('end turn', function() {
    games[socket.inGame] = game.nextTurn(games[socket.inGame]);
    emitInGame(socket.inGame, 'game data', games[socket.inGame]);
  }); 

  socket.on('request game data', function() {
    console.log("someone wants to get game data");
    socket.emit('game data', games[socket.inGame]);
  })
}








