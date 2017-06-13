const Team = require('./team');

/**
 * Player object stores the state of a player and has functions to update state.
 * @param name String name of the player
 * @param startingSpace String name of the starting location of the player (usually Go)
 * @param startingTrack index of the starting track of the player (usually Go's track)
 */
class Player {

    // set up initial state
    constructor(name, startingSpace, startingTrack, team, savedState) {
        if(team)
            this.team = team;
        else
            this.team = new Team(name);

        this.name = name;
        this.forward = true;
        this.location = startingSpace; // all players start on go
        this.track = startingTrack; // all players start on track 1
        this.lastRolled = 0 // int last value of dice roll
        this.jailTurnsLeft = 0;
        this.actions = new Set();
        this.onHoldActions = [];
        this.onNextTurn = null;

        // reload from saved state
        if(savedState) {
            this.forward = savedState['forward'];
            this.lastRolled = savedState['lastRolled'];
            this.actions = savedState['actions'];
            this.onHoldActions = savedState['onHoldActions'];
            this.onNextTurn = savedState['onNextTurn'];
        }
    }

    /**
     * @return JSON representation without functions
     */
    toJSON() {
        return {
            "name": this.name,
            "forward": this.forward,
            "location": this.location,
            "track": this.track,
            "lastRolled": this.lastRolled,
            "team": this.team.toJSON(),
            "actions": this.getActions(),
            "onHoldActions": this.onHoldActions,
            "onNextTurn": this.onNextTurn
        }
    }

    /**
     * Calculates the net worth of the player
     * 
     * @return int net worth of the player
     */
    getNetWorth() {
        return this.team.getNetWorth();
    }

    /**
    * Sets the number last rolled by the player
    * @param num int number last rolled
    *
    * @return boolean true if properly set, false otherwise
    **/
    setLastRoll(num){
        if (num < 15){
            this.lastRolled = num
            return true
        }
        return false
    }

    /**
     * @return the player's name
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the amount of money owned by this player/player's team
     * @return amount of money owned
     */
    getMoney() {
        return this.team.money;
    }

    /**
     * Determines if the player can afford to buy item of amt, but doesn't change amount of money
     * @param amt - numerical amount of money to check affordability with
     * @return boolean true if player can afford, false otherwise
     */
    canAfford(amt){
        return this.team.canAfford(amt);
    }

    /**
     * The player acquires the specified property.
     * @param property Object of the property
     * @return boolean true if property is added, false otherwise
     */
    gainProperty(property) {
        return this.team.gainProperty(property);
    }

    /**
     * The player loses the specified property.
     * @param property Object of the property
     * @return boolean true if property is removed, false otherwise
     */
    loseProperty(property) {
        return this.team.loseProperty(property);
    }

    /**
     * The player's money changes by a certain amount.
     * @param amt number amount of money to change by (can be pos/neg)
     * @return boolean true if player still has money left, false if negative (bankrupt)
     */
    deltaMoney(amt) {
        return this.team.deltaMoney(amt);
    }

    /**
     * The player acquires the specified bus pass.
     * @param pass String name of the bus pass
     * @return boolean true if pass added
     */
    gainBusPass(pass) {
        return this.team.gainBusPass(pass);
    }

    /**
     * The player uses the specified bus pass and loses it.
     * @param pass String name of the bus pass
     * @return boolean true if pass is used, false if do not own pass
     */
    useBusPass(pass) {
        return this.team.useBusPass(this, pass)
    }

    /**
     * The player acquires the specified fortune/misfortune card.
     * @param card Object name of the card
     * @return boolean true if card is added
     */
    gainSpecialCard(card) {
        return this.team.gainSpecialCard(card);
    }

    /**
     * The player uses the specified fortune/misfortune card and loses it.
     * @param card Object name of the card
     * @return boolean true if card is used, false otherwise
     */
    useSpecialCard(card) {
        return this.team.useSpecialCard(this, card);
    }

    /**
     * The player moves to a new Location possibly gains money.
     * @param property String location to move to
     * @param track Int track of location to move to
     * @param money Int amount gained by moving
     */
    moveToLocation(property, track, money) {
        this.location = property;
        this.track = track;
        this.deltaMoney(money);
    }

    /**
     * The player's forward direction changes.
     */
    switchDirection() {
        this.forward = !this.forward
    }

    /**
     * Sends the player to jail. DOES NOT SET THE LOCATION TO JAIL.
     */
    sendToJail() {
        this.jailTurnsLeft = 3;
    }

