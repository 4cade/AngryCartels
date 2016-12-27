/**
 * Handles the state of each turn and manages the players.
 * @param players list of Player objects in the game
 */
class PlayerManager {
    constructor(players) {
        this.turnOrder = players;

        this.turnIndex = 0;
        this.currentPlayer = players[0];
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
        for (let i=0; i<this.turnOrder.length; i++)
            if (this.turnOrder[i].name === playerName)
                return this.turnOrder[i]
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