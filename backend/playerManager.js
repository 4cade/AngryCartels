const Player = require('./player');

/**
 * Handles the state of each turn and manages the players.
 * @param players list of names of players
 * @param startLocation name of starting location
 * @param startTrack index of starting track
 */
class PlayerManager {
    constructor(players, startLocation, startTrack) {
        this.turnOrder = [];

        players.forEach(p =>{
            let player = new Player(p, startLocation, startTrack);
            this.turnOrder.push(player)
        })

        this.turnIndex = 0;
        this.currentPlayer = this.turnOrder[0];
        this.canRoll = true; // says if the current player can roll

        this.doubleCount = 0;
    }

    /**
     * Chooses the order of the players for the game.
     */
    scrambleTurnOrder() {
        for (let i = this.turnOrder.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [this.turnOrder[i - 1], this.turnOrder[j]] = [this.turnOrder[j], this.turnOrder[i - 1]];
        }
    }

    /**
     * Makes it so the next player in the order goes.
     */
    nextTurn() {
        this.turnIndex = (this.turnIndex+1) % this.turnOrder.length
        this.currentPlayer = this.turnOrder[this.turnIndex]
    }

    /**
     * Informs whose turn it is.
     *
     * @return object of the player whose turn it is
     */
    getCurrentPlayer() {
        return this.currentPlayer
    }

    /**
     * Gets the player object for the specified player name.
     * @param playerName String name of the player
     *
     * @return object of the player
     */
    getPlayer(playerName) {
        for (let player of this.turnOrder){
            if(player.name === playerName){
                return player
            }
        }
    }

    /**
     * Gets the player object for the specified player name.
     * @param playerName String name of the player
     *
     * @return list of player objects
     */
    getPlayers() {
        return this.turnOrder
    }
}

module.exports = PlayerManager;