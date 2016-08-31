var board = require('./board.js');
var Game = require('./game.js');

var users = {};
var userGenNum = 1;
var games = {};

/**
 * @return the usernames of all of the players in the current game
 */
function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);
     }
   }
   return userNames;
}

/**
 * Emits the call to all of the client sockets currently connected to the server
 * @param call the name of the call for the socket
 * @param data the JSON to be sent for the call to the client
 */
function emitAll(call, data) {
    for(user in users) {
        if(users[user]) {
            users[user].emit(call, data);
        }
    }
}

/**
 * Emits the call to all of the client sockets currently connected to the server
 *     that are in the game being hosted by host
 * @param host the name of the user hosting this game
 * @param call the name of the call for the socket
 * @param data the JSON to be sent for the call to the client
 */
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

// interactions for the socket object
module.exports = function(socket){
  console.log('a user connected');
  users[userGenNum] = socket;
  socket.username = userGenNum;
  userGenNum++;

  // TODO LOGIN
  socket.on('login', function(username) {
    socket.username = username;
    users[username] = socket;
  });

  /**
   * Gets the name of the username of the client of this socket
   * @return the username of the client to the client
   */
  socket.on('get client name', function() {
    socket.emit('send client name', socket.username);
  })

  /**
   * Disconnects the user from the server
   */
  socket.on('disconnect', function(){
    console.log('user disconnected');
    // TODO logic to quit game and pass it on to next host if he was host
    delete users[socket.username];
  });

  // INSTANT MESSAGING

  /**
   * Accepts a message from a client and dispatches the message to all clients
   *     in the game under the same host
   * @return the message from the sender to people in the game
   */
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    console.log(socket.inGame)
    emitInGame(socket.inGame, 'chat message', socket.username + ": " + msg);
 });

  // HANDLE GAME ACTIONS

  /**
   * Makes the requesting client the host of a new game
   * @return updated list of games to everyone
   */
  socket.on('create game', function() {
    games[socket.username] = {
        "host": socket.username,
        "players": [socket.username]
    }
    // ensure that the name is a string
    socket.inGame = "" + socket.username;
    console.log(socket.username + " created a game");
    emitAll('updated games', games);
  });

  /**
   * Deletes the game being hosted by the sending client and kicks out any people
   *     in the game.
   * @return updating listing of games to everyone
   */
  socket.on('stop hosting game', function() {
    // kick everyone out of the game
    emitInGame(socket.username, 'kick game', {});
    delete games[socket.username];
    emitAll('updated games', games);
    socket.inGame = null;
  });

  /**
   * Joins the game of the host
   * @return updating listing of games to everyone
   */
  socket.on('join game', function(host) {
    games[host]["players"].push(socket.username);
    socket.inGame = host;
    console.log(socket.username + " joined " + host + "'s game");
    emitAll('updated games', games);
  });

  /**
   * Leaves the game of the client is in.
   * @return updating listing of games to everyone
   */
  socket.on('leave game', function() {
    games[socket.inGame]["players"] = games[socket.inGame]["players"].filter(
        function(el) { return el !== socket.username });
    console.log(socket.username + " left " + socket.inGame + "'s game");
    emitAll('updated games', games);
    socket.inGame = null;
  });

  /**
   * Sends the listing of games to the client
   * @return updating listing of games to client
   */
  socket.on('get games', function() {
    socket.emit('updated games', games);
  });

  /**
   * Starts the game and generates the game board
   * @return first start game message to all players in the game, then the actual game data
   *     to all of the players in the game
   */
  socket.on('start game', function() {
    // tell everyone that the game started, do first for minimal lag since next step is intensive
    emitInGame(socket.inGame, 'start game', {});
    // actually populate the game with stuff and make everyone go into the game
    games[socket.inGame] = new Game(games[socket.inGame]);
    console.log("started game");
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  /**
   * Sets the order for the turns for all of the players in the game
   * @return game data with the turn order for all of the players in the game
   */
  socket.on('set order', function() {
    // assign a turn order
    games[socket.inGame].setOrder();
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  /**
   * Rolls the dice for the client
   * @return movement of the piece to all in game, possible actions for the client
   *     to take to the client
   */
  socket.on('roll', function() {
    // TODO check if it is this player's turn
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

  /**
   * Makes the client do a Mr. Monopoly action to go to the nearest unowned
   *     property that is unowned.
   * @return movement of the piece to all in game, possible actions for the client
   *     to take to the client
   */
  socket.on('mrmonopoly', function() {
    // TODO check if it's the client's turn
    games[socket.inGame].unleashMrMonopoly();
    // say something moved
    emitInGame(socket.inGame, 'movement', games[socket.inGame].getData());
    var actions = [];
    var action = games[socket.inGame].executeLocation();
    if(action !== "nothing") {
      actions.push(action);
    }
    emitInGame(socket.inGame, 'actions', actions);
  });

  /**
   * Charges rent to the client based on the information in info
   * @param info JSON object with 2 fields: property (name of the property to charge)
   *     and player (name of the player to pay)
   * @return updated game data with rent charged to client sent to all in game
   */
  socket.on('rent', function(info) {
    games[socket.inGame].payRent(info.property, info.player);
    var message = info.player + " paid rent to " + info.player2;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'rent', games[socket.inGame].getData());
  });

  /**
   * Charges rent to the client based on the information in info
   * @param info JSON object with 6 fields: player1 (name of first player in trade),
   *     player2 (name of second player in trade), properties1  (list of properties
   *     that the first player is trading), properties2 (list of properties that the
   *     the second player is trading), wealth1 (money that first player is trading),
   *     and wealth2 (money that the second player is trading)
   * @return updated game data with the trade committed sent to all in game
   */
  socket.on('trade', function(tradeInfo) {
    games[socket.inGame].trade(info.player1, info.player2, info.properties1, info.properties2, info.wealth1, info.wealth2);
    var message = info.player + " mortgaged " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'trade', games[socket.inGame].getData());
  });

  /**
   * Buys the property for the client
   * @param info JSON object with 4 possible fields: property (name of the property to buy)
   *     player (name of the player buying the property), *optional* auction (true if the
   *     property was auctioned off), *optional* price (price paid for the auctioned property)
   * @return updated game data with property bought by client sent to all in game
   */
  socket.on('buy property', function(info) {
    // different actions if it was auctioned
    if(info.auction) {
        // TODO check this weird thing
        // weird thing where it was deducting twice the price from the player instead of the normal amount...
        games[socket.inGame].buyPropertyAuction(info.property, info.player, info.price/2);
        var message = info.player + " bought " + info.property + " for " + info.price;
        games[socket.inGame].setMessage(message);
    }
    else {
        games[socket.inGame].buyProperty(info.property, info.player);
        var message = info.player + " bought " + info.property;
        games[socket.inGame].setMessage(message);
    }
    emitInGame(socket.inGame, 'property bought', games[socket.inGame].getData());
  });

  /**
   * Buys a house for the property for the client
   * @param info JSON object with 2 fields: property (name of the property to add house to)
   *     player (name of the player buying the house)
   * @return updated game data with house bought by client sent to all in game
   */
  socket.on('buy house', function(info) {
    games[socket.inGame].buyHouse(info.property, info.player);
    var message = info.player + " upgraded " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'update houses', games[socket.inGame].getData());
  });

  /**
   * Sells a house for the property for the client
   * @param info JSON object with 2 fields: property (name of the property to take house from)
   *     player (name of the player selling the house)
   * @return updated game data with house sold by client sent to all in game
   */
  socket.on('sell house', function(info) {
    games[socket.inGame].sellHouse(info.property, info.player);
    var message = info.player + " downgraded " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'update houses', games[socket.inGame].getData());
  });

  /**
   * Mortgages the property for the client
   * @param info JSON object with 2 fields: property (name of the property to mortgage)
   *     player (name of the player mortgaging)
   * @return updated game data with property morgaged sent to all in game
   */
  socket.on('mortgage', function(info) {
    games[socket.inGame].mortgageProperty(info.property, info.player);
    var message = info.player + " mortgaged " + info.property;
    games[socket.inGame].setMessage(message);
    emitInGame(socket.inGame, 'mortgage', games[socket.inGame].getData());
  });

  /**
   * Starts an auction in the game for the property
   * @param property string of property to be put up for auction
   * @return new auction event sent to all in game
   */
  socket.on('up auction', function(property) {
    games[socket.inGame].newAuction();
    emitInGame(socket.inGame, 'new auction', games[socket.inGame].getPropertyInfo(property));
  });

  /**
   * Sets the auction price in the current auction for the client
   * @param price the price for the bid for the client
   * @return updated auction listing of prices if game not over to all in game, otherwise
   *     the winner of the auction to all in game
   */
  socket.on('set auction price', function(price) {
    winner = games[socket.inGame].addBid(socket.username, price);
    emitInGame(socket.inGame, 'new auction price', {"player": socket.username, "price": price});
    if(winner) {
        emitInGame(socket.inGame, 'auction winner', games[socket.inGame].auctionWinner());
    }
  });

  /**
   * Draws a chance card for the client
   * @return updated game data with chance activated for client sent to all in game
   */
  socket.on('draw chance', function() {
    games[socket.inGame].drawChance();
    // TODO
  });

  /**
   * Draws a community chest card for the client
   * @return updated game data with community chest activated for client sent to all in game
   */
  socket.on('draw community chest', function() {
    games[socket.inGame].drawCommunityChest();
    // TODO
  });

  /**
   * Ends the turn for the client
   * @return updated game data with next player's turn sent to all in game
   */
  socket.on('end turn', function() {
    games[socket.inGame].nextTurn();
    console.log(games[socket.inGame].currentPlayer());
    emitInGame(socket.inGame, 'game data', games[socket.inGame].getData());
  });

  /**
   * Gives information about the property
   * @param property the name of the property
   * @return JSON object with information about the property to the client
   */
  socket.on('property info', function(property) {
    socket.emit('property info', games[socket.inGame].getPropertyInfo(property));
  });

  /**
   * Gives rent information about the property
   * @param property the name of the property
   * @return JSON object with rent information about the property to the client
   */
  socket.on('rent info', function(property) {
    socket.emit('rent info', games[socket.inGame].rentOfProperty(property));
  });

  /**
   * Says which property currently charges the highest rent
   * @return JSON object with information about the property with highest rent to the client
   */
  socket.on('highest rent', function() {
    var highest = games[socket.inGame].highestRent();
    socket.emit('highest rent', games[socket.inGame].getPropertyInfo(highest));
  });

  /**
   * Gives information about all of the locations on the board
   * @return list of all locations on the board to the client
   */
  socket.on('all locations', function() {
    socket.emit('all locations', games[socket.inGame].getAllLocations());
  });

  /**
   * Gives information about all unowned location on the board
   * @return list of all unowned locations on the board to the client
   */
  socket.on('all unowned', function() {
    socket.emit('all unowned', games[socket.inGame].getAllUnownedLocations());
  });

  /**
   * Sends the game data to the client
   * @return JSON object with all of the data of the game to the client
   */
  socket.on('request game data', function() {
    console.log("someone wants to get game data");
    socket.emit('game data', games[socket.inGame].getData());
  });
}
