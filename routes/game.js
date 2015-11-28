var board = require('./board.js');

// object that we will export
var game = {};

game.initializeBoard = function(gameData) {
	// changes a player from just a string to an actual player
	for(var index in gameData["players"]) {
		var newPlayer = {};
		newPlayer.name = gameData["players"][index];
		newPlayer.money = 3200;
		newPlayer.property = [];
		newPlayer.busTickets = [];
		newPlayer.getOutOfJails = 0;
		newPlayer.location = "go"; // all players start on go

		gameData["players"][index] = newPlayer;
	}

	// load unowned properties with properties from the board
	gameData["owned"] = {};

	for(var spot in board) {
		if(spot["type"] === "property" || spot["type"] === "transportation" || 
			spot["type"] === "utility") {
			gameData["owned"][spot] = false;
		}
	}

	// set house, hotel, skyscraper presets
	gameData["houses"] = 81;
	gameData["hotels"] = 31;
	gameData["skyscrapers"] = 16;

	// this will be set after the starting phase
	gameData["turnOrder"] = [] // has the players in order of their turns
	gameData["turnIndex"] = 0; // 0 <= turnIndex < gameData["turnOrder"].length
	gameData["doubleCount"] = 0; // reset to 0 at the beginning of a new turn
}

game.rollDice = function(currentLocation, forward) {
	// many things here TODO
}

var mrMonopolyLocation = function(currentLocation, odd, forward) {
	var next = nextLocation(currentLocation, forward);
}

var moveLocation = function(currentLocation, moves, odd, forward) {
	var moneyGained = 0;
	var location = currentLocation;
	var movesLeft = moves;
	var locationsMovedTo = [];

	while(movesLeft > 0) {
		location = nextLocation(location, odd, forward);
		locationsMovedTo.push(location);
		movesLeft--;

		// special cases about locations
		// gaining pay locations
		if(location == "go") {
			moneyGained += 200;
		}
		else if(location == "pay day") {
			if(odd) {
				moneyGained += 300;
			}
			else {
				moneyGained += 400;
			}
		}
		else if(location == "bonus") {
			if(movesLeft == 0) {
				moneyGained += 300;
			}
			else {
				moneyGained += 250;
			}
		}
		// tunnels
		else if(location == "holland tunnel ne") {
			location = "holland tunnel sw";
			locationsMovedTo.push(location);
		}
		else if(location == "holland tunnel sw") {
			location = "holland tunnel ne";
			locationsMovedTo.push(location);
		}
	}

	var json = {};
	json.moneyGained = moneyGained;
	json.currentLocation = location;
	json.movedTo = locationsMovedTo;
	return json;
}

// returns the next location in whatever the forward direction is
var nextLocation = function(currentLocation, odd, forward) {
	var direction = "backward";

	if(forward) {
		direction = "forward";
	}

	var next = board[currentLocation][direction];
	var upperTrack = isUpperTrack(currentLocation);
	// handles railroad case
	if(board[currentLocation]["type"] == "railroad") {
		if(odd && upperTrack) {
			return next[0];
		}
		else if(odd || upperTrack) {
			return next[1];
		}
		else {
			return next[0];
		}
	}
	// just a normal location
	else {
		return next[0];
	}
}


// returns true if it is the upper track
// 		precondition: only for spaces around a railroad
var isUpperTrack = function(location) {
	var upper = {"biscayne ave", "reverse", "fifth ave", "newbury st", "atlantic ave", 
		"illinois ave", "oriental ave", "income tax"};
	if(upper[location]) {
		return true;
	}
	else {
		return false;
	}
}

var executeLocation = function(currentLocation, gameData) {

}

var jumpLocation = function(newLocation) {
	// pretend to be moving onto that location from one step behind to not have to rewrite ccode
	oldLocation = newLocation["backward"][0];
	return moveLocation(oldLocation, 1, true, true);
}

var ownsMajority = function(color, player) {
	// might want to store some data structure to save calculation
}

var taxiRide = function() {

}

var useBusTicket = function() {
	// many special cases
}

var buyProperty = function(property, player, gameData) {
	gameData["owned"][property] = true;
	gameData["players"][player][property].push({
		"name": property, 
		"houses": 0,
		"mortgaged": false});
	// properties cost twice the mortgage price
	gameData["players"][player]["money"] -= 2*board["property"]["mortgage"];
}

var mortgageProperty = function(property, player) {

}

var buyHouse = function(property, player) {

}

var sellHouse = function(property, player) {

}

var trade = function(player1, player2, properties1, properties2, wealth1, wealth2) {

}
























module.exports = game;