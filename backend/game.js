var board = require('./large_board.js');
var bus = require('./bus.js');
var roll3 = require('./roll3.js');
var chance = require('./chance.js');
var communityChest = require('./communityChest.js');

// gamePresets: the original data used for the game
// gameData: the data that will be used for the game
var Game = function(gamePresets) {
    this.gameData = JSON.parse(JSON.stringify(gamePresets));
    // changes a player from just a string to an actual player
    this.auctionPrices = {};

    for (var index in this.gameData["players"]) {
        var newPlayer = {};
        newPlayer.name = this.gameData["players"][index];
        newPlayer.money = 3200;
        newPlayer.property = {}; // key of property name which maps to a boolean of true if not mortgaged
        newPlayer.busTickets = {}; // key of bus ticket type to quantity
        newPlayer.getOutOfJails = 0;
        newPlayer.forward = true;
        newPlayer.location = "go"; // all players start on go
        newPlayer.track = "middle";

        this.gameData["players"][index] = newPlayer;
    }

    // load unowned properties with properties from the board
    this.gameData["owned"] = {};
    this.gameData["color"] = {};

    for (var spot in board) {
        if (board[spot]["type"] === "property" || board[spot]["type"] === "transportation" ||
            board[spot]["type"] === "utility") {
            // set spot name in the data to false to represent unowned
            this.gameData["owned"][spot] = false;


            var spotData = board[spot];

            // houses should always be [0,4], hotel should only be true if houses == 4,
            // skyscraper should only be true if hotel == true
            var colorData = {
                "owner": null,
                "houses": 0,
                "hotel": false,
                "skyscraper": false
            };

            // data structure for handling majorities
            if (!this.gameData["color"][spotData["quality"]]) {
                this.gameData["color"][spotData["quality"]] = {};
                // can get length by using Object.keys(this.gameData["color"][color]).length
            }

            this.gameData["color"][spotData["quality"]][spot] = colorData;
        }
    }

    this.gameData["freeParking"] = 0;

    // set house, hotel, skyscraper presets
    this.gameData["houses"] = 81;
    this.gameData["hotels"] = 31;
    this.gameData["skyscrapers"] = 16;

    // this will be set after the starting phase
    this.gameData["turnOrder"] = []; // has the players in order of their turns
    this.gameData["turnIndex"] = 0; // 0 <= turnIndex < gameData["turnOrder"].length
    this.gameData["doubleCount"] = 0; // reset to 0 at the beginning of a new turn
    this.gameData["message"] = ""; // any messages pertaining to changes made by some functions
    this.gameData["movedTo"] = []; // previous locations moved to in the last turn
    this.gameData["recentLocation"] = "go"; // last location moved to
    this.gameData["lastOdd"] = true; // says if the last move was an odd
    this.gameData["canRoll"] = true; // says if the current player can roll the dice
    this.gameData["rolled"] = []; // holds the data of the dice that were rolled

    /**
     * Chooses the order of the players for the game. (DEPRECATED)
     */
    this.setOrder = function() {
        var players = this.gameData["players"];
        var turns = [];

        for (var index in players) {
            var roll = Math.floor(Math.random()*6 + 1) * Math.floor(Math.random()*6 + 1);
            turns.push({
                "value": roll,
                "player": index
            });
        }

        turns.sort(function(a, b) {return a["value"] < b["value"]});
        this.gameData["turnOrder"] = [];

        for (var i = 0; i < turns.length; i++) {
            var index = turns[i]["player"];
            this.gameData["turnOrder"].push(this.gameData["players"][index]["name"]);
        }
    }

    /**
     * Makes it so the gameData has the next player in the order to go. (DEPRECATED)
     */
    this.nextTurn = function() {
        this.gameData["turnIndex"]++;
        this.gameData["canRoll"] = true;

        if (this.gameData["turnIndex"] === this.gameData["turnOrder"].length) {
            this.gameData["turnIndex"] = 0;
        }
    }

    /**
     * Informs whose turn it is. (DEPRECATED)
     *
     * @return object of the player whose turn it is
     */
    this.currentPlayer = function() {
        var players = this.gameData["players"];
        for (var index in players) {
            var currentPlayer = this.gameData["turnOrder"][this.gameData["turnIndex"]];
            if (players[index]["name"] === currentPlayer) {
                return players[index];
            }
        }
    }

    /**
     * Handles the entire turn of when the user chooses to roll the dice by moving the current
     *     player to wherever the dice puts him/her and indicates the next action.
     *     Updated player information and gameData.recentLocation has the new location
     *     of the player and gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
     */
    this.rollDice = function() {
        var die1 = Math.floor(Math.random()*6 + 1);
        var die2 = Math.floor(Math.random()*6 + 1);
        var specialDie = Math.floor(Math.random()*6 + 1);

        var diceTotal = die1 + die2;
        var special = "";

        // set the values of the dice roll
        this.gameData["rolled"] = [die1, die2];

        if (specialDie === 4 || specialDie === 5) {
            special = "mrmonopoly";
            this.gameData["rolled"].push("mrmonopoly");
        } else if (specialDie === 6) {
            special = "gainbusticket";
            this.gameData["rolled"].push("gainbusticket");
        } else {
            diceTotal += specialDie;
            this.gameData["rolled"].push(specialDie);
        }

        // got a double
        if (die1 === die2) {
            this.gameData["doubleCount"] += 1;
            // rolled a double 3 times
            if (this.gameData["doubleCount"] === 3) {
                this.jumpLocation("jail");
                this.gameData["doubleCount"] = 0;
                return this.gameData;
            }
        } else {
            this.gameData["doubleCount"] = 0;
            this.gameData["canRoll"] = false;
        }

        // got a triple
        if(die1 === die2 && die1 === specialDie){
          this.gameData.message = "subway";
          // return since nothing else can happen
          return
        }

        var odd = diceTotal % 2 !== 0;
        this.gameData.lastOdd = odd;

        var player = this.currentPlayer();

        var moveInfo = this.moveLocation(player.location, diceTotal, odd, player.forward, player.track);

        // use moveInfo to update player
        this.gameData.movedTo = moveInfo.movedTo;
        this.gameData.recentLocation = moveInfo.currentLocation;

        player.location = moveInfo.currentLocation;
        player.money += moveInfo.moneyGained;
        player.forward = moveInfo.reverse;

        if (special === "mrmonopoly") {
            this.gameData.message = "mrmonopoly";
        } else if (special === "gainbusticket") {
            var ticket = bus.getBusPass();

            // special bus pass where all others expire
            if (ticket === "forward expire") {
                player.busTickets = {};
            }

            // actually give the player the bus pass
            if (player.busTickets[ticket]) {
                player.busTickets[ticket] += 1;
            } else {
                player.busTickets[ticket] = 1;
            }
        }
    }

    /**
     * Handles the action of going through a Mr. Monopoly roll, Will move the player to the next unowned
     *     property unless he/she gets back to his/her currentLocation without encountering one.
     *     Updates gameData with updated player information and gameData.recentLocation has the new location
     *     of the player and gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
     */
    this.unleashMrMonopoly = function() {
        var player = this.currentPlayer();

        var moveInfo = this.mrMonopolyLocation(player.location, this.gameData.lastOdd, player.forward, player.track);

        // use moveInfo to update player
        this.gameData.movedTo = moveInfo.movedTo;
        this.gameData.recentLocation = moveInfo.currentLocation;
        player.location = moveInfo.currentLocation;
        player.money += moveInfo.moneyGained;
    }

    /**
     * Moves the user to the next unowned property in the forward direction, or
     *     not at all if there are no unowned properties in the forward path
     * (DEPRECATED)
     * @param currentLocation the location the player is on
     * @param odd true if if the sum of dice is odd
     * @param forward true if the player is moving forward
     * @param userTrack true the track that the player is on
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that
     */
    this.mrMonopolyLocation = function(currentLocation, odd, forward, userTrack) {
        var moneyGained = 0;
        var location = currentLocation;
        var track = userTrack;
        var movesLeft = moves;
        var locationsMovedTo = [];
        var firstMove = true;

        while (!firstMove && location !== currentLocation && this.canBuy(location)) {
            firstMove = false;
            locationJSON = this.nextLocation(location, odd, forward, track);
            location = locationJSON.next;
            track = locationJSON.track;
            locationsMovedTo.push(location);
            movesLeft--;

            // special cases about locations
            // gaining pay locations
            if (location == "go") {
                moneyGained += 200;
            } else if (location == "pay day") {
                if (odd) {
                    moneyGained += 300;
                } else {
                    moneyGained += 400;
                }
            } else if (location == "bonus") {
                if (movesLeft == 0) {
                    moneyGained += 300;
                } else {
                    moneyGained += 250;
                }
            }
        }

        var json = {};
        // IF actually found a new location ELSE went in a loop and failed to find a new unowned property
        if (location !== currentLocation) {
            json.moneyGained = moneyGained;
            json.currentLocation = location;
            json.movedTo = locationsMovedTo;
        } else {
            json.moneyGained = 0;
            json.currentLocation = currentLocation;
            json.movedTo = [];
        }

        return json;
    }

    /**
     * Moves the current player the number of spaces specified in moves and returns relevant
     *     data about what occurred during the movement
     * (DEPRECATED)
     * @param currentLocation the current location that the moving player is at
     * @param moves the number of times the player can move
     * @param odd true if the dice roll was odd
     * @param forward true if the player is moving forward
     * @param userTrack the track that the player is on
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     and an array of all of the locations visited in order in case an animation would like to have that
     */
    this.moveLocation = function(currentLocation, moves, odd, forward, userTrack) {
        var moneyGained = 0;
        var location = currentLocation;
        var track = userTrack;
        var movesLeft = moves;
        var locationsMovedTo = [];
        var reverse = forward;

        while (movesLeft > 0) {
            locationJSON = this.nextLocation(location, odd, reverse, track);
            location = locationJSON.next;
            track = locationJSON.track;
            locationsMovedTo.push(location);
            movesLeft--;

            // special cases about locations
            // gaining pay locations and tunnels
            if (location == "go") {
                moneyGained += 200;
            } else if (location === "pay day") {
                if (odd) {
                    moneyGained += 300;
                } else {
                    moneyGained += 400;
                }
            } else if (location === "bonus") {
                if (movesLeft === 0) {
                    moneyGained += 300;
                } else {
                    moneyGained += 250;
                }
            } else if (location === "holland tunnel ne" && movesLeft === 0) {
                location = "holland tunnel sw";
                locationsMovedTo.push(location);
            } else if (location === "holland tunnel sw" && movesLeft === 0) {
                location = "holland tunnel ne";
                locationsMovedTo.push(location);
            } else if (location === "reverse" && movesLeft === 0) {
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
     * (DEPRECATED)
     * @param currentLocation the current location of the player
     * @param odd true if the dice roll was odd or even
     * @param forward true if the player is moving in the forward direction
     * @param track the track that the user is on
     *
     * @return JSON with the next location that the user is going to go to, and the track of the user
     */
    this.nextLocation = function(currentLocation, odd, forward, track) {
        var direction = "backward";

        if (forward) {
            direction = "forward";
        }

        var next = board[currentLocation][direction]; // an array of 1 or 2 locations (only 2 if railroad)

        // json to return
        var json = {};
        json.next = next[0]; // assume first location in next, true for most locations
        json.track = track; // only changes if lands on railroad

        // handles railroad case
        if (board[currentLocation]["quality"] === "railroad" && track !== "middle") {
            json.next = next[1]; // works because railroad's next direction has the middle track first always
        }

        // handles when you first land on a railroad
        if (board[json.next]["quality"] === "railroad") {
            if ((track === "middle" && !odd) || (track !== "middle" && odd)) {
                json.track = board[json.next]["track"][1]; // will be either inner or outer
            } else {
                json.track = "middle";
            }
        }

        return json;
    }

    /**
     * Specifies what kind of action should occur on the current location that was landed on.
     * (DEPRECATED)
     * @return String indicating what kind of action should occur
     */
    this.executeLocation = function() {
        var location = this.gameData.recentLocation;
        var locationType = board[location]["type"];
        if (locationType === 'property' || locationType === 'utility' || locationType === 'transportation') {
            // check if owned => buy, else rent
            if (!this.isOwned(location)) {
                return "buy";
            } else {
                return "rent";
            }
        }
        else if (locationType === 'subway') {
            // allow teleport anywhere
            return "subway";
        }
        else if (locationType === 'chance') {
            return "chance";
        }
        else if (locationType === 'community chest') {
            return "community chest";
        }
        else if (locationType === 'bus') {
            return "bus";
        }
        else if (locationType === 'auction') {
            // check if any unowned left, if not then go to one with highest rent
            var someLeft = false;
            for (var property in this.gameData["owned"]) {
                if (!this.gameData["owned"][location]) {
                    someLeft = true;
                }
            }
            if(someLeft) {
                return "auction choice";
            }
            else {
                return "highest rent";
            }
        }
        else {
            // do nothing
            return "nothing";
        }
    }

    /**
     * Performs the task of teleporting to some location on the board.
     * (DEPRECATED)
     * @param newLocation the location that the player wants to move to
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *   a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *   of all of the locations visited in order in case an animation would like to have that
     */
    this.jumpLocation = function(newLocation) {
        // pretend to be moving onto that location from one step behind to not have to rewrite code
        var oldLocation = newLocation["backward"][0];
        var track = board[oldLocation]["track"];
        return this.moveLocation(oldLocation, 1, true, true, track); // TODO get rid of weird side effects
    }

    /**
     * Mutates the gameData's color field to correctly calculate house balance.
     * (DEPRECATED)
     * @param color the color of the property
     * @param property the property you're changing the houses for
     * @param houseNumber the number of houses you want (5 for hotels, 6 for skyscapers)
     */
    this.setHouseNumberForProperty = function(color, property, houseNumber) {
        var colorData = this.gameData["color"][color];

        for (var key in colorData) {
            if (key === property) {
                if (houseNumber === 6) {
                    colorData[key]["skyscraper"] = true;
                    colorData[key]["hotel"] = true;
                    colorData[key]["houses"] = 4;
                } else if (houseNumber === 5) {
                    colorData[key]["skyscraper"] = false;
                    colorData[key]["hotel"] = true;
                    colorData[key]["houses"] = 4;
                } else {
                    colorData[key]["skyscraper"] = false;
                    colorData[key]["hotel"] = false;
                    colorData[key]["houses"] = houseNumber;
                }
            }
        }

    }

    /**
     * Checks if the specified player owns the majority of the color
     * (DEPRECATED)
     * @param color the color of the majority to check
     * @param player the player to check if he owns the majority of the color
     *
     * @return true if the player owns the majority of the color.
     */
    this.ownsMajority = function(color, player) {
        var colorData = this.gameData["color"][color];

        var count = 0;

        for (var key in colorData) {
            if (colorData[key]["owner"] === player) {
                count += 1;
            }
        }

        return count > Object.keys(colorData).length/2;
    }

    /**
     * Checks if the specified player owns all of the color
     * (DEPRECATED)
     * @param color the color to check
     * @param player the player to check if he owns all of the color
     *
     * @return true if the player owns the all of the properties of the color.
     */
    this.ownsAll = function(color, player) {
        var colorData = this.gameData["color"][color];

        var count = 0;

        for (var key in colorData) {
            if (colorData[key]["owner"] === player) {
                count += 1;
            }
        }

        return count === Object.keys(colorData).length;
    }

    /**
     * Determines which properties in the color set need to gain houses (hotels, skyscrapers)
     *     in order to fill up the set evenly.
     * Precondition: does not determine if the player has a majority or all, assumes that that
     *     is taken care of elsewhere.
     * (DEPRECATED depending on implementation...)
     * @param color a String color that is the set we're checking
     * @param player the player that wants to add a property
     *
     * @return an array of the properties that should be fixed up next
     */
    this.nextToAdd = function(color, player) {
        var colorData = this.gameData["color"][color];

        var maxHouse = 0;

        // first determine highest number of houses, hotel(5), or skyscraper(6)
        for (var key in colorData) {
            if (colorData[key]["owner"] === player) {
                if (colorData[key]["skyscraper"] && maxHouse < 6) {
                    maxHouse = 6;
                } else if (colorData[key]["hotel"] && maxHouse < 5) {
                    maxHouse = 5;
                } else if (colorData[key]["houses"] > maxHouse) {
                    maxHouse = colorData[key]["houses"];
                }
            }
        }

        // now check which properties are valid to add houses (or bigger) to
        var nextAdditions = [];
        var sameMax = true;

        // use a while loop just in case need to start additions over
        var index = 0;

        while (index < Object.keys(colorData).length) {
            index++; // increment so it doesn't continue forever

            var key = Object.keys(colorData)[index];

            if (colorData[key]["owner"] === player) {
                if (colorData[key]["houses"] == maxHouse-1) {
                    // this means that there is an imbalance with the properties and it should be accounted for
                    if (sameMax) {
                        sameMax = false;
                        index = 0;
                        nextAdditions = [];
                    } else {
                        nextAdditions.push(colorData[key]["property"]);
                    }
                } else if (colorData[key]["houses"] == maxHouse && sameMax) {
                    nextAdditions.push(colorData[key]["property"]);
                } else if (colorData[i]["hotel"] && maxHouse == 5 && sameMax) {
                    nextAdditions.push(colorData[key]["property"]);
                } else if (colorData[key]["hotel"] && maxHouse == 6) {
                    // this means that there is an imbalance with the properties and it should be accounted for
                    if (sameMax) {
                        sameMax = false;
                        index = 0;
                        nextAdditions = [];
                    } else {
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
     *   gameData updated with an array of properties if further action is required (means move forward)
     *   in the message location, otherwise the empty string
     * @param action the type of bus pass that is being used
     */
    this.useBusTicket = function(action) {
        // first get player info
        var player = this.currentPlayer();

        if (action.includes("any") || action.includes("expire")) {
            // means to move forward to any space
            var properties = bus.getForward(player.location, player.forward);
            this.gameData.message = properties;
            // will require further use of advance to location
            return this.gameData;
        } else if (action.includes("transit")) {
            var newLocation = bus.getNextTransit(player.location, player.forward);
            this.advanceToProperty(player.name, newLocation);
        } else if (action.includes("forward")) {
            // get rid of "forward " and turn into int
            var moves = parseInt(action.substring(7));
            var moveInfo = this.moveLocation(player.location, moves, moves % 2 == 0, player.forward, player.track);

            // use moveInfo to update player
            this.gameData.movedTo = moveInfo.movedTo;
            this.gameData.recentLocation = moveInfo.currentLocation;
            player.location = moveInfo.currentLocation;
            player.money += moveInfo.moneyGained;
            player.forward = moveInfo.reverse;
        } else if (action.includes("back")){
            // get rid of "back " and turn into int
            var moves = parseInt(action.substring(5));
            var moveInfo = moveLocation(player.location, moves, moves % 2 == 0, player.forward, player.track);

            // use moveInfo to update player
            this.gameData.movedTo = moveInfo.movedTo;
            this.gameData.recentLocation = moveInfo.currentLocation;
            player.location = moveInfo.currentLocation;
            player.money += moveInfo.moneyGained;
            player.forward = moveInfo.reverse;
        }
        this.gameData.message = "";
    }

    /**
     * Mutates gameData to give the player the property, with any side implications.
     * (DEPRECATED)
     * @param property the property to buy
     * @param player the player that is making the purchase
     */
    this.buyProperty = function(property, player) {
        var playerIndex = this.getPlayerIndexFromPlayer(player);

        this.gameData["owned"][property] = player;

        this.gameData["players"][playerIndex]["property"][property] = true; // not mortgaged

        var colorData = this.gameData["color"][board[property]["quality"]];

        for (var key in colorData) {
            if (key === property) {
                colorData[key]["owner"] = player;
            }
        }

        var color = board[property]["quality"];
        // account for house imbalance
        this.rebalanceHouses(color, player);

        // properties cost twice the mortgage price
        this.gameData["players"][playerIndex]["money"] -= 2*board[property]["mortgage"];
    }

    /**
     * Mutates gameData to give the player the property, with any side implications.
     * (DEPRECATED)
     * @param property the property to buy
     * @param player name of the player that is making the purchase
     * @param price the monetary amount that the player paid for the property
     */
    this.buyPropertyAuction = function(property, player, price) {
        var playerIndex = this.getPlayerIndexFromPlayer(player);

        this.gameData["owned"][property] = player;

        this.gameData["players"][playerIndex]["property"][property] = true; // not mortgaged

        var colorData = this.gameData["color"][board[property]["quality"]];

        for (var key in colorData) {
            if (key === property) {
                colorData[key]["owner"] = player;
            }
        }

        var color = board[property]["quality"];
        // account for house imbalance
        this.rebalanceHouses(color, player);

        // charge the auctioned price
        this.gameData["players"][playerIndex]["money"] -= price;
    }

    /**
     * Causes the property to be mortgaged so rent cannot be charged.
     * Precondition: house balance is already maintained
     * (DEPRECATED)
     * @param property the property to mortgage
     * @param the player that wants to mortgage such property
     */
    this.mortgageProperty = function(property, player) {
        var playerIndex = this.getPlayerIndexFromPlayer(player);

        if (this.gameData["players"][playerIndex]["property"][property]) {
            this.gameData["players"][playerIndex]["property"][property] = false;
            this.gameData["players"][playerIndex][money] += board[property]["mortgage"];
        }
    }

    /**
     * Simulates the player buying a house on a property (also works for hotels/skyscrapers)
     * (DEPRECATED)
     * @param property the property to buy a house on
     * @param the player that wants to buy the house
     */
    this.buyHouse = function(property, player) {
        var color = board[property]["quality"];
        var nextAdditions = nextToAdd(color, property, player);

        var inAdditions = false;
        var payForHouse = false;

        for (var i = 0; i < nextAdditions.length; i++) {
            if (nextAdditions[i] === property) {
                inAdditions = true;
            }
        }
        // just if houses
        if (this.ownsMajority(color, player) && inAdditions && this.gameData["color"][color]["houses"] < 4 && this.gameData["houses"] > 0) {
            var oldHouseNum = this.gameData["color"][color]["houses"];
            this.setHouseNumberForProperty(color, property, oldHouseNum + 1);
            payForHouse = true;
            this.gameData["houses"] -= 1;
        } else if (this.ownsAll(color, player) && inAdditions) { // handles hotels/skyscrapers since need to have the entire set for that
            // not a hotel yet
            if (!this.gameData["color"][color]["hotel"] && this.gameData["hotels"] > 0) {
                this.setHouseNumberForProperty(color, property, 5);
                this.gameData["houses"] -= 4;
                this.gameData["hotels"] += 1;
                payForHouse = true;
            } else if (this.gameData["skyscrapers"] > 0) {
                this.setHouseNumberForProperty(color, property, 6);
                this.gameData["skyscrapers"] += 1;
                this.gameData["hotels"] -= 1;
                payForHouse = true;
            }
        }

        // need to charge player for house
        if (payForHouse) {
            var housePrice = board[property]["house"];
            this.gameData["players"][playerIndex]["money"] -= housePrice;
        }
    }

    /**
     * Simulates the player selling a house from a property (also works for hotels/skyscrapers)
     * (DEPRECATED)
     * @param property the property to sell a house from
     * @param the player that wants to sell the house
     */
    this.sellHouse = function(property, player) {
        var color = board[property]["quality"];
        var colorData = this.gameData["color"][color];

        var cantSell = this.nextToAdd(color, property, player);

        var sellable = true;
        var soldHouse = false;

        // there are properties that cannot be sold
        if (cantSell.length !== Object.keys(colorData).length) {
            for (var i = 0; i < nextAdditions.length; i++) {
                if (nextAdditions[i] === property) {
                    sellable = false;
                }
            }
        }

        if (sellable) {
            if (colorData[property]["skyscraper"] && this.gameData["hotels"] >= 1) {
                this.setHouseNumberForProperty(color, property, 5);
                this.gameData["skyscrapers"] += 1;
                soldHouse = true;
            } else if (colorData[property]["hotel"] && this.gameData["houses"] >= 4) {
                this.setHouseNumberForProperty(color, property, 4);
                this.gameData["hotels"] += 1;
                this.gameData["houses"] -= 1;
                soldHouse = true;
            } else if (colorData[property]["houses"] > 0) {
                var oldHouseNum = colorData[property]["houses"];
                this.setHouseNumberForProperty(color, property, oldHouseNum - 1);
                this.gameData["houses"] += 1;
                soldHouse = true;
            }
            // can't put soldHouse variable here in case tried to sell houses on something that had 0
        }

        // need to refund player for house
        if (soldHouse) {
            var housePrice = board[property]["house"];
            this.gameData["players"][playerIndex]["money"] += housePrice/2;
        }
    }

    /**
     * Pays the rent to the player that should get it from the player landing on that location.
     * (TODO still handle on Game level probably)
     * @param property the location landed on that needs rent charged
     * @param player the player that is going to pay rent
     */
    this.payRent = function(property, player) {
        if (this.gameData["owned"][property]) {
            var owner = this.gameData["owned"][property];

            var ownerIndex = this.getPlayerIndexFromPlayer(owner);
            var playerIndex = this.getPlayerIndexFromPlayer(player);

            var cost = this.rentOfProperty(property);
            this.gameData["players"][playerIndex]["money"] -= cost;
            this.gameData["players"][ownerIndex]["money"] += cost;
        }
    }

    /**
     * Tells what the cost of the rent of the property is.
     * (TODO probably still handle on Game level probably)
     * @param property the location that information is requested about
     * @return the cost of rent for the property
     */
    this.rentOfProperty = function(property) {
        if (this.gameData["owned"][property]) {
            var rentArray = board[property]["rent"];
            var houseRentIndex = 0;

            var colorSet = this.gameData["color"][board[property]["quality"]];
            for (var key in colorSet) {
                if (key === property) {
                    houseRentIndex = colorSet[key]["houses"];
                    if (colorSet[key]["hotel"]) {
                        houseRentIndex = 5;
                    } else if (colorSet[key]["skyscraper"]) {
                        houseRentIndex = 6;
                    }
                }
            }

            var cost = rentArray[houseRentIndex];
            return cost;
        }
        else {
            return 0;
        }
    }

    /**
     * Trades data from player1 to player2.
     * (main function call definitely still on Game level, but specifics TODO)
     * @param player1 the first player in the trade
     * @param player2 the second player in the trade
     * @param properties1 the properties player1 is giving up
     * @param properties2 the properties player2 is giving up
     * @param wealth1 the amount of money player1 is giving up
     * @param wealth2 the amount of money player2 is giving up
     */
    this.trade = function(player1, player2, properties1, properties2, wealth1, wealth2) {
        var player1Index = this.getPlayerIndexFromPlayer(player1);
        var player2Index = this.getPlayerIndexFromPlayer(player2);
        var colors = new Set();

        // trade properties
        for (var i = 0; i < properties1.length; i++) {
            var mortgageBoolean = this.gameData["players"][player1Index][properties1[i]];
            delete this.gameData["players"][player1Index][properties1[i]];
            this.gameData["players"][player2Index][properties1[i]] = mortgageBoolean;
            // get color needed to fix
            colors.add(board[properties1[i]]["quality"]);
        }

        for (var i = 0; i < properties2.length; i++) {
            var mortgageBoolean = this.gameData["players"][player2Index][properties2[i]];
            delete this.gameData["players"][player2Index][properties2[i]];
            this.gameData["players"][player1Index][properties2[i]] = mortgageBoolean;
            // get color needed to fix
            colors.add(board[properties2[i]]["quality"]);
        }

        // rebalance houses for both
        for (var color in colors) {
            this.rebalanceHouses(color, player1);
            this.rebalanceHouses(color, player2);
        }

        // trade money
        this.changeMoneyForPlayer(player1, -1*wealth1);
        this.changeMoneyForPlayer(player1, wealth2);
        this.changeMoneyForPlayer(player2, -1*wealth2);
        this.changeMoneyForPlayer(player2, wealth1);
    }

    /**
     * Maintains the balance of houses when an external transaction can disrupt the balance
     * (DEPRECATED)
     * @param color the color that we need to balance
     * @param player the player whose properties need to be balanced
     */
    this.rebalanceHouses = function(color, player) {
        var colorData = this.gameData["color"][color]; // can probably be optimized a bit...
        var playerIndex = this.getPlayerIndexFromPlayer(player);

        // special cases: has all and imbalance, has majority and imbalance, has none
        if (this.ownsAll(color, player)) {
            var totalHouses = this.countHousesInColor(color);

            var housesPerProperty = Math.floor(totalHouses/Object.keys(colorData).length);

            for (var key in colorData) {
                this.setHouseNumberForProperty(color, key, housesPerProperty);
                totalHouses -= housesPerProperty;
            }

            // need to distribute the rest of the houses, people generally like on most expensive...
            //  keys generally in order of least valuable to most, so reverse order to fill valuable first
            for (var key in Object.keys(colorData).reverse()) {
                if (totalHouses > 0) {
                    var oldHouseNum = this.countHousesOnProperty(color, key);
                    this.setHouseNumberForProperty(color, key, oldHouseNum+1);
                    totalHouses -= 1;
                }
            }
        } else if (this.ownsMajority(color, player)) {
            var totalHouses = this.countHousesInColor(color);

            // need to count number of properties that belong to this player...
            var ownedProperties = [];
            for (var key in colorData) {
                if (colorData[key]["owner"] === player) {
                    ownedProperties.push(key);
                }
            }

            var housesPerProperty = Math.floor(totalHouses/ownedProperties.length);

            // can only put hotels/skyscapers if all are owned
            if (housesPerProperty > 4) {
                housesPerProperty = 4;
            }

            // check if need to add additional houses by adjusting total of totalHouses
            totalHouses -= housesPerProperty*ownedProperties.length; // will not evaluate to zero if floored amount was not same

            for (var i = ownedProperties.length-1; i >= 0; i--) {
                var additionalHouses = 0;
                if (totalHouses > 0 && housesPerProperty < 4) {
                    additionalHouses = 1;
                    totalHouses -= additionalHouses;
                }
                this.setHouseNumberForProperty(color, key, housesPerProperty + additionalHouses);
            }

            // refund remaining houses
            var housePrice = board[ownedProperties[0]]["house"];
            this.gameData["players"][playerIndex]["money"] += totalHouses*housePrice/2;
        } else { // need to refund all remaining houses from owned properties
            for (var key in colorData) {
                if (colorData[key]["owner"] === player) {
                    var houseCount = this.countHousesOnProperty(color, key);
                    var housePrice = board[key]["house"];

                    this.setHouseNumberForProperty(color, key, 0);

                    this.gameData["players"][playerIndex]["money"] += houseCount*housePrice/2;
                }
            }
        }
    }

    /**
     * Informs of how many houses are on properties in a certain color set
     * (DEPRECATED)
     * @param color the color that we are counting
     *
     * @return the total number of houses on properties in this color
     */
    this.countHousesInColor = function(color) {
        var colorData = this.gameData["color"][color];
        var total = 0;

        for (var key in colorData) {
            if (colorData[key]["skyscraper"]) {
                total += 6;
            } else if (colorData[key]["hotel"]) {
                total += 5;
            } else {
                total += colorData[key]["houses"];
            }
        }

        return total;
    }

    /**
     * Informs of how many houses are a specific property
     * (DEPRECATED)
     * @param color the color that we are counting
     * @param property the property we want the houses of
     *
     * @return the total number of houses on properties in this color
     */
    this.countHousesOnProperty = function(color, property) {
        var propertyData = this.gameData["color"][color][property];
        if (propertyData["skyscraper"]) {
            return 6;
        } else if (propertyData["hotel"]) {
            return 5;
        } else {
            return propertyData["houses"];
        }
    }

    /**
     * Tells the owner of the property or false if there is none
     * (DEPRECATED, but still likely on this level)
     * @param property the name of the property to check
     *
     * @return the owner of the property or false
     */
    this.isOwned = function(property) {
        return this.gameData["owned"][property];
    }

    /**
     * States whether or not the current location can be bought
     * (DEPRECATED)
     * @param the name of a location
     *
     * @return true if the location can be bought, otherwise false
     */
    this.canBuy  = function(location) {
        var locationType = board[location]["type"];
        return (locationType === 'property' || locationType === 'utility' || locationType === 'transportation') && !this.isOwned(property);
    }

    /**
     * Tells us what index in gameData["players"] the player is
     * (DEPRECATED, probably won't need anyways)
     * @param player name of the player to find the index of
     *
     * @return an integer of the index of the player specified, returns -1 if cannot be found
     */
    this.getPlayerIndexFromPlayer = function(player) {
        for (var i = 0; i < this.gameData["players"].length; i++) {
            if (this.gameData["players"][i]["name"] === player) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Moves the specified player to the location
     * (DEPRECATED)
     * @param player name of the player to find the index of
     * @param property the name of the property to move to
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     and an array of all of the locations visited in order in case an animation would like to have that
     */
    this.advanceToProperty = function(player, property) {
        var moneyGained = 0;

        var playerInfo = this.getPlayerIndexFromPlayer(player);
        var location = playerInfo.location;
        var track = playerInfo.track;
        var locationsMovedTo = [];
        var reverse = forward;

        while (location !== property) {
            var odd = player.track === board[location]["track"][0];
            locationJSON = nextLocation(location, odd, reverse, track);
            location = locationJSON.next;
            track = locationJSON.track;
            locationsMovedTo.push(location);

            // special cases about locations
            // gaining pay locations and tunnels
            if (location == "go") {
                moneyGained += 200;
            } else if (location === "pay day") {
                if (odd) {
                    moneyGained += 300;
                } else {
                    moneyGained += 400;
                }
            } else if (location === "bonus") {
                if (movesLeft === 0) {
                    moneyGained += 300;
                } else {
                    moneyGained += 250;
                }
            } else if (location === "holland tunnel ne" && movesLeft === 0) {
                location = "holland tunnel sw";
                locationsMovedTo.push(location);
            } else if (location === "holland tunnel sw" && movesLeft === 0) {
                location = "holland tunnel ne";
                locationsMovedTo.push(location);
            } else if (location === "reverse" && movesLeft === 0) {
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
     * (DEPRECATED)
     * @param player the String of the player whose money is going to change
     * @param delta the amount the player's money is changing
     */
    this.changeMoneyForPlayer = function(player, delta) {
        var playerIndex = this.getPlayerIndexFromPlayer(player);
        this.gameData["players"][playerIndex]["money"] += delta;
    }

    /**
     * Simulates drawing a chance card and intitiates the action needed to take
     * TODO TODO
     * @param player the player drawing the card
     */
    this.chanceCard = function(player) {
        // TODO
        // first draw a card
        var card = chance.draw();

        // handle if the card will just be kept
        if(card.play === "keep") {
          // TODO stuff

          // then finish up because nothing else needs to happen
          return card;
        }

        // now crazy barrage of if statements :(
        if(card.short === "advance pay corner") {
          // separate cases depending on the track of the current player
          if(player.track === "outer") {
            var moveInfo = this.jumpLocation("pay day");
            this.gameData.recentLocation = moveInfo.currentLocation;

            player.location = moveInfo.currentLocation;
            player.money += moveInfo.moneyGained;
          }
          else if(player.track === "middle") {
            var moveInfo = this.jumpLocation("go");
            this.gameData.recentLocation = moveInfo.currentLocation;

            player.location = moveInfo.currentLocation;
            player.money += moveInfo.moneyGained;
          }
          else {
            var moveInfo = this.jumpLocation("bonus");
            this.gameData.recentLocation = moveInfo.currentLocation;

            player.location = moveInfo.currentLocation;
            player.money += moveInfo.moneyGained;
          }
          // TODO check if actually gets paid?
        }
        else if(card.short === "advance utility") {

        }
        else if(card.short === "go jail") {
            var moveInfo = this.jumpLocation("jail");
            this.gameData.recentLocation = moveInfo.currentLocation;

            player.location = moveInfo.currentLocation;
            // collect no money
        }
        else if(card.short === "general repairs") {

        }
        else if(card.short.includes("advance")) {
          // TODO parse out the location to advance to
          // case tax refund = collect all of the pool
          // see if contains special?
        }
        else if(card.short.includes("pay pool")) {
          // TODO parse out the number that the player needs to pay
        }
        else if(card.short === "back 3") {

        }
        else if(card.short === "stock crash") {

        }
        else if(card.short === "dividends up 2") {

        }
        else if(card.short.includes("collect dividends")) {
          // TODO parse out the stocks that you are collecting dividends from
        }
        else if(card.short === "inside trade") {

        }
        else if(card.short.includes("collect")) {
          // TODO parse out dollar amount that the player is collecting
        }
        else if(card.short.includes("buy ")) {
          // TODO see the property that needs to be bought
        }
        else if(card.includes === "take") {

        }
        else if(card.short.includes("forward")) {

        }
        else if (card.short === "remove house color") {

        }
        else if(card.short.includes("pay players")) {
          // TODO check if need to generalize
        }
        else if(card.short === "seize assets") {

        }
        else if(card.short === "victory lap") {

        }
        else if(card.short === "all canal st") {

        }
        else if(card.short === "taxi wars") {

        }
        else if(card.short === "gps") {

        }
        else if(card.short === "1 free house") {

        }
        else if(card.short === "one below") {

        }
        else if(card.short === "one above") {

        }

        // TODO let's the user know what card they drew
        return card

    }

    /**
     * Simulates drawing a community chest card and intitiates the action needed to take
     * TODO TODO
     * @param player the player drawing the card
     */
    this.communityChestCard = function(player) {
        // TODO
    }


    /**
     * Returns the name of the property with the highest rent
     * (TODO redo it)
     * @return String name of the property with the highest rent, null if no property owned
     */
    this.highestRent = function() {

        var colorData = this.gameData["color"];
        var highestProperty = {
            "name": null,
            "price": 0
        }

        // loop through every property
        for (var color in colorData) {
            for (var property in colorData[color]) {
                var houses = this.countHousesOnProperty(color, property);
                var price = board[property]["rent"][houses];
                if (price > highestProperty["price"] && this.isOwned(property)) {
                    highestProperty["name"] = property;
                    highestProperty["price"] = price;
                }
            }
        }

        return highestProperty["name"];
    }

    /**
    * Moves the current player to the property of the highest rent.
    */
    this.moveHighestRent = function() {
      return this.jumpLocation(this.highestRent());
    }

    /*
    * Resets all of the prices in the auction.
    */
    this.newAuction = function(callback) {
        this.auctionPrices = {};
    }

    /*
    * Sets all of the prices in the auction to null
    */
    this.addBid = function(player, price) {
        this.auctionPrices[player] = price;
        if(this.biddingOver()) {
          return true;
        }
        else {
          return false;
        }
    }

    /*
    * Says if everyone has placed a bid
    * @return true if everyone has placed a bid
    */
    this.biddingOver = function() {
        for(var player in this.gameData["players"]) {
            if(!this.auctionPrices[this.gameData["players"][player]["name"]]) {
                return false;
            }
        }

        return true;
    }

    /*
    * Tells who the winner of the auction is if there is one
    * @return the name of the winner of the auction if bidding is over, otherwise false
    */
    this.auctionWinner = function() {
        if(!this.biddingOver()) {
            return false;
        }

        var top = this.gameData["players"][0]["name"];

        for(var player in Object.keys(this.auctionPrices)) {
            if(this.auctionPrices[player] > this.auctionPrices[top]) {
                top = player;
            }
        }

        for(var player in this.gameData["players"]) {
            if(this.auctionPrices[this.gameData["players"][player]["name"]] > this.auctionPrices[top]) {
                top = this.gameData["players"][player]["name"];
            }
        }

        return {"player": top, "price": this.auctionPrices[top]};
    }

    /**
    * TODO
    *
    */
    this.taxiRide = function() {

    }

    /**
    * TODO update how to create game data, will definitely need for saving the game for later
    * @return the gameData stored in this object
    */
    this.getData = function() {
        return this.gameData;
    }

    /**
    * Sets the message field in the gameData to message
    * @param message the message that is to be set
    */
    this.setMessage = function(message) {
        this.gameData["message"] = message;
    }

    /**
    * (TODO DEPRECATED)
    * @return a list of the all of the locations on the board
    */
    this.getAllLocations = function() {
        var all = [];

        for(var place in Object.keys(board)) {
            all.push(place);
        }

        return all;
    }

    /**
    * (TODO DEPRECATED)
    * @return a list of the all of the locations not yet bought on the board
    */
    this.getAllUnownedLocations = function() {
      var unowned = [];
      for(var spot in this.gameData["owned"]) {
          if(this.gameData["owned"][spot]) {
            unowned.push(spot);
          }
      }
      return unowned;
    }

    /**
    * Gives relevant information about the requested property
    * (DEPRECATED TODO create in property class/subclasses)
    * @param property name of the property info is requested for
    * @return json with relevant information about the property
    */
    this.getPropertyInfo = function(property) {
        var info = {}; // info we will return
        var boardInfo = board[property]; // straight info from board.js

        info["name"] = boardInfo["name"];
        info["rent"] = boardInfo["rent"];
        info["mortgage"] = boardInfo["mortgage"];
        info["price"] = 2*boardInfo["mortgage"];
        if(boardInfo["type"] === "property") {
            info["type"] = boardInfo["quality"];
        }
        else {
            info["type"] = boardInfo["type"];
        }
        if(this.isOwned(property)) {
            info["owner"] = this.isOwned(property);
        }

        return info;
    }
}

module.exports = Game;