    /**
     * Uses a turn with the player in jail.
     * @return true if the player is in jail
     */
    jailTurn() {
        this.jailTurnsLeft--;
        return this.inJail();
    }

    /**
     * The player leaves jail.
     * @param pay true if the player pays to leave jail
     */
     leaveJail(pay) {
        if(pay)
            this.deltaMoney(-50);
        this.jailTurnsLeft = 0;
     }

     /**
     * Says if a player is in jail.
     * @return true if the player is in jail
     */
    inJail() {
        return this.jailTurnsLeft > 0;
    }

    /**
     * Sets the players actions for when a turn starts.
     */
    startTurn() {
        this.actions = new Set(['mortgage', 'unmortgage', 'build', 'trade', 'use special'])

        // this will be for jail or teleport (subway)
        if(this.onNextTurn) {
            this.actions.add(this.onNextTurn)
            this.onNextTurn = null;
        }
        else {
            this.actions.add('roll');
            this.actions.add('bus')
        }
    }

    /**
     * Sets the players actions for when a turn is over.
     */
    endTurn() {
        this.actions = new Set()

        if(this.inJail()) {
            this.onNextTurn = 'jail';
        }
    }

    /**
     * Adds an action to the player and removes any actions that should not be done yet
     *      and puts them on-hold.
     */
    addActions(actions) {
        // TODO
        this.onHoldActions = new Set(this.onHoldActions)
        this.actions.delete('end turn');
        for(let action of actions) {
            this.actions.add(action);
            this.onHoldActions.delete(action);
        }
        this.onHoldActions = Array.from(this.onHoldActions)

        if(this.actions.has('buy')) {
            const possible = ['roll', 'mrmonopoly', 'bus', 'taxi'];
            this.actions.add('up auction')

            for(let action of possible) {
                if(this.actions.delete(action)) {
                    this.onHoldActions.push(action);
                }
            }
        }
        else if(this.actions.has('rent') || this.actions.has('roll3') || this.actions.has('squeeze') || this.actions.has('draw misfortune') || this.actions.has('draw fortune')) {
            const possible = ['roll', 'mrmonopoly', 'bus', 'taxi'];

            for(let action of possible) {
                if(this.actions.delete(action)) {
                    this.onHoldActions.push(action);
                }
            }
        }
        else if(this.actions.has('mrmonopoly')) {
            const possible = ['roll', 'bus'];

            for(let action of possible) {
                if(this.actions.delete(action)) {
                    this.onHoldActions.push(action);
                }
            }
        }
        else if(this.actions.has('set auction price')) {
            const possible = this.getActions();

            for(let action of possible) {
                if(this.actions.delete(action)) {
                    this.onHoldActions.push(action);
                }
            }
        }
        else if(this.actions.has('roll')) {
            this.actions.add('bus');
        }

        if(Array.from(this.actions).length === 5) {
            this.actions.add('end turn');
        }
    }

    /**
     * Uses an action from the player and takes any that should be done now off on-hold
     * @return true if action is used
     */
    useAction(action) {
        let used = this.actions.delete(action);

        if(!used) {
            return false
        }

        if(action === 'roll') {
            this.actions.delete('bus');
            this.actions.delete('taxi');
        }
        else if(action === 'bus') {
            this.actions.delete('roll');
        }
        else if(action === 'mrmonopoly') {
            this.actions.delete('taxi');

            this.addActions(this.onHoldActions)
            this.onHoldActions = [];
        }
        else if(action === 'end turn') {
            this.endTurn();
        }
        else if(['mortgage', 'unmortgage', 'build', 'trade', 'use special'].includes(action)) {
            this.actions.add(action);
        }
        else if(['buy', 'rent', 'roll3', 'squeeze', 'draw fortune', 'draw misfortune'].includes(action)) {
            this.actions.delete('up auction');
            this.addActions(this.onHoldActions)
        }

        if(!(this.actions.has('roll')|| this.actions.has('draw fortune')||this.actions.has('draw misfortune')||this.actions.has('mrmonopoly')||this.actions.has('rent')||this.actions.has('buy')||this.actions.has('roll3')||this.actions.has('squeeze'))){
            this.actions.add('end turn');
        }

        return true;
    }

    /**
     * Gets all of the possible actions of the player
     */
    getActions() {
        return Array.from(this.actions);
    }

    /**
     * @return true if the player can do this action
     */
    canDoAction(action) {
        return this.actions.has(action);
    }
}

module.exports = Player;
