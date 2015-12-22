var board = require('./board.js');

// object that we will export
var game = {};

/**
* Create the defaults for the game to begin and commence in way for this file to handle.
*	This heavily mutates gameData.
* @param gameData the original data used for the game.
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
		newPlayer.railroad = null;
		newPlayer.track = "middle";

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

	gameData["freeParking"] = 0;

	// set house, hotel, skyscraper presets
	gameData["houses"] = 81;
	gameData["hotels"] = 31;
	gameData["skyscrapers"] = 16;

	// this will be set after the starting phase
	gameData["turnOrder"] = []; // has the players in order of their turns
	gameData["turnIndex"] = 0; // 0 <= turnIndex < gameData["turnOrder"].length
	gameData["doubleCount"] = 0; // reset to 0 at the beginning of a new turn
	gameData["issues"] = [];
}

/**
* Handles the entire turn of when the user chooses to roll the dice by moving the current 
*	 player to wherever the dice puts him/her and indicates the next action.
* @param gameData the JSON of the game
* @return an object where "gameData" maps to gameData and "action" maps to what should
*	 happen next
*/
game.rollDice = function(gameData) {
	// many things here TODO
	var die1 = 0; // TODO random number [1,6]
	var die2 = 0; // TODO random number [1,6]
	var specialDie = 0; // TODO random number [1,6]

	var diceTotal = die1 + die2;
	var special = "";
	// handle specialDie first TODO look up frequencies of everything
	if(specialDie == "mrmonopoly") {
		special = "mrmonopoly";
	}
	else if(specialDie == "moves") {
		diceTotal += specialDie;
	}
	else {
		special = "gainbusticket"
	}
	var odd = diceTotal % 2 !== 0;

	var player = gameData["players"][gameData["turnOrder"][gameData["turnIndex"]]];

	var moveInfo = moveLocation(player.location, diceTotal, odd, player.forward, player.railroad);

	// TODO set moveInfo to update player

	if(special === "mrmonopoly") {
		var moveInfo = mrMonopolyLocation(player.location, odd, player.forward, player.railroad);
		// TODO handle new moveInfo
	}
	else if(special === "gainbusticket") {
		// TODO gain a bus ticket
	}
}

/**
* Moves the user to the next unowned property in the forward direction, or
*	 not at all if there are no unowned properties in the forward path
* @param currentLocation the location the player is on
* @param odd true if if the sum of dice is odd
* @param forward true if the player is moving forward
@ @param railroad true if the player is on the upperTrack for a railroad (innermost)
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	a boolean specifying if the user is on the upper or lower track of a railroad, and an array
* 	of all of the locations visited in order in case an animation would like to have that 
*/
var mrMonopolyLocation = function(currentLocation, odd, forward, railroad) {
	var next = nextLocation(currentLocation, forward, railroad);
	// TODO
}

