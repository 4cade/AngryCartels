var board = require('./board.js');
var bus = require('./bus.js');
var roll3 = require('./roll3.js');
var chance = require('./chance.js');
var communityChest = require('./communityChest.js');

// gamePresets: the original data used for the game
// gameData: the data that will be used for the game
var Game = function(gamePresets) {
    this.gameData = JSON.parse(JSON.stringify(gamePresets));
    // changes a player from just a string to an actual player
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

    /**
     * Makes it so the gameData has the next player in the order to go.
     *
     * @return modified gameData with the turn put on the next player
     */
    this.nextTurn = function() {
        this.gameData["turnIndex"]++;
        if (this.gameData["turnIndex"] === this.gameData["turnOrder"].length) {
            this.gameData["turnIndex"] = 0;
        }
        return this.gameData;
    }

    /**
     * Informs whose turn it is.
     *
     * @return object of the player whose turn it is
     */
    this.currentPlayer = function() {
        return this.gameData["players"][this.gameData["turnOrder"][this.gameData["turnIndex"]]];
    }

    /**
     * Handles the entire turn of when the user chooses to roll the dice by moving the current 
     *     player to wherever the dice puts him/her and indicates the next action.
     *
     * @return gameData with updated player information and this.gameData.recentLocation has the new location
     *     of the player and this.gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
     */
    this.rollDice = function() {
        var die1 = Math.floor(Math.random()*6+1);
        var die2 = Math.floor(Math.random()*6+1);
        var specialDie = Math.floor(Math.random()*6+1);

        var diceTotal = die1 + die2;
        var special = "";
        
        if (specialDie === 4 || specialDie === 5) {
            special = "mrmonopoly";
        } else if (specialDie === 6) {
            special = "gainbusticket";
        } else {
            diceTotal += specialDie;
        }

        var odd = diceTotal % 2 !== 0;
        this.gameData.lastOdd = odd;

        var player = this.currentPlayer();

        var moveInfo = this.moveLocation(player.location, diceTotal, odd, player.forward, player.track);

        // use moveInfo to update player
        this.gameData.movedTo = moveInfo.movedTo;
        this.gameData.recentLocation = moveInfo.location;
        player.location = moveInfo.location;
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

        return this.gameData;
    }

    /**
     * Handles the action of going through a Mr. Monopoly roll; will move the player to the next unowned
     *     property unless he/she gets back to his/her currentLocation without encountering one.
     *
     * @return gameData with updated player information and this.gameData.recentLocation has the new location
     *     of the player and this.gameData.message will have "mrmonopoly" if the player should go through a mrmonopoly
     */
    this.unleashMrMonopoly = function() {
        var player = this.currentPlayer();

        var moveInfo = this.mrMonopolyLocation(player.location, this.gameData.lastOdd, player.forward, player.track);

        // use moveInfo to update player
        this.gameData.movedTo = moveInfo.movedTo;
        this.gameData.recentLocation = moveInfo.location;
        player.location = moveInfo.location;
        player.money += moveInfo.moneyGained;

        return this.gameData;
    }

    /**
     * Moves the user to the next unowned property in the forward direction, or
     *     not at all if there are no unowned properties in the forward path
     *
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

        while (!firstMove && location !== currentLocation && this.gameData["owned"][location] !== undefined) {
            firstMove = false;
            locationJSON = this.nextLocation(location, odd, forward, track);
            location = locationJSON.next;
            track = locationJSON.track;
            locationsMovedTo.push(location);
            movesLeft--;

            // special cases about locations
            // gaining pay locations and tunnels
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
            } else if (location == "holland tunnel ne") {
                location = "holland tunnel sw";
                locationsMovedTo.push(location);
            } else if(location == "holland tunnel sw") {
                location = "holland tunnel ne";
                locationsMovedTo.push(location);
            }
        }

        var json = {};
        // actually found a new location OR went in a loop and failed to find a new unowned property
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
     *
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
            } else if (location === "holland tunnel ne") {
                location = "holland tunnel sw";
                locationsMovedTo.push(location);
            } else if(location === "holland tunnel sw") {
                location = "holland tunnel ne";
                locationsMovedTo.push(location);
            } else if(location === "reverse") {
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
     *
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
        json.next = track; // only changes if lands on railroad

        // handles railroad case
        if (board[currentLocation]["quality"] === "railroad" && track !== "middle") {
            json.next = next[1]; // works because railroad's next direction has the middle track first always
        }

        // handles when you first land on a railroad
        if (board[json.next]["quality"] === "railroad") {
            if ((track === "middle" && !odd)|| (track !== "middle" && odd)) {
                json.track = board[json.next]["track"][1]; // will be either inner or outer
            } else {
                json.track = "middle";
            }
        }

        return json;
    }

    /**
     * Specifies what kind of action should occur on the current location that was landed on.
     *
     * @return String indicating what kind of action should occur?
     */
    this.executeLocation = function() {
        var location = this.gameData.recentLocation;
        var locationType = board[location]["type"];
        if (locationType === 'property' || locationType === 'utility' || locationType === 'transportation') {
            // check if owned => buy, else rent
            if (!isOwned(property)) {
                return "buy";
            } else {
                return "rent";
            }
        } else if (locationType === 'subway') {
            // allow teleport anywhere
            return "subway";
        } else if (locationType === 'chance') {
            // chance
            return "chance";
        } else if (locationType === 'community chest') {
            return "community chest";
        } else if (locationType === 'bus') {
            return "bus";
        } else if (locationType === 'auction') {
            // check if any unowned left, if not then go to one with highest rent
            for (var property in this.gameData["owned"]) {
                if(!this.gameData["owned"][property]) {
                    return "auction";
                } else {
                    return "highest rent";
                }
            }
        } else {
            // do nothing
            return "nothing";
        }
    }

    /**
     * Performs the task of teleporting to some location on the board.
     *
     * @param newLocation the location that the player wants to move to
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that 
     */
    this.jumpLocation = function(newLocation) {
        // pretend to be moving onto that location from one step behind to not have to rewrite code
        oldLocation = newLocation["backward"][0];
        return this.moveLocation(oldLocation, 1, true, true); // TODO get rid of weird side effects
    }
}