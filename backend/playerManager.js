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
            // TODO : create a teams variable in playermanager that keeps track of all the teams
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
            for(let name in savedState['teams']) {
                let data = savedState['teams'][name];
                let properties = [];
                for(let p of data['properties']) {
                    properties.push(locationObjs[p]);
                }
                teams[name] = new Team(name, data);
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
        this.currentPlayer = this.turnOrder[this.turnIndex];
    }

    /**
     * Makes it so the next player in the order goes.
     */
    nextTurn() {
        this.turnIndex = (this.turnIndex+1) % this.turnOrder.length;
        this.currentPlayer = this.turnOrder[this.turnIndex];
        this.doubleCount = 0;
        this.canRoll = true;
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
     * Gets all of the player objects.
     *
     * @return list of player objects
     */
    getPlayers() {
        return this.turnOrder
    }

    /**
     * Gets all of the player names.
     *
     * @return list of player names
     */
    getPlayerNames() {
        let names = [];

        for(let player of this.turnOrder) {
            names.push(player.name);
        }
        return names;
    }

    /**
     * Increases the number of times that the player has rolled doubles this turn.
     *
     * @return true if the player is sent to jail
     */
    increaseDoubleCount() {
        this.doubleCount++;

        if(this.doubleCount >= 3) {
            this.canRoll = false;
        }

        return this.canRoll;
    }

    /**
     * Gets a player object of a member of a team.
     * @param team string name of team
     *
     * @return player object of member of team or null if none exists
     */
    getTeamMember(team) {
        for(let player of this.turnOrder) {
            if(player.team.name === team) {
                return player;
            }
        }
        return null;
    }

    /**
     * Calls start on the first player so it has the correct actions
     */
    start() {
        this.currentPlayer.startTurn();
    }
}

module.exports = PlayerManager;