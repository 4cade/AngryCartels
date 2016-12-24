/**
 * Handles the state of each turn and manages the players.
 * @param players list of Player objects in the game
 */
class PlayerManager {
    constructor(players) {
        this.turnOrder = players;

        this.turnIndex = 0;
        this.currentPlayer = playerNames[0];
        this.canRoll = true; // says if the current player can roll

        this.doubleCount = 0;
    }

    /**
     * Chooses the order of the players for the game.
     */
    scrambleTurnOrder() {
        // TODO
    }

    /**
     * Makes it so the next player in the order to go.
     */
    nextTurn() {
        // TODO
    }

    /**
     * Informs whose turn it is.
     *
     * @return object of the player whose turn it is
     */
    getCurrentPlayer() {
        // TODO
    }

    /**
     * Gets the player object for the specified player name.
     * @param playerName String name of the player
     *
     * @return object of the player
     */
    getPlayer(playerName) {
        // TODO
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