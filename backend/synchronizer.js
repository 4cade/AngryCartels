var Game = require('./game');

var users = {};
var userGenNum = 1;
var games = {};

// interactions for the socket object
module.exports = function(io, socket){
  console.log('a user connected');
  // users[userGenNum] = socket;
  socket.username = userGenNum;
  userGenNum++;

  /**
   * Makes it so that the socket actually joins the system and sets the username
   * NOTE: other things won't work if this step doesn't happen
   * @return the username of the client to the client
   */
  socket.on('join', function(info) {
    console.log(info)
    if(info.username)
        socket.username = info.username
        if(users.hasOwnProperty(socket.username)) {
          // TODO do appropriate stuff to the socket to allow reconnection
        }
        users[socket.username] = socket
        console.log(socket.username)
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
    console.log('user disconnected');
    // TODO logic to quit game and pass it on to next host if he was host
    if(info.leave)
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
    io.to(socket.inGame).emit('chat message', socket.username + ": " + msg);
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
    socket.join(socket.username);
    io.emit('updated games', games);
  });

  /**
   * Deletes the game being hosted by the sending client and kicks out any people
   *     in the game.
   * @return updating listing of games to everyone
   */
  socket.on('stop hosting game', function() {
    // kick everyone out of the game
    io.to(socket.inGame).emit('kick game', {});
    delete games[socket.username];
    io.emit('updated games', games);
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
    socket.join(host);
    io.emit('updated games', games);
  });

  /**
   * Leaves the game of the client is in.
   * @return updating listing of games to everyone
   */
  socket.on('leave game', function() {
    games[socket.inGame]["players"] = games[socket.inGame]["players"].filter(
        function(el) { return el !== socket.username });
    console.log(socket.username + " left " + socket.inGame + "'s game");
    io.emit('updated games', games);
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
    io.to(socket.inGame).emit('start game', {});
    // actually populate the game with stuff and make everyone go into the game
    games[socket.inGame] = new Game(games[socket.inGame]);
    io.to(socket.inGame).emit('game data', games[socket.inGame].toJSON());
  });

  /**
   * Rolls the dice for the client
   * @return JSON with fields rolled (list of what was rolled), action (list
   *       of actions that the player should perform), movedTo (list of locations
   *       visited), player (JSON with name: name, money: money), and
   *       message (string saying what happened)
   */
  socket.on('roll', function() {
    // TODO check if it is this player's turn
    io.to(socket.inGame).emit('movement', games[socket.inGame].rollDice());
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
    io.to(socket.inGame).emit('movement', games[socket.inGame].unleashMrMonopoly());
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
    io.to(socket.inGame).emit('jail', games[socket.inGame].handleJail(info.pay));
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
    io.to(socket.inGame).emit('movement', games[socket.inGame].teleport(info.location));
  });

  /**
   * Charges rent to the client based on the information in info
   * @return JSON with field message (string saying what happened) and
   *       player/owner (name: name, money: money)
   */
  socket.on('rent', function() {
    io.to(socket.inGame).emit('rent', games[socket.inGame].payRent());
  });

  /**
   * Handles the player using a taxi ride
   * @param info JSON with field location (location to ride to)
   * @return JSON with fields player1/player2? (JSON with name: name, money: money),
   *       pool (money in pool), message (string saying what happened), and location
   */
  socket.on('taxi', function(info) {
    io.to(socket.inGame).emit('taxi', games[socket.inGame].taxiRide(info.location));
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
    io.to(socket.inGame).emit('movement', games[socket.inGame].useBusPass(info.pass, info.location));
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
  socket.on('trade', function(tradeInfo) {
    io.to(socket.inGame).emit('trade', json = games[socket.inGame].trade(info));
  });

  /**
   * Buys the property for the client
   * @param info JSON with fields player (name of player), location (name of location),
   *      price (price for the property) **only if auction**
   * @return updated game data with property bought by client sent to all in game
   */
  socket.on('buy property', function(info) {
    let json = {}
    // different actions if it was auctioned
    if(info)
        json = games[socket.inGame].buyPropertyAuction(info);
    else
        json = games[socket.inGame].buyProperty();
    io.to(socket.inGame).emit('property bought', json);
  });

  /**
   * Sets houses to specific amounts on properties for the client.
   * @param info JSON key property to preferred number of houses
   * @return updated game data with house bought by client sent to all in game
   */
  socket.on('set houses', function(info) {
    let json = games[socket.inGame].buyHouse(info);

    io.to(socket.inGame).emit('update houses', json);
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
    io.to(socket.inGame).emit('mortgage', json = games[socket.inGame].mortgageProperty(info));
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
    io.to(socket.inGame).emit('unmortgage', json = games[socket.inGame].unmortgageProperty(info));
  });

  /**
   * Starts an auction in the game for the property
   * @param property string of property to be put up for auction
   * @return new auction event sent to all in game with JSON of relevant property information
   */
  socket.on('up auction', function(property) {
    games[socket.inGame].startAuction(property);
    io.to(socket.inGame).emit('new auction', games[socket.inGame].getPropertyInfo(property));
  });

  /**
   * Sets the auction price in the current auction for the client
   * @param price the price for the bid for the client
   * @return the winner of the auction to all in game if there is a winner
   */
  socket.on('set auction price', function(price) {
    games[socket.inGame].addBid(socket.username, price);
    
    let winnerInfo = games[socket.inGame].finishAuction();
    if(winnerInfo) {
        io.to(socket.inGame).emit('auction winner', winnerInfo);
    }
  });

  /**
   * Draws a chance card for the client
   * @return JSON with field message (string saying what happened),
   *       player (name: name), and card (title, description, short, play)
   */
  socket.on('draw chance', function() {
    let card = games[socket.inGame].drawChance();
    // TODO immediately
    socket.emit('special card', card);
  });

  /**
   * Draws a community chest card for the client
   * @return JSON with field message (string saying what happened),
   *       player (name: name), and card (title, description, short, play)
   */
  socket.on('draw community chest', function() {
    let card = games[socket.inGame].drawCommunityChest();
    // TODO immediately
    socket.emit('special card', card);
  });

  /**
   * Uses a chance/community chest card
   * @return TODO
   */
  socket.on('use special card', function(card) {
    let json = games[socket.inGame].useSpecialCard(socket.username, card);
    // TODO
    socket.emit('special card used', json);
  });

  /**
   * Performs a roll3 action.
   * @return JSON with fields message (string saying what happened),
   *       player (name: name, money: amt), card (list of numbers to match),
   *       and rolled (list of numbers that were rolled)
   */
  socket.on('roll3', function() {
    io.to(socket.inGame).emit('roll3', games[socket.inGame].roll3());
  });

  /**
   * Performs a squeeze play action.
   * @return JSON with fields message (string saying what happened),
   *       players (list of {name: name, money: amt}),
   *       and rolled (list of numbers that were rolled)
   */
  socket.on('squeeze', function() {
    io.to(socket.inGame).emit('squeeze', games[socket.inGame].squeezePlay());
  });

  /**
   * Ends the turn for the client
   * @return JSON with field message (string saying what happened), player (name of current player),
   *       and actions (list of actions that the player can do)
   */
  socket.on('end turn', function() {
    // TODO check if correct player
    io.to(socket.inGame).emit('next turn', games[socket.inGame].nextTurn());
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
    socket.emit('rent info', games[socket.inGame].getRent(socket.username, property));
  });

  /**
   * Says which property currently charges the highest rent
   * @return JSON object with information about the property with highest rent to the client
   */
  socket.on('highest rent', function() {
    let property = games[socket.inGame].getHighestRent()
    socket.emit('highest rent', games[socket.inGame].getPropertyInfo(property));
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
    socket.emit('game data', games[socket.inGame].toJSON());
  });
}
