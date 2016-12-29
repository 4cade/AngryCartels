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

            // TODO other init stuff as needed
            // needs: free parking, highest rent, handle auctions, chance/community chest
            //      getAllLocations, getAllUnownedLocations
        }
        else {
            // TODO in the future
        }
    }

    // GAMEPLAY METHODS

    startGame() {
        // scrambles the order and other stuff maybe
    }

    nextTurn() {
        // next player turn
    }

    rollDice() {
        // rolls dice and moves
    }

    unleashMrMonopoly() {
        // performs mr monopoly and moves
    }

    useBusTicket() {
        // uses the bus ticket and moves the player
    }

    buyProperty() {
        // TODO decide if want separate function for auction (probably not)
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

    payRent(player) {
        // player pays rent based on current location
    }

    trade() {
        // TODO figure out what needs to happen
    }

    // GET METHODS

    getCurrentPlayer() {
        // probably just the name?
    }

    getRent(property) {
        // gets the rent
    }

    getGameJSON() {
        // TODO send the entire game as a json that can be stored/reloaded from
    }

}

module.exports = Game;