/**
* Moves the current player the number of spaces specified in moves and returns relevant
* 	data about what occurred during the movement
*
* @param currentLocation the current location that the moving player is at
* @param moves the number of times the player can move
* @param odd true if the dice roll was odd
* @param forward true if the player is moving forward
* @param railroad true if the player is on the upperTrack for a railroad (innermost)
* 
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	a boolean specifying if the user is on the upper or lower track of a railroad, and an array
* 	of all of the locations visited in order in case an animation would like to have that 
*/
var moveLocation = function(currentLocation, moves, odd, forward, railroad) {
	var moneyGained = 0;
	var location = currentLocation;
	// TODO I think this might break if the player starts on a railroad
	var movesLeft = moves;
	var locationsMovedTo = [];

	while(movesLeft > 0) {
		location = nextLocation(location, odd, forward, railroad);
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
* Returns the next location in whatever the forward direction is
* @param currentLocation the current location of the player
* @param odd true if the dice roll was odd or even
* @param forward true if the player is moving in the forward direction
* @param railroad true if the player is on the upperTrack for a railroad (innermost)
* @return the next location that the user is going to go to
*/
var nextLocation = function(currentLocation, odd, forward, railroad) {
	var direction = "backward";

	if(forward) {
		direction = "forward";
	}

	var next = board[currentLocation][direction];
	var upperTrack = isUpperTrack(currentLocation) || railroad;
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
* Specifies if the location is along an upper track next to a railroad
* 	precondition: only for spaces around a railroad
*
* @param location the location to check if it is on an upper track
*
* @return true if it is the upper track
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
* Specifies what kind of action should occur on the current location that was landed on.
*
* @param currentLocation the location that we want the action for
* @param gameData the JSON of the game
*
* @return // TODO maybe a String indicating what kind of action should occur?
*/
var executeLocation = function(currentLocation, gameData) {
	// TODO
}

/**
* Performs the task of teleporting to some location on the board.
* @param newLocation the location that the player wants to move to
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	a boolean specifying if the user is on the upper or lower track of a railroad, and an array
* 	of all of the locations visited in order in case an animation would like to have that 
*/
var jumpLocation = function(newLocation) {
	// pretend to be moving onto that location from one step behind to not have to rewrite code
	oldLocation = newLocation["backward"][0];
	return moveLocation(oldLocation, 1, true, true);
}

/**
* Mutates the gameData's color field to correctly calculate house balance.
* @param color the color of the property
* @param property the property you're changing the houses for
* @param houseNumber the number of houses you want (5 for hotels, 6 for skyscapers)
* @param gameData the JSON of the game
*/
var setHouseNumberForProperty = function(color, property, houseNumber, gameData) {
	var colorData = gameData["color"][color];

	for(var i = 0; i < colorData.length; i++) {
		if(colorData[i]["property"] === property) {
			if(houseNumber === 6) {
				colorData[i]["skyscraper"] = true;
				colorData[i]["hotel"] = true;
				colorData[i]["houses"] = 4;
			}
			else if(houseNumber === 5) {
				colorData[i]["skyscraper"] = false;
				colorData[i]["hotel"] = true;
				colorData[i]["houses"] = 4;
			}
			else {
				colorData[i]["skyscraper"] = false;
				colorData[i]["hotel"] = false;
				colorData[i]["houses"] = houseNumber;
			}
		}
	}

}

/**
* Checks if the specified player owns the majority of the color
* @param color the color of the majority to check
* @param player the player to check if he owns the majority of the color
* @return true if the player owns the majority of the color.
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
* Checks if the specified player owns all of the color
* @param color the color to check
* @param player the player to check if he owns all of the color
* @return true if the player owns the all of the properties of the color.
*/
var ownsAll = function(color, player) {
	var colorData = gameData["color"][color];

	var count = 0;

	for(var i = 0; i < colorData.length; i++) {
		if(colorData[i]["owner"] === player) {
			count += 1;
		}
	}

	return count === colorData.length;
}

/**
* Determines which properties in the color set need to gain houses (hotels, skyscrapers)
* 	in order to fill up the set evenly.
* Precondition: does not determine if the player has a majority or all, assumes that that
*	is taken care of elsewhere.
* @param color a String color that is the set we're checking
* @param player the player that wants to add a property
* @return an array of the properties that should be fixed up next
*/
var nextToAdd = function(color, player) {
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
			// cannot make more additions if it is already at the skyscraper level
		}
	}

	return nextAdditions;
}

/**
* TODO
*
*/
var taxiRide = function() {

}

/**
* TODO
*
*/
var useBusTicket = function(action, gameData) {
	// many special cases
}

/**
* Mutates gameData to give the player the property, with any side implications.
* @param property the property to buy
* @param player the player that is making the purchase
* @param gameData the JSON of the game
* @return the modified gameData with any issues stored in the issues field
*/
var buyProperty = function(property, player, gameData) {
	gameData["owned"][property] = player;
	gameData["players"][player][property].push({
		"name": property, 
		"houses": 0,
		"mortgaged": false});
	var colorData = gameData["color"][board[property]["quality"]];

	for(var i = 0; i < colorData.length; i++) {
		if(colorData[i]["property"] === property) {
			"owner" = player;
		}
	}
	// properties cost twice the mortgage price
	gameData["players"][player]["money"] -= 2*board[property]["mortgage"];
	return gameData;
}

/**
* Causes the property to be mortgaged so rent cannot be charged.
*	Precondition: house balance is already maintained
* @param property the property to mortgage
* @param the player that wants to mortgage such property
* @param gameData the JSON of the game
* @return gameData with the property mortgaged.
*/
var mortgageProperty = function(property, player, gameData) {
	if(!gameData["players"][player][property]["mortgaged"]) {
		gameData["players"][player][property]["mortgaged"] = true;
		gameData["players"][player][money] += board[property]["mortgage"];
	}
	return gameData;
	
}

/**
* Simulates the player buying a house on a property (also works for hotels/skyscrapers)
* @param property the property to buy a house on
* @param the player that wants to buy the house
* @param gameData the JSON of the game
* @return gameData with changes to the player's data if the house was able to be bought
*/
var buyHouse = function(property, player, gameData) {
	var color = board["property"][property]["quality"];
	var nextAdditions = nextToAdd(color, property, player);

	var inAdditions = false;

	for(var i = 0; i < nextAdditions.length; i++) {
		if(nextAdditions[i] === property) {
			inAdditions = true;
		}
	}

	if(ownsMajority(color, player) && inAdditions && gameData["players"][player][property][i]["houses"] < 4) {
		// find property and increment the houses
		for(var j = 0; j < gameData["players"][player][property].length; j++) {
			if(gameData["players"][property][i]["name"] === property) {
				gameData["players"][player][property][i]["houses"] += 1;
				setHouseNumberForProperty(color, property, gameData["players"][player][property][i]["houses"]);
				gameData["players"][player]["money"] -= board[property]["house"];
				gameData["houses"] -= 1;
			}
		}
	}
	// handles hotels/skyscrapers since need to have the entire set for that
	else if(ownsAll(color, player) && inAdditions) {
		// find property and increment the houses
		for(var j = 0; j < gameData["players"][player][property].length; j++) {
			if(gameData["players"][property][i]["name"] === property) {
				gameData["players"][player][property][i]["houses"] += 1;
				setHouseNumberForProperty(color, property, gameData["players"][player][property][i]["houses"]);
				gameData["players"][player]["money"] -= board[property]["house"];
				// bought a hotel
				if(gameData["players"][player][property][i]["houses"] === 5) {
					gameData["houses"] += 4;
					gameData["hotels"] -= 1;
				}
				// bought a skyscraper
				else {
					gameData["hotels"] += 1;
					gameData["skyscrapers"] -= 1;
				}
			}
		}
	}


	return gameData;
}

/**
* Simulates the player selling a house from a property (also works for hotels/skyscrapers)
* @param property the property to sell a house from
* @param the player that wants to sell the house
* @param gameData the JSON of the game
* @return gameData with changes to the player's data if the house was able to be sold
*/
var sellHouse = function(property, player, gameData) {
	var color = board["property"][property]["quality"];
	//TODO
}

/**
* Pays the rent to the player that should get it from the player landing on that location.
* @param property the location landed on that needs rent charged
* @param player the player that is going to pay rent
* @param gameData the JSON of the game
* @return gameData with changes to both players' data based on the rent charged
*/
var payRent = function(property, player, gameData) {
	if(gameData["owned"][property]) {
		var rentArray = board[property]["rent"];
		var owner = gameData["owned"][property];
		var houseRentIndex = 0;

		var colorSet = gameData["color"][board[property]["quality"]];
		for(var i = 0; i < colorSet.length; i++) {
			if(colorSet[i]["property"] === property) {
				houseRentIndex = colorSet[i]["houses"];
				if(colorSet[i]["hotel"]) {
					houseRentIndex = 5;
				}
				else if(colorSet[i]["skyscraper"]) {
					houseRentIndex = 6;
				}
			}
		}

		var cost = rentArray[houseRentIndex];
		gameData["players"][player]["money"] -= cost;
		gameData["players"][owner]["money"] += cost;
	}
	return gameData;
}

/**
* Trades data from player1 to player2.
* @param player1 the first player in the trade
* @param player2 the second player in the trade
* @param properties1 the properties player1 is giving up
* @param properties2 the properties player2 is giving up
* @param wealth1 the amount of money player1 is giving up
* @param wealth2 the amount of money player2 is giving up
* @param gameData the JSON of the game
* @return gameData with the trade and any issues that happened
*/
var trade = function(player1, player2, properties1, properties2, wealth1, wealth2, gameData) {
	// TODO
}

/**
* Automatically fixes all of the issues that may be present with the gameData.
* @param gameData the JSON of the game, which has the issues as a field of the JSON
* @return gameData with all of issues fixed
*/
var correctIssues = function(gameData) {
	// TODO
}

/**
* Tells the owner of the property or false if there is none
* @param property the name of the property to check
* @return the owner of the property or false
*/
var isOwned = function(property) {
	return gameData["owned"][property];
}




















module.exports = game;