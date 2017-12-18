var api = require('./api');

var users = {};
var userGenNum = 1;
var setup = {};

// interactions for the socket object
module.exports = function(io, socket){
  // console.log('a user connected');
  // users[userGenNum] = socket;
  socket.username = userGenNum;
  userGenNum++;

  /**
   * Makes it so that the socket actually joins the system and sets the username
   * NOTE: other things won't work if this step doesn't happen
   * @return the username of the client to the client
   */
  socket.on('join', function(info) {
    if(info.username) {
        socket.username = info.username
        console.log("Username " + socket.username + " is valid");
        if(users[socket.username]) {
          // TODO do appropriate stuff to the socket to allow reconnection
          // console.log('reconnection')
          console.log("Join in users");
          socket.inGame = users[socket.username];
          socket.join(socket.inGame);
          socket.emit('in room', {"owner": socket.inGame});
          if(!setup[socket.inGame].hasOwnProperty('host')) {
            socket.emit('game data', setup[socket.inGame].toJSON());
          }
        }
      }
    socket.emit('send client name', socket.username);
  })

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
  socket.on('disconnect', function(info){
    // console.log('user disconnected');
    // TODO logic to quit game and pass it on to next host if he was host
    // if(info.leave)
        // delete users[socket.username];
  });

  // INSTANT MESSAGING

  /**
   * Accepts a message from a client and dispatches the message to all clients
   *     in the game under the same host
   * @return the message from the sender to people in the game
   */
  socket.on('chat message', function(msg){
    io.to(socket.inGame).emit('chat message', socket.username + ": " + msg);
 });

  // HANDLE GAME LOGISTICS

  /**
   * Makes the requesting client the host of a new game
   * @return updated list of setup to everyone
   */
  socket.on('create game', function() {
    setup[socket.username] = {
        "host": socket.username,
        "players": [socket.username]
    }
    // ensure that the name is a string
    socket.inGame = "" + socket.username;
    console.log(socket.username + " created a game");
    socket.join(socket.username);
    users[socket.username] = socket.username;
    socket.emit('in room', {"owner": socket.username});
    io.emit('updated games', setup);
  });

  /**
   * Deletes the game being hosted by the sending client and kicks out any people
   *     in the game.
   * @return updating listing of setup to everyone
   */
  socket.on('stop hosting game', function() {
    // kick everyone out of the game
    io.to(socket.inGame).emit('kick game', {});
    delete setup[socket.username];
    io.emit('updated games', setup);
    socket.inGame = null;
  });

  /**
   * Joins the game of the host
   * @return updating listing of setup to everyone
   */
  socket.on('join game', function(host) {
    setup[host]["players"].push(socket.username);
    socket.inGame = host;
    console.log(socket.username + " joined " + host + "'s game");
    socket.join(host);
    users[socket.username] = socket.inGame;
    socket.emit('in room', {"owner": socket.inGame});
    io.emit('updated games', setup);
  });

  /**
   * Leaves the game of the client is in.
   * @return updating listing of setup to everyone
   */
  socket.on('leave game', function() {
    setup[socket.inGame]["players"] = setup[socket.inGame]["players"].filter(
        function(el) { return el !== socket.username });
    console.log(socket.username + " left " + socket.inGame + "'s game");
    io.emit('updated games', setup);
    socket.inGame = null;
  });

  /**
   * Sends the listing of setup to the client
   * @return updating listing of setup to client
   */
  socket.on('get setup', function() {
    socket.emit('updated games', setup);
  });

  /**
   * Starts the game and generates the game board
   * @return first start game message to all players in the game, then the actual game data
   *     to all of the players in the game
   */
  socket.on('start game', function() {
    // tell everyone that the game started, do first for minimal lag since next step is intensive
    io.to(socket.inGame).emit('start game', {});
    // actually populate the game with stuff and make everyone go into the game
    io.to(socket.inGame).emit('game data', api.createGame(socket.inGame, setup[socket.inGame]));
  });


  // ACTUAL GAME ACTIONS

  /**
   * Rolls the dice for the client
   * @return JSON with fields rolled (list of what was rolled), action (list
   *       of actions that the player should perform), movedTo (list of locations
   *       visited), player (JSON with name: name, money: money), and
   *       message (string saying what happened)
   */
  socket.on('roll', function() {
    // TODO check if it is this player's turn
    let json = api.handleRequest(socket.inGame, socket.username, 'roll', {});
    if(json['actions'].includes('draw bus pass')) {
      const i = json['actions'].indexOf('draw bus pass');
      json['actions'] = json['actions'].splice(i, 1);
      io.to(socket.inGame).emit('draw bus pass', api.handleRequest(socket.inGame, socket.username, 'draw bus pass', {}));
    }
    io.to(socket.inGame).emit('movement', json);
  });

  /**
   * Makes the client do a Mr. Monopoly action to go to the nearest unowned
   *     property that is unowned.
   * @return JSON with fields action (list of actions that the player should perform),
   *       movedTo (list of locations visited), player (JSON with name: name, money: money), and
   *       message (string saying what happened)
   */
  socket.on('mrmonopoly', function() {
    // TODO check if it's the client's turn
    io.to(socket.inGame).emit('movement', api.handleRequest(socket.inGame, socket.username, 'mrmonopoly', {}));
  });

  /**
   * Handles a jail turn for the player
   * @param JSON with field pay (boolean of whether player is paying to leave jail)
   * @return JSON with fields actions (list of actions that the player should perform), 
   *       player (JSON with name: name, money: money), and
   *       message (string saying what happened)
   */
  socket.on('jail', function(info) {
    // TODO check if it is this player's turn
    io.to(socket.inGame).emit('jail', api.handleRequest(socket.inGame, socket.username, 'jail', info));
  });

  /**
   * The client teleports to the specified location
   * @param JSON with field location (place to move to)
   *
   * @return JSON with fields action (list of actions that the player should perform),
   *       movedTo (list of locations visited), player (JSON with name: name, money: money), and
   *       message (string saying what happened)
   */
  socket.on('teleport', function(info) {
    // TODO check if it's the client's turn
    io.to(socket.inGame).emit('movement', api.handleRequest(socket.inGame, socket.username, 'teleport', info));
  });

  /**
   * Charges rent to the client based on the information in info
   * @return JSON with field message (string saying what happened) and
   *       player/owner (name: name, money: money)
   */
  socket.on('rent', function() {
    io.to(socket.inGame).emit('rent', api.handleRequest(socket.inGame, socket.username, 'rent', info));
  });

  /**
   * Handles the player using a taxi ride
   * @param info JSON with field location (location to ride to)
   * @return JSON with fields player1/player2? (JSON with name: name, money: money),
   *       pool (money in pool), message (string saying what happened), and location
   */
  socket.on('taxi', function(info) {
    io.to(socket.inGame).emit('taxi', api.handleRequest(socket.inGame, socket.username, 'taxi', info));
  });

  /**
   * Handles the player riding the bus
   * @param info JSON with fields pass (name of bus pass) and location (location to ride to)
   * @return JSON with fields movedTo (list of locations visited), actions (list
   *       of actions that the player should perform), player (JSON with name: name, money: money),
   *       and message (string saying what happened)
   */
  socket.on('bus', function(info) {
    // TODO check current player
    io.to(socket.inGame).emit('movement', api.handleRequest(socket.inGame, socket.username, 'bus', info));
  });

  /**
   * Executes a trade with the player specified in info under info's conditions.
   * @param info JSON object with 6 fields: player1 (name of first player in trade),
   *     player2 (name of second player in trade), properties1  (list of properties
   *     that the first player is trading), properties2 (list of properties that the
   *     the second player is trading), wealth1 (money that first player is trading),
   *     and wealth2 (money that the second player is trading)
   * @return JSON with fields player1/player2 (subfields name, money, and properties
   *      (list of string names of properties that the player now has)) and message
   */
  socket.on('trade', function(info) {
    io.to(socket.inGame).emit('trade', api.handleRequest(socket.inGame, socket.username, 'trade', info));
  });

  /**
   * Buys the property for the client
   * @param info JSON with fields player (name of player), location (name of location),
   *      price (price for the property) **only if auction**
   * @return updated game data with property bought by client sent to all in game
   */
  socket.on('buy', function(info) {
    io.to(socket.inGame).emit('property bought', api.handleRequest(socket.inGame, socket.username, 'buy', info));
  });

  /**
   * Sets houses to specific amounts on properties for the client.
   * @param info JSON key property to preferred number of houses
   * @return updated game data with house bought by client sent to all in game
   */
  socket.on('set houses', function(info) {
    io.to(socket.inGame).emit('update houses', api.handleRequest(socket.inGame, socket.username, 'set houses', info));
  });

  /**
   * Mortgages the properties for the client
   * @param info list of strings of property names to mortgage
   * @return JSON with fields player (name: name, money: money), locations (list of successfully
   *      mortgaged locations), gain (money gained from mortgaging), message (saying
   *      what happened).
   */
  socket.on('mortgage', function(info) {
    // TODO check current player
    io.to(socket.inGame).emit('mortgage', api.handleRequest(socket.inGame, socket.username, 'mortgage', info));
  });

  /**
   * Unmortgages the properties for the client
   * @param info list of strings of property names to unmortgage
   * @return JSON with fields player (name: name, money: money), locations (list of successfully
   *      unmortgaged locations), gain (money lost from unmortgaging), message (saying
   *      what happened).
   */
  socket.on('unmortgage', function(info) {
    // TODO check current player
    io.to(socket.inGame).emit('unmortgage', api.handleRequest(socket.inGame, socket.username, 'unmortgage', info));
  });

  /**
   * Starts an auction in the game for the property
   * @param property string of property to be put up for auction
   * @return new auction event sent to all in game with JSON of relevant property information
   */
  socket.on('up auction', function(property) {
    io.to(socket.inGame).emit('new auction', api.handleRequest(socket.inGame, socket.username, 'buy', {location: property}));
  });

  /**
   * Sets the auction price in the current auction for the client
   * @param price the price for the bid for the client
   * @return the winner of the auction to all in game if there is a winner
   */
  socket.on('set auction price', function(price) {
    let winnerInfo = api.handleRequest(socket.inGame, socket.username, 'set auction price', {price: price});
    if(winnerInfo) {
        io.to(socket.inGame).emit('auction winner', winnerInfo);
    }
  });

  /**
   * Draws a fortune card for the client
   * @return JSON with field message (string saying what happened),
   *       player (name: name), card (title, description, short, play),
   *       actions (list of actions for the current player)
   */
  socket.on('draw fortune', function() {
    // TODO immediately
    socket.emit('special card', api.handleRequest(socket.inGame, socket.username, 'draw fortune', {}));
  });

  /**
   * Draws a misfortune card for the client
   * @return JSON with field message (string saying what happened),
   *       player (name: name), and card (title, description, short, play)
   *       actions (list of actions for the current player)
   */
  socket.on('draw misfortune', function() {
    // TODO immediately
    socket.emit('special card', api.handleRequest(socket.inGame, socket.username, 'draw misfortune', {}));
  });

  /**
   * Uses a fortune/misfortune card
   * @return TODO
   */
  socket.on('use special card', function(card) {
    socket.emit('special card used', api.handleRequest(socket.inGame, socket.username, 'use special card', {card: card}));
  });

  /**
   * Performs a roll3 action.
   * @return JSON with fields message (string saying what happened),
   *       player (name: name, money: amt), card (list of numbers to match),
   *       and rolled (list of numbers that were rolled)
   */
  socket.on('roll3', function() {
    io.to(socket.inGame).emit('roll3', api.handleRequest(socket.inGame, socket.username, 'roll3', {}));
  });

  /**
   * Performs a squeeze play action.
   * @return JSON with fields message (string saying what happened),
   *       players (list of {name: name, money: amt}),
   *       and rolled (list of numbers that were rolled)
   */
  socket.on('squeeze', function() {
    io.to(socket.inGame).emit('squeeze', api.handleRequest(socket.inGame, socket.username, 'squeeze', {}));
  });

  /**
   * Ends the turn for the client
   * @return JSON with field message (string saying what happened), player (name of current player),
   *       and actions (list of actions that the player can do)
   */
  socket.on('end turn', function() {
    // TODO check if correct player
    io.to(socket.inGame).emit('next turn', api.handleRequest(socket.inGame, socket.username, 'end turn', {}));
  });

  /**
   * Get actions for the player.
   * @param info JSON with field player (name of player)
   * @return JSON with field actions (list of actions)
   */
  socket.on('get actions', function(info) {
    io.to(socket.inGame).emit('actions', api.handleRequest(socket.inGame, socket.username, 'get actions', info));
  });

  /**
   * Gives information about the property
   * @param property the name of the property
   * @return JSON object with information about the property to the client
   */
  socket.on('property info', function(property) {
    socket.emit('property info', api.handleRequest(socket.inGame, socket.username, 'property info', {location: property}));
  });

  /**
   * Gives rent information about the property
   * @param property the name of the property
   * @return JSON object with rent information about the property to the client
   */
  socket.on('rent info', function(property) {
    socket.emit('rent info', api.handleRequest(socket.inGame, socket.username, 'rent info', {location: property}));
  });

  /**
   * Says which property currently charges the highest rent
   * @return JSON object with information about the property with highest rent to the client
   */
  socket.on('highest rent', function() {
    socket.emit('highest rent', api.handleRequest(socket.inGame, socket.username, 'highest rent', {}));
  });

  /**
   * Gives information about all of the locations on the board
   * @return list of all locations on the board to the client
   */
  socket.on('all locations', function() {
    socket.emit('all locations', api.handleRequest(socket.inGame, socket.username, 'all locations', {}));
  });

  /**
   * Gives information about all unowned location on the board
   * @return list of all unowned locations on the board to the client
   */
  socket.on('all unowned', function() {
    socket.emit('all unowned', api.handleRequest(socket.inGame, socket.username, 'all unowned', {}));
  });

  /**
   * Sends the game data to the client
   * @return JSON object with all of the data of the game to the client
   */
  socket.on('request game data', function() {
    console.log("someone wants to get game data");
    socket.emit('game data', api.handleRequest(socket.inGame, socket.username, 'request game data', {}));
  });
}
