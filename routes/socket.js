var board = require('./board.js');
var Game = require('./game.js');

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
    // game has started
    if(games[host]["players"] == undefined) {
        for(var index in games[host].getData()["players"]) {
            var playerName = games[host].getData()["players"][index]["name"];
            users[playerName].emit(call, data);
        }
      
    }
    // game has not been started
    else {
        for(var index in games[host]["players"]) {
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
    games[socket.inGame] = new Game(games[socket.inGame]);//game.initializeBoard(games[socket.inGame]);
    console.log("started game");
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  socket.on('set order', function() {
    // assign a turn order
    games[socket.inGame].setOrder();
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  socket.on('roll', function() {
    // simulate actually rolling the dice
    games[socket.inGame].rollDice();

    // say something moved
    emitInGame(socket.inGame, 'movement', games[socket.inGame].getData());

    // check if further actions are needed
    var actions = [];
    var action1 = games[socket.inGame].executeLocation();
    if(action1 !== "nothing") {
      actions.push(action1);
    }
    if(games[socket.inGame]["message"] === "mrmonopoly") {
      actions.push("mrmonopoly");
      games[socket.inGame].setMessage("");
    }
    socket.emit('actions', actions);
  });

  socket.on('mrmonopoly', function(info) {
    games[socket.inGame].unleashMrMonopoly();
    var actions = [];
    var action = games[socket.inGame].executeLocation();
    if(action !== "nothing") {
      actions.push(action);
    }
    emitInGame(socket.inGame, 'actions', actions);
  });

  socket.on('rent', function(info) {
    games[socket.inGame].payRent(info.property, info.player);
    var message = info.player + " paid rent to " + info.player2;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'rent', games[socket.inGame].getData());
});

  socket.on('trade', function(tradeInfo) {
    games[socket.inGame].trade(info.player1, info.player2, info.properties1, info.properties2, info.wealth1, info.wealth2);
    var message = info.player + " mortgaged " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'trade', games[socket.inGame].getData());
  });

  socket.on('buy property', function(info) {
    // different actions if it was auctioned
    if(info.auction) {
        games[socket.inGame].buyPropertyAuction(info.property, info.player, info.price);
        var message = info.player + " bought " + info.property + " for " + info.price;
        games[socket.inGame].setMessage(message);
    }
    else {
        games[socket.inGame].buyPropertyAuction(info.property, info.player);
        var message = info.player + " bought " + info.property;
        games[socket.inGame].setMessage(message);
    }
    emitInGame(socket.inGame, 'property bought', games[socket.inGame].getData());
  });

  socket.on('buy house', function(info) {
    games[socket.inGame].buyHouse(info.property, info.player);
    var message = info.player + " upgraded " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'update houses', games[socket.inGame].getData());
  });

  socket.on('sell house', function(info) {
    games[socket.inGame].sellHouse(info.property, info.player);
    var message = info.player + " downgraded " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'update houses', games[socket.inGame].getData());
  });

  socket.on('mortgage', function(info) {
    games[socket.inGame].mortgageProperty(info.property, info.player);
    var message = info.player + " mortgaged " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'mortgage', games[socket.inGame].getData());
  });

  socket.on('end turn', function() {
    games[socket.inGame].nextTurn();
    console.log(games[socket.inGame].currentPlayer());
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  socket.on('property info', function(property) {
    socket.emit('property info', games[socket.inGame].getPropertyInfo(property));
  });

  socket.on('rent info', function(property) {
    socket.emit('rent info', games[socket.inGame].rentOfProperty(property));
  });

  socket.on('highest rent', function() {
    var highest = games[socket.inGame].highestRent();
    socket.emit('highest rent', games[socket.inGame].getPropertyInfo(highest));
  });

  socket.on('all locations', function() {
    socket.emit('all locations', games[socket.inGame].getAllLocations());
  })

  socket.on('request game data', function() {
    console.log("someone wants to get game data");
    socket.emit('game data', games[socket.inGame].getData());
  });
}








