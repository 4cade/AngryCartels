var board = require('./config/large_board');
var Card = require('./card');
var BoardManager = require('./boardManager');
var PlayerManager = require('./playerManager');

/**
 * The Game object is the main entry point into the game. It manages everything
 * @param gamePresets preset data to initialze the game, has just players if a new game.
 *      Otherwise, it has data for an entire game to resume it.
 * @param newGame specifies whether this is a new game
 */
class Game {
    constructor(gamePresets, newGame=true) {
        if(newGame) {
            // first initialize players
            // TODO decide how to set other board presets, maybe just put in board
            this.playerManager = new PlayerManager(gamePresets['player'], 'go', 1);
            this.boardManager = new BoardManager(board);

            // auction variables
            this.auction = null; // object of player names : auction price
            this.auctionGoing = false;
            this.auctionedProperty = null;

            this.lastOdd = false; // used for some methods
            this.log = []; // log of actions that have occurred in the game

            // needs: free parking, highest rent, chance/community chest
            //      getAllLocations, getAllUnownedLocations

            // scrambles player order for more fun
            this.playerManager.scrambleTurnOrder();

            // TODO hold timestamp so that checks can be made for auctions and stuff if taking too long
        }
        else {
            // TODO in the future to load a game from saved state
        }
    }

    /**
     * Turns the Game into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        // TODO this and boardManager (and underlings)
    }

    /****************************************************************************************
     * GAMEPLAY METHODS
     ****************************************************************************************/

    /**
    * Makes it so it is the next player's turn.
    * @return JSON with field message (string saying what happened)
    */
    nextTurn() {
        this.playerManager.nextTurn();
        const message = "It is now " + this.playerManager.getCurrentPlayer().name + "'s turn!";
        return {'message': message}
    }

    /**
    * Rolls the 3 dice for the player and moves him/her to the next location.
    * @return JSON with fields rolled (list of what was rolled), action (list
    *       of actions that the player should perform), movedTo (list of locations
    *       visited), player (JSON with name: name, money: money), and
    *       message (string saying what happened)
    */
    rollDice() {
        // need to simulate 3 dice just like the real game
        let player = this.playerManager.getCurrentPlayer();
        let die1, die2, die3 = Card.rollDie(), Card.rollDie(), Card.rollDie();
        let totalRoll = 0;
        let actions = [];
        let message = "";
        let json = {};

        if(die3 === 4 || die3 === 5) {
            die3 = 'mrmonopoly';
            totalRoll = die1 + die2;
        }
        else if(die3 === 6) {
            die3 = 'gain bus pass'
            totalRoll = die1 + die2;
        }
        else {
            totalRoll = die1 + die2 + die3
        }

        player.setLastRoll(totalRoll);

        // get stuff about the turn
        if(die1 === die2 === die3) {
            // do the teleport action
            actions.push('teleport');
        }
        else {
            // TODO update based on whatever happens with boardManager's API
            json = Object.extend(json, this.boardManager.moveLocation(player, totalRoll));
            actions = json['actions'];
        }

        // push other actions after based on priority
        if(isNan(die3)) {
            actions.push(action);
        }

        // see if the player's turn is over
        if(actions.length === 0) {
            actions.push('end turn'); // TODO decide if
        }
        json['rolled'] = [die1, die2, die3];
        json['message'] = message;

        return json;
    }

    /**
    * Performs the Mr. Monopoly search for the next unowned property and moves the player.
    * @return JSON with fields movedTo (list of locations visited), actions (list
    *       of actions that the player should perform), player (JSON with name: name, money: money),
    *       and message (string saying what happened)
    */
    unleashMrMonopoly() {
        const player = this.playerManager.getCurrentPlayer();
        let json = this.boardManager.nextMrMonopolyLocation(player, this.lastOdd);
        json['message'] = player.name + " used Mr. Monopoly to get to " + player.location; 
        return json;
    }

