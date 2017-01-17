const Player = require('./player');
const Team = require('./team');

/**
 * Handles the state of each turn and manages the players.
 * @param players list of names of players
 * @param startLocation name of starting location
 * @param startTrack index of starting track
 */
class PlayerManager {
    constructor(players, startLocation, startTrack, savedState, locationObjs) {
        if(!savedState) {
            this.turnOrder = [];

            players.forEach(p =>{
                let player = new Player(p, startLocation, startTrack);
                this.turnOrder.push(player)
            })

            this.turnIndex = 0;
            this.currentPlayer = this.turnOrder[0];
            this.canRoll = true; // says if the current player can roll

            this.doubleCount = 0; // TODO actually use this
        }
        else {
            // needs locations from boardManager
            let teams = {};
            this.turnOrder = [];
            this.turnIndex = savedState['turnIndex'];
            this.canRoll = savedState['canRoll'];
            this.doubleCount = savedState['doubleCount'];

            // create teams
            for(let t of savedState['teams']) {
                let properties = [];
                for(let p of t['properties']) {
                    properties.push(locationObjs[p]);
                }
                teams[t['name']] = new Team(t['name'], t);
            }

            // create players
            for(let pState of savedState['players']) {
                let playerObj = new Player(pState.name, pState.location, pState.track, teams[pState.team], pState);
                this.turnOrder.push(playerObj)
            }
            
            this.currentPlayer = this.turnOrder[this.turnIndex];
        }
    }

    /**
     * Turns the PlayerManager into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        let players = [];

        for(let player of this.turnOrder) {
            players.push(player.toJSON()); // should maintain the order
        }

        let teams = {};

        for(let player of players) {
            if(!teams.hasOwnProperty(player.team.name)) {
                teams[player.team.name] = player.team;
            }
            player['team'] = player.team.name;
        }

        return {
            "players": players,
            "teams": teams,
            "turnIndex": this.turnIndex,
            "canRoll": this.canRoll,
            "doubleCount": this.doubleCount
        }
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