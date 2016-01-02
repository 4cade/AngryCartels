var board = require('./board.js');
var bus = require('./bus.js');
var roll3 = require('./roll3.js');
var chance = require('./chance.js');
var communityChest = require('./communityChest.js');

/**
* Create the defaults for the game to begin and commence in a way for this file to handle.
*	
* @param gamePresets the original data used for the game.
*
* @return gameData the data that will be used for the game
*/
var initializeBoard = function(gamePresets) {
	var gameData = JSON.parse(JSON.stringify(gamePresets));
	// changes a player from just a string to an actual player
	for(var index in gameData["players"]) {
		var newPlayer = {};
		newPlayer.name = gameData["players"][index];
		newPlayer.money = 3200;
		newPlayer.property = {}; // key of property name which maps to a boolean of true if not mortgaged
		newPlayer.busTickets = {}; // key of bus ticket type to quantity
		newPlayer.getOutOfJails = 0;
		newPlayer.forward = true;
		newPlayer.location = "go"; // all players start on go
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

			
			var spotData = board[spot];

			// houses should always be [0,4], hotel should only be true if houses == 4,
			//		skyscraper should only be true if hotel == true
			var colorData = {
					"owner": null,
					"houses": 0,
					"hotel": false,
					"skyscraper": false
				};

			// data structure for handling majorities
			if(!gameData["color"][spotData["quality"]]) {
				gameData["color"][spotData["quality"]] = {};
				// can get length by using Object.keys(gameData["color"][color]).length
			}
			
			gameData["color"][spotData["quality"]][spot] = colorData;
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
	gameData["message"] = ""; // any messages pertaining to changes made by some functions
	gameData["movedTo"] = []; // previous locations moved to in the last turn
	gameData["recentLocation"] = "go"; // last location moved to
	gameData["lastOdd"] = true; // says if the last move was an odd
	gameData["canRoll"] = true; // says if the current player can roll the dice

	return gameData;
}

/**
* Chooses the order of the players for the game.
* @param gameData the data of everything in the game
* @return modified gameData with the turnOrder field filled out with all of the players in a random order
*/
var setOrder = function(gameData) {
	var players = gameData["players"];
	var turns = [];

	for(var index in players) {
		var roll = Math.floor(Math.random()*6+1)*Math.floor(Math.random()*6+1);
		turns.push({
			"value": roll,
			"player": index
		});
	}

	turns.sort(function(a, b) {return a["value"] < b["value"]});

	for(var i = 0; i < turns.length; i++) {
		var index = turns[i]["player"];
		gameData["turnOrder"].push(gameData["players"][index]["name"]);
	}

	return gameData;
}

/**
* Makes it so the gameData has the next player in the order to go.
* @param gameData the data of everything in the game
* @return modified gameData with the turn put on the next player
*/
var nextTurn = function(gameData) {
	gameData["turnIndex"]++;
	gameData["canRoll"] = true;

	if(gameData["turnIndex"] === gameData["turnOrder"].length) {
		gameData["turnIndex"] = 0;
	}

	return gameData;
}

/**
* Informs whose turn it is.
* @param gameData the data of everything in the game
* @return object of the player whose turn it is
*/
var currentPlayer = function(gameData) {
	var players = gameData["players"];
	for(var index in players) {
		var currentPlayer = gameData["turnOrder"][gameData["turnIndex"]];
		if(players[index]["name"] === currentPlayer) {
			return players[index];
		}
	}
}

/**
* Handles the entire turn of when the user chooses to roll the dice by moving the current 
*	 player to wherever the dice puts him/her and indicates the next action.
* @param gameData the JSON of the game
* @return gameData with updated player information and gameData.recentLocation has the new location
*	 of the player and gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
*/
var rollDice = function(gameData) {
	var die1 = Math.floor(Math.random()*6+1);
	var die2 = Math.floor(Math.random()*6+1);
	var specialDie = Math.floor(Math.random()*6+1);

	var diceTotal = die1 + die2;
	var special = "";
	
	if(specialDie === 4 || specialDie === 5) {
		special = "mrmonopoly";
	}
	else if(specialDie === 6) {
		special = "gainbusticket";
	}
	else {
		diceTotal += specialDie;
	}

	// got a double
	if(die1 === die2) {
		gameData["doubleCount"] += 1;
		// rolled a double 3 times
		if(gameData["doubleCount"] === 3) {
			jumpLocation("jail");
			gameData["doubleCount"] = 0;
			return gameData;	
		}
	}
	else {
		gameData["doubleCount"] = 0;
		gameData["canRoll"] = false;
	}

	var odd = diceTotal % 2 !== 0;
	gameData.lastOdd = odd;

	var player = currentPlayer(gameData);

	var moveInfo = moveLocation(player.location, diceTotal, odd, player.forward, player.track);

	// use moveInfo to update player
	gameData.movedTo = moveInfo.movedTo;
	gameData.recentLocation = moveInfo.currentLocation;
	console.log(moveInfo);
	player.location = moveInfo.currentLocation;
	player.money += moveInfo.moneyGained;
	player.forward = moveInfo.reverse;

	if(special === "mrmonopoly") {
		gameData.message = "mrmonopoly";
	}
	else if(special === "gainbusticket") {
		var ticket = bus.getBusPass();

		// special bus pass where all others expire
		if(ticket === "forward expire") {
			player.busTickets = {};
		}

		// actually give the player the bus pass
		if(player.busTickets[ticket]) {
			player.busTickets[ticket] += 1;
		}
		else {
			player.busTickets[ticket] = 1;
		}
	}

	return gameData;
}

/**
* Handles the action of going through a Mr. Monopoly roll, Will move the player to the next unowned
*	 property unless he/she gets back to his/her currentLocation without encountering one.
* @param gameData the JSON of the game
* @return gameData with updated player information and gameData.recentLocation has the new location
*	 of the player and gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
*/
var unleashMrMonopoly = function(gameData) {
	var player = gameData["players"][gameData["turnOrder"][gameData["turnIndex"]]];

	var moveInfo = mrMonopolyLocation(player.location, gameData.lastOdd, player.forward, player.track, gameData);

	// use moveInfo to update player
	gameData.movedTo = moveInfo.movedTo;
	gameData.recentLocation = moveInfo.currentLocation;
	player.location = moveInfo.currentLocation;
	player.money += moveInfo.moneyGained;

	return gameData;
}

/**
* Moves the user to the next unowned property in the forward direction, or
*	 not at all if there are no unowned properties in the forward path
* @param currentLocation the location the player is on
* @param odd true if if the sum of dice is odd
* @param forward true if the player is moving forward
* @param userTrack true the track that the player is on
* @param gameData the JSON that carries all essential information about the game
*
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	a boolean specifying if the user is on the upper or lower track of a railroad, and an array
* 	of all of the locations visited in order in case an animation would like to have that 
*/
var mrMonopolyLocation = function(currentLocation, odd, forward, userTrack, gameData) {
	var moneyGained = 0;
	var location = currentLocation;
	var track = userTrack;
	var movesLeft = moves;
	var locationsMovedTo = [];
	var firstMove = true;

	while(!firstMove && location !== currentLocation && gameData["owned"][location] !== undefined) {
		firstMove = false;
		locationJSON = nextLocation(location, odd, forward, track);
		location = locationJSON.next;
		track = locationJSON.track;
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
	// actually found a new location
	if(location !== currentLocation) {
		json.moneyGained = moneyGained;
		json.currentLocation = location;
		json.movedTo = locationsMovedTo;
	}
	// went in a loop and failed to find a new unowned property
	else {
		json.moneyGained = 0;
		json.currentLocation = currentLocation;
		json.movedTo = [];
	}
	
	return json;
}

/**
* Moves the current player the number of spaces specified in moves and returns relevant
* 	data about what occurred during the movement
*
* @param currentLocation the current location that the moving player is at
* @param moves the number of times the player can move
* @param odd true if the dice roll was odd
* @param forward true if the player is moving forward
* @param userTrack the track that the player is on
*
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	and an array of all of the locations visited in order in case an animation would like to have that 
*/
var moveLocation = function(currentLocation, moves, odd, forward, userTrack) {
	var moneyGained = 0;
	var location = currentLocation;
	var track = userTrack;
	var movesLeft = moves;
	var locationsMovedTo = [];
	var reverse = forward;

	while(movesLeft > 0) {
		locationJSON = nextLocation(location, odd, reverse, track);
		location = locationJSON.next;
		track = locationJSON.track;
		locationsMovedTo.push(location);
		movesLeft--;

		// special cases about locations
		// gaining pay locations
		if(location == "go") {
			moneyGained += 200;
		}
		else if(location === "pay day") {
			if(odd) {
				moneyGained += 300;
			}
			else {
				moneyGained += 400;
			}
		}
		else if(location === "bonus") {
			if(movesLeft === 0) {
				moneyGained += 300;
			}
			else {
				moneyGained += 250;
			}
		}
		// tunnels
		else if(location === "holland tunnel ne") {
			location = "holland tunnel sw";
			locationsMovedTo.push(location);
		}
		else if(location === "holland tunnel sw") {
			location = "holland tunnel ne";
			locationsMovedTo.push(location);
		}
		else if(location === "reverse") {
			reverse = !reverse;
		}
	}

	var json = {};
	json.moneyGained = moneyGained;
	json.currentLocation = location;
	json.movedTo = locationsMovedTo;
	json.reverse = reverse;
	return json;
}

/**
* Returns the next location in whatever the forward direction is
* @param currentLocation the current location of the player
* @param odd true if the dice roll was odd or even
* @param forward true if the player is moving in the forward direction
* @param track the track that the user is on
*
* @return JSON with the next location that the user is going to go to, and the track of the user
*/
var nextLocation = function(currentLocation, odd, forward, track) {
	var direction = "backward";

	if(forward) {
		direction = "forward";
	}

	var next = board[currentLocation][direction]; // an array of 1 or 2 locations (only 2 if railroad)

	// json to return
	var json = {};
	json.next = next[0]; // assume first location in next, true for most locations
	json.track = track; // only changes if lands on railroad

	// handles railroad case
	if(board[currentLocation]["quality"] === "railroad" && track !== "middle") {
		json.next = next[1]; // works because railroad's next direction has the middle track first always
	}

	// handles when you first land on a railroad
	if(board[json.next]["quality"] === "railroad") {
		if((track === "middle" && !odd)|| (track !== "middle" && odd)) {
			json.track = board[json.next]["track"][1]; // will be either inner or outer
		}
		else {
			json.track = "middle";
		}
	}

	return json;
}

/**
* Specifies what kind of action should occur on the current location that was landed on.
*
* @param gameData the JSON of the game
*
* @return String indicating what kind of action should occur?
*/
var executeLocation = function(gameData) {
	var location = gameData.recentLocation;
	var locationType = board[location]["type"];
	if (locationType === 'property' || locationType === 'utility' || locationType === 'transportation') {
		// check if owned => buy, else rent
		if(!isOwned(property, gameData)) {
			return "buy";
		}
		else {
			return "rent";
		}
	}
	else if(locationType === 'subway') {
		// allow teleport anywhere
		return "subway";
	}
	else if(locationType === 'chance') {
		// chance
		return "chance";
	}
	else if(locationType === 'community chest') {
		return "community chest";
	}
	else if(locationType === 'bus') {
		return "bus";
	}
	else if(locationType === 'auction') {
		// check if any unowned left, if not then go to one with highest rent
		for(var property in gameData["owned"]) {
			if(!gameData["owned"][property]) {
				return "auction";
			}
			else {
				return "highest rent";
			}
		}
	}
	else {
		// do nothing
		return "nothing";
	}
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
	var oldLocation = newLocation["backward"][0];
	var track = board[oldLocation]["track"];
	return moveLocation(oldLocation, 1, true, true, track); // TODO get rid of weird side effects
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

	for(var key in colorData) {
		if(key === property) {
			if(houseNumber === 6) {
				colorData[key]["skyscraper"] = true;
				colorData[key]["hotel"] = true;
				colorData[key]["houses"] = 4;
			}
			else if(houseNumber === 5) {
				colorData[key]["skyscraper"] = false;
				colorData[key]["hotel"] = true;
				colorData[key]["houses"] = 4;
			}
			else {
				colorData[key]["skyscraper"] = false;
				colorData[key]["hotel"] = false;
				colorData[key]["houses"] = houseNumber;
			}
		}
	}

}

/**
* Checks if the specified player owns the majority of the color
* @param color the color of the majority to check
* @param player the player to check if he owns the majority of the color
* @param gameData the JSON that holds the information about this game
* @return true if the player owns the majority of the color.
*/
var ownsMajority = function(color, player, gameData) {
	var colorData = gameData["color"][color];

	var count = 0;

	for(var key in colorData) {
		if(colorData[key]["owner"] === player) {
			count += 1;
		}
	}

	return count > Object.keys(colorData).length/2;
}

/**
* Checks if the specified player owns all of the color
* @param color the color to check
* @param player the player to check if he owns all of the color
* @param gameData the data of the game that holds everything
* @return true if the player owns the all of the properties of the color.
*/
var ownsAll = function(color, player, gameData) {
	var colorData = gameData["color"][color];

	var count = 0;

	for(var key in colorData) {
		if(colorData[key]["owner"] === player) {
			count += 1;
		}
	}

	return count === Object.keys(colorData).length;
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
	for(var key in colorData) {
		if(colorData[key]["owner"] === player) {
			if(colorData[key]["skyscraper"] && maxHouse < 6) {
				maxHouse = 6;
			}
			else if(colorData[key]["hotel"] && maxHouse < 5) {
				maxHouse = 5;
			}
			else if(colorData[key]["houses"] > maxHouse) {
				maxHouse = colorData[key]["houses"];
			}
		}
	}

	// now check which properties are valid to add houses (or bigger) to
	var nextAdditions = [];
	var sameMax = true;

	// use a while loop just in case need to start additions over
	var index = 0;

	while(index < Object.keys(colorData).length) {
		index++; // increment so it doesn't continue forever

		var key = Object.keys(colorData)[index];

		// TODO condense these if statements together
		if(colorData[key]["owner"] === player) {
			if(colorData[key]["houses"] == maxHouse-1) {
				// this means that there is an imbalance with the properties and it should be accounted for
				if(sameMax) {
					sameMax = false;
					index = 0;
					nextAdditions = [];
				}
				else {
					nextAdditions.push(colorData[key]["property"]);
				}				
			}
			else if(colorData[key]["houses"] == maxHouse && sameMax) {
				nextAdditions.push(colorData[key]["property"]);
			}
			else if(colorData[i]["hotel"] && maxHouse == 5 && sameMax) {
				nextAdditions.push(colorData[key]["property"]);
			}
			else if(colorData[key]["hotel"] && maxHouse == 6) {
				// this means that there is an imbalance with the properties and it should be accounted for
				if(sameMax) {
					sameMax = false;
					index = 0;
					nextAdditions = [];
				}
				else {
					nextAdditions.push(colorData[key]["property"]);
				}	
			}
			// cannot make more additions if it is already at the skyscraper level
		}
	}

	return nextAdditions;
}

/**
* Executes the action of the specified busTicket and indicates if further action is required
* @param action the type of bus pass that is being used
* @param gameData the JSON with all of the info for the game
* @return gameData updated with an array of properties if further action is required (means move forward)
* 	in the message location, otherwise the empty string
*/
var useBusTicket = function(action, gameData) {
	// first get player info
	var player = currentPlayer(gameData);

	if(action.includes("any") || action.includes("expire")) {
		// means to move forward to any space
		var properties = bus.getForward(player.location, player.forward);
		gameData.message = properties;
		// will require further use of advance to location
		return gameData;
	}
	else if(action.includes("transit")) {
		var newLocation = bus.getNextTransit(player.location, player.forward);
		advanceToProperty(player.name, newLocation, gameData);
	}
	else if(action.includes("forward")) {
		// get rid of "forward " and turn into int
		var moves = parseInt(action.substring(7));
		var moveInfo = moveLocation(player.location, moves, moves % 2 == 0, player.forward, player.track);

		// use moveInfo to update player
		gameData.movedTo = moveInfo.movedTo;
		gameData.recentLocation = moveInfo.currentLocation;
		player.location = moveInfo.currentLocation;
		player.money += moveInfo.moneyGained;
		player.forward = moveInfo.reverse;
	}
	else if(action.includes("back")){
		// get rid of "back " and turn into int
		var moves = parseInt(action.substring(5));
		var moveInfo = moveLocation(player.location, moves, moves % 2 == 0, player.forward, player.track);

		// use moveInfo to update player
		gameData.movedTo = moveInfo.movedTo;
		gameData.recentLocation = moveInfo.currentLocation;
		player.location = moveInfo.currentLocation;
		player.money += moveInfo.moneyGained;
		player.forward = moveInfo.reverse;
	}
	gameData.message = "";
	return gameData;
}

/**
* Mutates gameData to give the player the property, with any side implications.
* @param property the property to buy
* @param player the player that is making the purchase
* @param gameData the JSON of the game
* @return the modified gameData with any issues stored in the issues field
*/
var buyProperty = function(property, player, gameData) {
	var playerIndex = getPlayerIndexFromPlayer(player, gameData);

	gameData["owned"][property] = player;

	gameData["players"][playerIndex]["property"][property] = true; // not mortgaged

	var colorData = gameData["color"][board[property]["quality"]];

	for(var key in colorData) {
		if(key === property) {
			colorData[key]["owner"] = player;
		}
	}

	var color = board[property]["quality"];
	// account for house imbalance
	rebalanceHouses(color, player, gameData);

	// properties cost twice the mortgage price
	gameData["players"][playerIndex]["money"] -= 2*board[property]["mortgage"];
	return gameData;
}

/**
* Mutates gameData to give the player the property, with any side implications.
* @param property the property to buy
* @param player name of the player that is making the purchase
* @param price the monetary amount that the player paid for the property
* @param gameData the JSON of the game
* @return the modified gameData with any issues stored in the issues field
*/
var buyPropertyAuction = function(property, player, price, gameData) {
	var playerIndex = getPlayerIndexFromPlayer(player, gameData);
	
	gameData["owned"][property] = player;
	
	gameData["players"][playerIndex]["property"][property] = true; // not mortgaged

	var colorData = gameData["color"][board[property]["quality"]];

	for(var key in colorData) {
		if(key === property) {
			colorData[key]["owner"] = player;
		}
	}

	var color = board[property]["quality"];
	// account for house imbalance
	rebalanceHouses(color, player, gameData);

	// charge the auctioned price
	gameData["players"][playerIndex]["money"] -= price;
	return gameData;
}

/**
* Causes the property to be mortgaged so rent cannot be charged.
*	Precondition: house balance is already maintained
* @param property the property to mortgage
* @param the player that wants to mortgage such property
* @param gameData the JSON of the game
* @return gameData with the property mortgaged if it could be mortgaged
*/
var mortgageProperty = function(property, player, gameData) {
	var playerIndex = getPlayerIndexFromPlayer(player, gameData);

	if(gameData["players"][playerIndex]["property"][property]) {
		gameData["players"][playerIndex]["property"][property] = false;
		gameData["players"][playerIndex][money] += board[property]["mortgage"];
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
	var color = board[property]["quality"];
	var nextAdditions = nextToAdd(color, property, player);

	var inAdditions = false;
	var payForHouse = false;

	for(var i = 0; i < nextAdditions.length; i++) {
		if(nextAdditions[i] === property) {
			inAdditions = true;
		}
	}
	// just if houses
	if(ownsMajority(color, player, gameData) && inAdditions && gameData["color"][color]["houses"] < 4 && gameData["houses"] > 0) {
		var oldHouseNum = gameData["color"][color]["houses"];
		setHouseNumberForProperty(color, property, oldHouseNum + 1, gameData);
		payForHouse = true;
		gameData["houses"] -= 1;
	}
	// handles hotels/skyscrapers since need to have the entire set for that
	else if(ownsAll(color, player, gameData) && inAdditions) {
		// not a hotel yet
		if(!gameData["color"][color]["hotel"] && gameData["hotels"] > 0) {
			setHouseNumberForProperty(color, property, 5, gameData);
			gameData["houses"] -= 4;
			gameData["hotels"] += 1;
			payForHouse = true;
		}
		else if(gameData["skyscrapers"] > 0) {
			setHouseNumberForProperty(color, property, 6, gameData);
			gameData["skyscrapers"] += 1;
			gameData["hotels"] -= 1;
			payForHouse = true;
		}
	}

	// need to charge player for house
	if(payForHouse) {
		var housePrice = board[property]["house"];
		gameData["players"][playerIndex]["money"] -= housePrice;
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
	var color = board[property]["quality"];
	var colorData = gameData["color"][color];
	
	var cantSell = nextToAdd(color, property, player);

	var sellable = true;
	var soldHouse = false;

	// there are properties that cannot be sold
	if(cantSell.length !== Object.keys(colorData).length) {
		for(var i = 0; i < nextAdditions.length; i++) {
			if(nextAdditions[i] === property) {
				sellable = false;
			}
		}
	}

	if(sellable) {
		if(colorData[property]["skyscraper"] && gameData["hotels"] >= 1) {
			setHouseNumberForProperty(color, property, 5, gameData);
			gameData["skyscrapers"] += 1;
			soldHouse = true;
		}
		else if(colorData[property]["hotel"] && gameData["houses"] >= 4) {
			setHouseNumberForProperty(color, property, 4, gameData);
			gameData["hotels"] += 1;
			gameData["houses"] -= 1;
			soldHouse = true;
		}
		else if(colorData[property]["houses"] > 0) {
			var oldHouseNum = colorData[property]["houses"];
			setHouseNumberForProperty(color, property, oldHouseNum - 1, gameData);
			gameData["houses"] += 1;
			soldHouse = true;
		}
		// can't put soldHouse variable here in case tried to sell houses on something that had 0
	}
	
	// need to refund player for house
	if(soldHouse) {
		var housePrice = board[property]["house"];
		gameData["players"][playerIndex]["money"] += housePrice/2;
	}

	return gameData;
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

		var ownerIndex = getPlayerIndexFromPlayer(owner, gameData);
		var playerIndex = getPlayerIndexFromPlayer(player, gameData);

		var colorSet = gameData["color"][board[property]["quality"]];
		for(var key in colorSet) {
			if(key === property) {
				houseRentIndex = colorSet[key]["houses"];
				if(colorSet[key]["hotel"]) {
					houseRentIndex = 5;
				}
				else if(colorSet[key]["skyscraper"]) {
					houseRentIndex = 6;
				}
			}
		}

		var cost = rentArray[houseRentIndex];
		gameData["players"][playerIndex]["money"] -= cost;
		gameData["players"][ownerIndex]["money"] += cost;
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
	var player1Index = getPlayerIndexFromPlayer(player1, gameData);
	var player2Index = getPlayerIndexFromPlayer(player2, gameData);
	var colors = new Set();

	// trade properties
	for(var i = 0; i < properties1.length; i++) {
		var mortgageBoolean = gameData["players"][player1Index][properties1[i]];
		delete gameData["players"][player1Index][properties1[i]];
		gameData["players"][player2Index][properties1[i]] = mortgageBoolean;
		// get color needed to fix
		colors.add(board[properties1[i]]["quality"]);
	}

	for(var i = 0; i < properties2.length; i++) {
		var mortgageBoolean = gameData["players"][player2Index][properties2[i]];
		delete gameData["players"][player2Index][properties2[i]];
		gameData["players"][player1Index][properties2[i]] = mortgageBoolean;
		// get color needed to fix
		colors.add(board[properties2[i]]["quality"]);
	}

	// rebalance houses for both
	for(var color in colors) {
		rebalanceHouses(color, player1, gameData);
		rebalanceHouses(color, player2, gameData);
	}

	// trade money
	changeMoneyForPlayer(player1, -1*wealth1, gameData);
	changeMoneyForPlayer(player1, wealth2, gameData);
	changeMoneyForPlayer(player2, -1*wealth2, gameData);
	changeMoneyForPlayer(player2, wealth1, gameData);

	return gameData;
}

/**
* Maintains the balance of houses when an external transaction can disrupt the balance
* @param color the color that we need to balance
* @param player the player whose properties need to be balanced
* @param gameData the data of the game
* @return revised gameData with any fixes made, message put in gameData["message"]
*/
var rebalanceHouses = function(color, player, gameData) {
	var colorData = gameData["color"][color]; // can probably be optimized a bit...
	var playerIndex = getPlayerIndexFromPlayer(player, gameData);

	// special cases: has all and imbalance, has majority and imbalance, has none
	if(ownsAll(color, player, gameData)) {
		var totalHouses = countHousesInColor(color, gameData);

		var housesPerProperty = Math.floor(totalHouses/Object.keys(colorData).length);

		for(var key in colorData) {
			setHouseNumberForProperty(color, key, housesPerProperty, gameData);
			totalHouses -= housesPerProperty;
		}

		// need to distribute the rest of the houses, people generally like on most expensive...
		// 	keys generally in order of least valuable to most, so reverse order to fill valuable first
		for(var key in Object.keys(colorData).reverse()) {
			if(totalHouses > 0) {
				var oldHouseNum = countHousesOnProperty(color, key, gameData);
				setHouseNumberForProperty(color, key, oldHouseNum+1, gameData);
				totalHouses -= 1;
			}
		}
	}
	else if(ownsMajority(color, player, gameData)) {
		var totalHouses = countHousesInColor(color, gameData);

		// need to count number of properties that belong to this player...
		var ownedProperties = [];
		for(var key in colorData) {
			if(colorData[key]["owner"] === player) {
				ownedProperties.push(key);
			}
		}

		var housesPerProperty = Math.floor(totalHouses/ownedProperties.length);

		// can only put hotels/skyscapers if all are owned 
		if(housesPerProperty > 4) {
			housesPerProperty = 4;
		}

		// check if need to add additional houses by adjusting total of totalHouses
		totalHouses -= housesPerProperty*ownedProperties.length; // will not evaluate to zero if floored amount was not same

		for(var i = ownedProperties.length-1; i >= 0; i--) {
			var additionalHouses = 0;
			if(totalHouses > 0 && housesPerProperty < 4) {
				additionalHouses = 1;
				totalHouses -= additionalHouses;
			}
			setHouseNumberForProperty(color, key, housesPerProperty + additionalHouses, gameData);
		}

		// refund remaining houses
		var housePrice = board[ownedProperties[0]]["house"];
		gameData["players"][playerIndex]["money"] += totalHouses*housePrice/2;
	}
	// need to refund all remaining houses from owned properties
	else {
		for(var key in colorData) {
			if(colorData[key]["owner"] === player) {
				var houseCount = countHousesOnProperty(color, key, gameData);
				var housePrice = board[key]["house"];

				setHouseNumberForProperty(color, key, 0, gameData);
				
				gameData["players"][playerIndex]["money"] += houseCount*housePrice/2;
			}
		}
	}

	return gameData;
}

/**
* Informs of how many houses are on properties in a certain color set
* @param color the color that we are counting
* @param gameData the data of the game
* @return the total number of houses on properties in this color
*/
var countHousesInColor = function(color, gameData) {
	var colorData = gameData["color"][color];
	var total = 0;

	for(var key in colorData) {
		if(colorData[key]["skyscraper"]) {
			total += 6;
		}
		else if(colorData[key]["hotel"]) {
			total += 5;
		}
		else {
			total += colorData[key]["houses"];
		}
	}

	return total;
}

/**
* Informs of how many houses are a specific property
* @param color the color that we are counting
* @param property the property we want the houses of
* @param gameData the data of the game
* @return the total number of houses on properties in this color
*/
var countHousesOnProperty = function(color, property, gameData) {
	var propertyData = gameData["color"][color][property];
	if(propertyData["skyscraper"]) {
		return 6;
	}
	else if(propertyData["hotel"]) {
		return 5;
	}
	else {
		return propertyData["houses"];
	}	
}

/**
* Tells the owner of the property or false if there is none
* @param property the name of the property to check
* @param gameData the data of the game
* @return the owner of the property or false
*/
var isOwned = function(property, gameData) {
	return gameData["owned"][property];
}

/**
* Tells us what index in gameData["players"] the player is
* @param player name of the player to find the index of
* @param gameData the data of the game
* @return an integer of the index of the player specified, returns -1 if cannot be found
*/
var getPlayerIndexFromPlayer = function(player, gameData) {

	for(var i = 0; i < gameData["players"].length; i++) {
		if(gameData["players"][i]["name"] === player) {
			return i;
		}
	}

	return -1;
}

/**
* Moves the specified player to the location 
*
* @param player name of the player to find the index of
* @param property the name of the property to move to
* @param gameData the JSON with all of the data of the game
*
* @return a JSON specifying the new location of the player, any money gained along the journey,
* 	and an array of all of the locations visited in order in case an animation would like to have that 
*/
var advanceToProperty = function(player, property, gameData) {
	var moneyGained = 0;

	var playerInfo = getPlayerIndexFromPlayer(player, gameData);
	var location = playerInfo.location;
	var track = playerInfo.track;
	var locationsMovedTo = [];
	var reverse = forward;

	while(location !== property) {
		var odd = player.track === board[location]["track"][0];
		locationJSON = nextLocation(location, odd, reverse, track);
		location = locationJSON.next;
		track = locationJSON.track;
		locationsMovedTo.push(location);

		// special cases about locations
		// gaining pay locations
		if(location == "go") {
			moneyGained += 200;
		}
		else if(location === "pay day") {
			if(odd) {
				moneyGained += 300;
			}
			else {
				moneyGained += 400;
			}
		}
		else if(location === "bonus") {
			if(movesLeft === 0) {
				moneyGained += 300;
			}
			else {
				moneyGained += 250;
			}
		}
		// tunnels
		else if(location === "holland tunnel ne") {
			location = "holland tunnel sw";
			locationsMovedTo.push(location);
		}
		else if(location === "holland tunnel sw") {
			location = "holland tunnel ne";
			locationsMovedTo.push(location);
		}
		else if(location === "reverse") {
			reverse = !reverse;
		}
	}

	var json = {};
	json.moneyGained = moneyGained;
	json.currentLocation = location;
	json.movedTo = locationsMovedTo;
	json.reverse = reverse;
	return json;
}


/**
* Changes the amonut of money the specifed player has by the delta amount
*
* @param player the String of the player whose money is going to change
* @param delta the amount the player's money is changing
* @param gameData the JSON with all of the data of the game
*
* @return gameData with the change in money
*
*/
var changeMoneyForPlayer = function(player, delta, gameData) {
	var playerIndex = getPlayerIndexFromPlayer(player, gameData);
	gameData["players"][playerIndex]["money"] += delta;
	return gameData;
}

/**
* Simulates drawing a chance card and intitiates the action needed to take
* @param player the player drawing the card
* @param gameData the main data of the game
* @return gameData mutated with the result of drawing the card
*/
var chanceCard = function(player, gameData) {
	// TODO
}

/**
* Simulates drawing a community chest card and intitiates the action needed to take
* @param player the player drawing the card
* @param gameData the main data of the game
* @return gameData mutated with the result of drawing the card
*/
var communityChestCard = function(player, gameData) {
	// TODO
}


/**
* Returns the name of the property with the highest rent
*
* @param gameData the JSON with all of the data of the game
*
* @return String name of the property with the highest rent, null if no property owned
*/
var highestRent = function(gameData) {
	
	var colorData = gameData["color"];
	var highestProperty = {
		"name": null,
		"price": 0
	}

	// loop through every property
	for(var color in colorData) {
		for(var property in colorData[color]) {
			var houses = countHousesOnProperty(color, property, gameData);
			var price = board[property]["rent"][houses];
			if(price > highestProperty["price"] && isOwned(property, gameData)) {
				highestProperty["name"] = property;
				highestProperty["price"] = price;
			}
		}
	}

	return highestProperty["name"];
}


/**
* TODO
*
*/
var taxiRide = function() {

}

// object that we will export
var game = {};

game.initializeBoard = initializeBoard;
game.setOrder = setOrder;
game.nextTurn = nextTurn;
game.currentPlayer = currentPlayer;
game.rollDice = rollDice;
game.unleashMrMonopoly = unleashMrMonopoly;
game.executeLocation = executeLocation;
game.useBusTicket = useBusTicket;
game.buyProperty = buyProperty;
game.buyPropertyAuction = buyPropertyAuction;
game.mortgageProperty = mortgageProperty;
game.buyHouse = buyHouse;
game.payRent = payRent;
game.trade = trade;
game.taxiRide = taxiRide;

module.exports = game;