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

        // reload from saved state
        if(savedState) {
            this.forward = savedState['forward'];
            this.lastRolled = savedState['lastRolled'];
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
            "team": this.team.toJSON()
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
        return this.team.useBusPass(pass)
    }

    /**
     * The player acquires the specified chance/community chest card.
     * @param card Object name of the card
     * @return boolean true if card is added
     */
    gainSpecialCard(card) {
        return this.team.gainSpecialCard(card);
    }

    /**
     * The player uses the specified chance/community chest card and loses it.
     * @param card Object name of the card
     * @return boolean true if card is used, false otherwise
     */
    useSpecialCard(card) {
        return this.team.useSpecialCard(card);
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

}

module.exports = Player;
