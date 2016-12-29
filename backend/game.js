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
        }
        else {
            // TODO in the future to load a game from saved state
        }
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
    *       of actions that the player should perform), and message (string saying what happened)
    */
    rollDice() {
        // TODO
    }

    /**
    * Performs the Mr. Monopoly search for the next unowned property and moves the player.
    * @return JSON with fields action (list of actions that the player should perform)
    *       and message (string saying what happened)
    */
    unleashMrMonopoly() {
        const player = this.playerManager.getCurrentPlayer();
        const action = this.boardManager.nextMrMonopolyLocation(player, this.lastOdd);
        const message = this.playerManager.getCurrentPlayer().name + "used Mr. Monopoly to get to " + this.playerManager.getCurrentPlayer().location; 
        return {'action': action, 'message': message}
    }

    /**
    * Uses the specified bus pass.
    * @param pass the name of the bus pass
    * @param location if the pass says "any" then this is the location to advance to
    *
    * @return JSON with fields action (list of actions that the player should perform)
    *       and message (string saying what happened)
    */
    useBusPass(pass, location) {
        const player = this.playerManager.getCurrentPlayer();
        // TODO check if the player actually has the pass
        let oldDirection = player.forward; // store to reset later
        let action = [];
        let message = ''; // TODO implement the messages for this

        if(pass.includes('forward')) {
            player.forward = true;
        } else {
            player.forward = false;
        }

        if(pass.includes('any') && option) {
            action = this.boardManager.advanceToLocation(player, location);
        }
        else if(!pass.includes('any')) {
            const num = parseInt(pass.replace('forward', '').replace('backward', '').replace('expire', ''));
            action = this.boardManager.moveLocation(player, num);
        }

        // reset player to how they were before
        player.forward = oldDirection;

        return {'action': action, 'message': message};
    }

    /**
    * The current player buys the property that they are located on for market price.
    * @return JSON with field message (string saying what happened)
    */
    buyProperty() {
        // TODO
    }

    mortgage() {
        // TODO decide if pass in clump of stuff
    }

    unmortgage() {
        // TODO decide if pass in clump of stuff
    }

    buyHouse() {
        // TODO decide how to handle multiple
    }

    sellHouse() {
        // TODO decide how to handle multiple
    }

    /**
    * The current player pays rent for the property that they are located on.
    * @return JSON with field message (string saying what happened)
    */
    payRent() {
        // TODO
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
     * @return JSON with field message (string saying what happened)
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
                let name = null;

                for(p in this.auction) {
                    if(this.auction[p] > top) {
                        top = this.auction[p]
                        name = p
                    }
                }

                this.auctionGoing = false;
                // TODO decide if should just buy the property now
                return {"player": name, "price": top}; 
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
        return this.playerManager.getCurrentPlayer(); // TODO decide if just want name
    }

    /**
     * Gets the rent of the property.
     * @param property name of the property
     *
     * @return JSON of {name: property, price: rent price (null if unowned)}
     */
    getRent(property) {
        // gets the rent
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
