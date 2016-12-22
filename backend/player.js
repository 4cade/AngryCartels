// trying to move to ES6


/* Player object stores the state of a player and has functions to update state.
 * @param name String name of the player
 * @param startingSpace String name of the starting location of the player (usually Go)
 * @param startingTrack index of the starting track of the player (usually Go's track)
 */
class Player {

    // set up initial state
    constructor(name, startingSpace, startingTrack) {
        this.name = name;
        this.money = 3200;
        this.property = {}; // key of property name which maps to a boolean of true if not mortgaged
        this.busTickets = {}; // key of bus ticket type to quantity
        this.getOutOfJails = 0;
        this.forward = true;
        this.location = startingSpace; // all players start on go
        this.track = startingTrack;
        this.specialCards = [] // list of special cards acquired via chance/community chest
    }

    /* @return JSON representation without functions
     */
    toJSON() {
        // TODO
    }

    /* The player acquires the specified property.
     * @param property Object of the property
     */
    gainProperty(property) {
        // TODO
    }

    /* The player's money changes by a certain amount.
     * @param amt number amount of money to change by (can be pos/neg)
     *
     * @return true if player still has money left, false if negative (bankrupt)
     */
    deltaMoney(amt) {
        this.money += amt
        return this.money >= 0
    }

    /* The player acquires the specified bus pass.
     * @param pass String name of the bus pass
     */
    gainBusPass(pass) {
        // TODO
    }

    /* The player uses the specified bus pass and loses it.
     * @param pass String name of the bus pass
     */
    useBusPass(pass) {
        // TODO
    }

    /* The player acquires the specified chance/community chest card.
     * @param card Object name of the card
     */
    gainSpecialCard(card) {
        // TODO
    }

    /* The player uses the specified chance/community chest card and loses it.
     * @param card Object name of the card
     */
    useSpecialCard(card) {
        // TODO
    }

    /* The player moves to a new Location with any side effects that occur.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (String location name), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location)
     */
    moveToLocation(moveInfo) {
        // TODO
    }

    /* The player jumps to a new Location with any side effects that occur.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (String location name), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location, should be size 0)
     */
    jumpToLocation(moveInfo) {
        // TODO
    }

}




module.exports = Player;