    /**
    * Uses the specified bus pass.
    * @param pass the name of the bus pass
    * @param location if the pass says "any" then this is the location to advance to
    *
    * @return JSON with fields movedTo (list of locations visited), actions (list
    *       of actions that the player should perform), player (JSON with name: name, money: money),
    *       and message (string saying what happened)
    */
    useBusPass(pass, location) {
        const player = this.playerManager.getCurrentPlayer();

        //player does not have the pass
        if (!player.busTickets.has(pass))
            return -1

        let json = {};
        let oldDirection = player.forward; // store to reset later
        // TODO implement the messages for this

        if(pass.includes('forward')) {
            player.forward = true;
        } else {
            player.forward = false;
        }

        if(pass.includes('any') && option) {
            json['actions'] = this.boardManager.advanceToLocation(player, location)['actions'];
        }
        else if(!pass.includes('any')) {
            const num = parseInt(pass.replace('forward', '').replace('backward', '').replace('expire', ''));
            json = Object.assign(json, this.boardManager.moveLocation(player, num));
        }

        // reset player to how they were before
        player.forward = oldDirection;

        return json;
    }

    /**
    * Takes a taxi ride to the specified location.
    * @param location to get transported to
    *
    * @return JSON with fields player1/player2? (JSON with name: name, money: money),
    *       pool (money in pool), and message (string saying what happened)
    */
    taxiRide(location) {
        //location is not on board
        if (!this.boardManager.locations.hasOwnProperty(location))
            return -1

        const player = this.playerManager.getCurrentPlayer();
        const owner = this.boardManager.isOwned();
        let json = {};

        // pay pool or owner
        if(owner === player.name) {
            let tempjson = this.boardManager.payPool(player, 20);
            json['player1'] = {"name": player.name, 'money': player.money}
            json['pool'] = tempjson['pool'];
        }
        else {
            player.deltaMoney(-50);
            owner.deltaMoney(50);
            json['player1'] = {"name": player.name, 'money': player.money}
            json['player2'] = {"name": owner.name, 'money': owner.money}
        }

        let actions = this.boardManager.jumpToLocation(player, location)['actions'];
        // only handle a subset of actions
        if(actions.includes('buy'))
            json["actions"] = ['buy'];
        else
            json["actions"] = [];

        json["message"] = player.name + " took a taxi to " + player.location; // TODO message
        return json;
    }

    /**
    * The current player buys the property that they are located on for market price.
    *
    * @return JSON with fields player (name: name, money: money), location (name of location),
    *      price (price paid for the property), message (saying what happened). null if failed
    */
    buyProperty() {
        const player = this.playerManager.getCurrentPlayer();
        let json = this.boardManager.buyProperty(player, player.location);
        json['message'] = player.name + "bought" + json.location + " for " + json.price; // TODO add message
        return json;
    }

    /**
    * The current player mortgages the properties in the list.
    * @param properties list of strings of property names to mortgage
    *
    * @return JSON with fields player (name: name, money: money), locations (list of successfully
    *      mortgaged locations), gain (money gained from mortgaging), message (saying
    *      what happened).
    */
    mortgage(properties) {
        const player = this.playerManager.getCurrentPlayer();
        let success = [];
        let gain = 0;

        for(let property of properties) {
            let json = this.boardManager.mortgageProperty(player, property);

            if(json.hasOwnProperty('location')) {
                success.push(property);
                gain += json.gain;
            }
        }
        
        const message = player.name + " mortgaged " + success + " and gained a total of " + gain; 

        return {"player": {"name": player.getName(), "money": player.getMoney()}, 
                "locations": success,
                "gain": gain,
                "message": message}
    }

    /**
    * The current player unmortgages the properties in the list.
    * @param properties list of strings of property names to unmortgage
    *
    * @return JSON with fields player (name: name, money: money), locations (list of successfully
    *      unmortgaged locations), lose (money lost from unmortgaging), message (saying
    *      what happened).
    */
    unmortgage(properties) {
        const player = this.playerManager.getCurrentPlayer();
        let success = [];
        let lose = 0;

        for(let property of properties) {
            let json = this.boardManager.unmortgageProperty(player, property);

            if(json.hasOwnProperty('location')) {
                success.push(property);
                lose += json.lose;
            }
        }
        const message = player.name + " unmortgaged " + success + " for a total of " + lose;
        return {"player": {"name": player.getName(), "money": player.getMoney()}, 
                "locations": success,
                "lose": lose,
                "message": message}
    }

