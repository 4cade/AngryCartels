
/* Player object stores the state of a player and has functions to update state.
 * @param name String name of the player
 * @param startingSpace String name of the starting location of the player (usually Go)
 * @param startingTrack index of the starting track of the player (usually Go's track)
 */
var Player = function(name, startingSpace, startingTrack) {

    // set up initial state
    this.name = this.gameData["players"][index];
    this.money = 3200;
    this.property = {}; // key of property name which maps to a boolean of true if not mortgaged
    this.busTickets = {}; // key of bus ticket type to quantity
    this.getOutOfJails = 0;
    this.forward = true;
    this.location = startingSpace; // all players start on go
    this.track = startingTrack;
    this.specialCards = [] // list of special cards acquired via chance/community chest

    /* @return JSON representation without functions
     */
    this.toJSON = function() {
        // TODO
    }

    /* The player acquires the specified property.
     * @param property Object of the property
     */
    this.gainProperty = function(property) {
        // TODO
    }

    /* The player's money changes by a certain amount.
     * @param amt number amount of money to change by (can be pos/neg)
     *
     * @return true if player still has money left, false if negative
     */
    this.deltaMoney = function(amt) {
        // TODO
    }

    /* The player acquires the specified bus pass.
     * @param pass String name of the bus pass
     */
    this.gainBusPass = function(pass) {
        // TODO
    }

    /* The player uses the specified bus pass and loses it.
     * @param pass String name of the bus pass
     */
    this.useBusPass = function(pass) {
        // TODO
    }

    /* The player moves to a new Location with any side effects that occur.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (String location name), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location)
     */
    this.moveToLocation = function(moveInfo) {
        // TODO
    }

    /* The player jumps to a new Location with any side effects that occur.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (String location name), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location, should be size 0)
     */
    this.jumpToLocation = function(moveInfo) {
        // TODO
    }

}