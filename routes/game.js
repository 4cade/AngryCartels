var board = require('./board.js');

// object that we will export
var game = {};

/**
*
*
*/
game.initializeBoard = function(gameData) {
	// changes a player from just a string to an actual player
	for(var index in gameData["players"]) {
		var newPlayer = {};
		newPlayer.name = gameData["players"][index];
		newPlayer.money = 3200;
		newPlayer.property = [];
		newPlayer.busTickets = [];
		newPlayer.getOutOfJails = 0;
		newPlayer.forward = true;
		newPlayer.location = "go"; // all players start on go

		gameData["players"][index] = newPlayer;
	}

	// load unowned properties with properties from the board
	gameData["owned"] = {};
	gameData["color"] = {};

	for(var spot in board) {
		if(board[spot]["type"] === "property" || board[spot]["type"] === "transportation" || 
			board[spot]["type"] === "utility") {
			// set spot name in the data to false to represent unowned
			gameData["owned"][spot] = false;

			// data structure for handling majorities
			if(!gameData["color"][spot["quality"]]) {
				gameData["color"][spot["quality"]] = [];

				// houses should always be [0,4], hotel should only be true if houses == 4,
				//		skyscraper should only be true if hotel == true
				gameData["color"][spot["quality"]].push({
					"property" = spot,
					"owner" = null,
					"houses" = 0,
					"hotel" = false,
					"skyscraper" = false
				});
			}
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

/**
*
*
*/
game.rollDice = function(gameData) {
	// many things here TODO
}

/**
*
*
*/
var mrMonopolyLocation = function(currentLocation, odd, forward) {
	var next = nextLocation(currentLocation, forward);
}

/**
*
*
*/
var moveLocation = function(currentLocation, moves, odd, forward) {
	var moneyGained = 0;
	var location = currentLocation;
	var movesLeft = moves;
	var locationsMovedTo = [];
	railroad = null; // true if on upper track for a railroad

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

	// special case = finish on railroad
	if(board[location] == "railroad") {
		var upper = isUpperTrack(locationsMovedTo[locationsMovedTo.length-2]);
		if((upper && odd) || (!upper && !odd)) {
			railroad = true;
		}
		else {
			railroad = false;
		}
	}

	var json = {};
	json.moneyGained = moneyGained;
	json.currentLocation = location;
	json.movedTo = locationsMovedTo;
	json.railroad = railroad;
	return json;
}

/**
* returns the next location in whatever the forward direction is
*
*/
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

/**
* precondition: only for spaces around a railroad
* returns true if it is the upper track
*/
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

/**
*
*
*/
var executeLocation = function(currentLocation, gameData) {
	// TODO
}

/**
*
*
*/
var jumpLocation = function(newLocation) {
	// pretend to be moving onto that location from one step behind to not have to rewrite ccode
	oldLocation = newLocation["backward"][0];
	return moveLocation(oldLocation, 1, true, true);
}

/**
*
*
*/
var ownsMajority = function(color, player) {
	var colorData = gameData["color"][color];

	var count = 0;

	for(var i = 0; i < colorData.length; i++) {
		if(colorData[i]["owner"] === player) {
			count += 1;
		}
	}

	return count >= colorData.length;
}

/**
*
*
*/
var nextToAdd = function(color, property, player) {
	var colorData = gameData["color"][color];

	var maxHouse = 0;

	// first determine highest number of houses, hotel(5), or skyscraper(6)
	for(var i = 0; i < colorData.length; i++) {
		if(colorData[i]["owner"] === player) {
			if(colorData[i]["skyscraper"] && maxHouse < 6) {
				maxHouse = 6;
			}
			else if(colorData[i]["hotel"] && maxHouse < 5) {
				maxHouse = 5;
			}
			else if(colorData[i]["houses"] > maxHouse) {
				maxHouse = colorData[i]["houses"];
			}
		}
	}

	// now check which properties are valid to add houses (or bigger) to
	var nextAdditions = [];
	var sameMax = true;

	// use a while loop just in case need to start additions over
	var index = 0;
	while(i < colorData.length) {
		i++; // increment so it doesn't continue forever

		// TODO condense these if statements together
		if(colorData[i]["owner"] === player) {
			if(colorData[i]["houses"] == maxHouse-1) {
				// this means that there is an imbalance with the properties and it should be accounted for
				if(sameMax) {
					sameMax = false;
					i = 0;
					nextAdditions = [];
				}
				else {
					nextAdditions.push(colorData[i]["property"]);
				}				
			}
			else if(colorData[i]["houses"] == maxHouse && sameMax) {
				nextAdditions.push(colorData[i]["property"]);
			}
			else if(colorData[i]["hotel"] && maxHouse == 5 && sameMax) {
				nextAdditions.push(colorData[i]["property"]);
			}
			else if(colorData[i]["hotel"] && maxHouse == 6) {
				// this means that there is an imbalance with the properties and it should be accounted for
				if(sameMax) {
					sameMax = false;
					i = 0;
					nextAdditions = [];
				}
				else {
					nextAdditions.push(colorData[i]["property"]);
				}	
			}
			else if(colorData[i]["skyscraper"] && maxHouse == 6 && sameMax) {
				nextAdditions.push(colorData[i]["property"]);
			}
		}
	}

	return nextAdditions;
}

/**
*
*
*/
var taxiRide = function() {

}

/**
*
*
*/
var useBusTicket = function() {
	// many special cases
}

/**
*
*
*/
var buyProperty = function(property, player, gameData) {
	gameData["owned"][property] = true;
	gameData["players"][player][property].push({
		"name": property, 
		"houses": 0,
		"mortgaged": false});
	// properties cost twice the mortgage price
	gameData["players"][player]["money"] -= 2*board[property]["mortgage"];
	return gameData;
}

/**
* 
*
*/
var mortgageProperty = function(property, player, gameData) {
	if(!gameData["players"][player][property]["mortgaged"]) {
		gameData["players"][player][property]["mortgaged"] = true;
		gameData["players"][player][money] += board[property]["mortgage"];
	}
	return gameData;
	
}

/**
*
*
*/
var buyHouse = function(property, player, gameData) {
	var color = board["property"]["quality"];
	var nextAdditions = nextToAdd(color, property, player);

	var inAdditions = false;

	for(var i = 0; i < nextAdditions.length; i++) {
		if(nextAdditions[i] === property) {
			inAdditions = true;
		}
	}

	if(ownsMajority(color, player) && inAdditions) {
		// find property and increment the houses
		for(var j = 0; j < gameData["players"][player][property].length; j++) {
			if(gameData["players"][property][i]["name"] === property) {
				gameData["players"][player][property][i["houses"] += 1;

			}
		}

		
	}
}

/**
*
*
*/
var sellHouse = function(property, player, gameData) {

}

/**
*
*
*/
var trade = function(player1, player2, properties1, properties2, wealth1, wealth2, gameData) {

}
























module.exports = game;