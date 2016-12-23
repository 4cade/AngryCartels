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
        this.properties = []; // list of Property Objects
        this.busTickets = {}; // key of bus ticket type to quantity
        this.forward = true;
        this.location = startingSpace; // all players start on go
        this.specialCards = [] // list of special cards acquired via chance/community chest
    }

    /* @return JSON representation without functions
     */
    toJSON() {
        let propertyJSONs = []

        this.properties.forEach(p => {
            propertyJSONs.push(p.toJSON());
        });

        return {
            "name": this.name,
            "money": this.money,
            "properties": propertyJSONs,
            "busTickets": this.busTickets,
            "forward": this.forward,
            "location": this.location,
            "specialCards": this.specialCards
        }
    }

    /* Calculates the net worth of the player
     * 
     * @return int net worth of the player
     */
    getNetWorth() {
        let worth = this.money

        for (let property in this.properties){
            worth += property.getValue()
        }

        return worth
    }

    /* Determines if the player can afford to buy item of amt, but doesn't change amount of money
     * @param amt - numerical amount of money to check affordability with
     * @return true if player can afford, false otherwise
     */
    canAfford(amt){
        return this.money - amt >= 0
    }

    /* The player acquires the specified property.
     * @param property Object of the property
     */
    gainProperty(property) {
        this.properties.push(property)
    }

    /* The player loses the specified property.
     * @param property Object of the property
     */
    loseProperty(property) {
        let index = this.properties.indexof(property)
        this.properties.splice(index, 1)
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
        this.busTickets.push(pass)
    }

    /* The player uses the specified bus pass and loses it.
     * @param pass String name of the bus pass
     */
    useBusPass(pass) {
        // actual ticket usage handled by some other class
        let index = this.busTickets.indexof(pass)
        this.busTickets.splice(index, 1)
    }

    /* The player acquires the specified chance/community chest card.
     * @param card Object name of the card
     */
    gainSpecialCard(card) {
        this.specialCards.push(card)
    }

    /* The player uses the specified chance/community chest card and loses it.
     * @param card Object name of the card
     */
    useSpecialCard(card) {
        // Actual card usage handled by some other class
        let index = this.specialCards.indexof(card)
        this.properties.splice(index, 1)
    }

    /* The player moves to a new Location possibly gains money.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (Place object), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location)
     */
    moveToLocation(moveInfo) {
        this.location = moveInfo.currentLocation;
        this.deltaMoney(moveInfo.moneyGained);
    }

}

module.exports = Player;