    /**
     * Sets the houses for all of the properties in the houseMap.
     * @param houseMap JSON key property to preferred number of houses
     *
     * @return JSON with fields properties (map names to houses on them), player (name: name, money: money),
     *       delta (map names to change in houses)
     *
     */
    setHouses(houseMap) {
        const player = this.playerManager.getCurrentPlayer();
        let json = this.boardManager.setHousesForProperties(houseMap);
        // TODO message
        return json;
    }

    /**
    * The current player pays rent for the property that they are located on.
    * @return JSON with field message (string saying what happened) and
    *       player/owner (name: name, money: money)
    */
    payRent() {
        const player = this.playerManager.getCurrentPlayer();
        const rent = this.boardManager.getRent(player, player.location);
        const owner = this.boardManager.isOwned(player.location); // TODO use playerManager to get owner
        let json = {};

        if(!rent) {
            return {"message": player.location + " is unowned."};
        }
        
        player.deltaMoney(-rent);
        json['player'] = {'name': player.team, 'money': player.getMoney()};
        owner.deltaMoney(rent);
        json['owner'] = {'name': owner.name, 'money': owner.getMoney()};

        let message = player.name + " paid " + rent + " rent to " + owner.team;
        return {"message": message};
    }

    trade() {
        // TODO figure out what needs to happen
    }

    /****************************************************************************************
     * AUCTION METHODS
     ****************************************************************************************/

    /**
     * Starts an auction for a property. At most one auction can happen at any time.
     */
    startAuction(property) {
        // starts the auction and inits stuff
        this.auction = {};
        this.auctionGoing = true;
        this.auctionedProperty = property;
        const players = this.playerManager.getPlayers();

        players.forEach(p => {
            this.auction[p.name] = null;
        });
    }

    /**
     * Sets the price the player is willing to bid. Assumes no JS concurrency issues.
     * @param player the name of a player
     * @param price the price the player is willing to bid
     */
    setAuctionPrice(player, price) {
        if(this.auctionGoing) {
            this.auction[player] = price;
        }
    }

    /**
     * The winning player of the auction buys.
     * 
     * @return JSON with fields player (name: name, money: money), location (name of location),
     *      price (price paid for the property), message (saying what happened). null if failed
     */
    finishAuction() {
        if(this.auctionGoing) {
            // check that all fields are not null
            this.over = true;

            for(p in this.auction) {
                if(!this.auction[p]) {
                    this.over = false;
                }
            }

            if(this.over) {
                let top = -1
                let names = [];

                let second = -1;

                for(p in this.auction) {
                    if(this.auction[p] > top) {
                        second = top;
                        top = this.auction[p];
                        names = [p];
                    }
                    else if (this.auction[p] === top) {
                        names.push(p);
                    }
                }

                let player;
                let price;
                // goes 20 over the next highest bidder
                if(names.length === 1) {
                    player = this.playerManager.getPlayer(names[0]);
                    price = Math.min(top, second + 20);
                }
                // if multiple people chose the same amount, then randomly choose one to win
                else {
                    player = this.playerManager.getPlayer(Card.chooseRandom(names));
                    price = top;
                }

                let json = this.boardManager.buyProperty(player, this.auctionedProperty, price);

                this.auction = null;
                this.auctionGoing = false;
                this.auctionedProperty = null;
                // TODO add message
                return json; 
            }
        }

        // no winner
        return null;
    }

    /****************************************************************************************
     * GET METHODS
     ****************************************************************************************/

    // TODO expand by adding more getter methods

    /**
     * Informs whose turn it is.
     *
     * @return object of the player whose turn it is
     */
    getCurrentPlayer() {
        return this.playerManager.getCurrentPlayer(); // TODO decide if just want name or json
    }

    /**
     * Gets the rent of the property.
     * @param property name of the property
     *
     * @return JSON of {name: property, price: rent price (null if unowned)}
     */
    getRent(player, property) {
        let rent = this.boardManager.getRent(player, player.location);
        return {"name": property, "price": rent}
    }

    /**
    * Gets a list of all places that you can get by taxi.
    *
    * @return string list of all taxi/train locations
    */
    getTaxiLocations() {
        return this.boardManager.getTransitLocations();
    }

    /**
     * Gets a JSON that can be used to save the game and reloaded from.
     *
     * @return JSON with all of the Game's state
     */
    getGameJSON() {
        // TODO send the entire game as a json that can be stored/reloaded from
    }

}

module.exports = Game;
