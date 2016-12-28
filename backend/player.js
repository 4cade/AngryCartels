/**
 * Player object stores the state of a player and has functions to update state.
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
        this.specialCards = {} // key of special cards acquired via chance/community chest to quantity
    }

    /**
     * @return JSON representation without functions
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

    /**
     * Calculates the net worth of the player
     * 
     * @return int net worth of the player
     */
    getNetWorth() {
        let worth = this.money

        this.properties.forEach(property => {
            worth += property.getValue()
        });

        return worth
    }

    /**
     * Determines if the player can afford to buy item of amt, but doesn't change amount of money
     * @param amt - numerical amount of money to check affordability with
     * @return boolean true if player can afford, false otherwise
     */
    canAfford(amt){
        return this.money - amt >= 0
    }

    /**
     * The player acquires the specified property.
     * @param property Object of the property
     * @return boolean true if property is added, false otherwise
     */
    gainProperty(property) {
        if (this.properties.indexOf(property) === -1){
            this.properties.push(property)
            return true
        }
        else
            return false
    }

    /**
     * The player loses the specified property.
     * @param property Object of the property
     * @return boolean true if property is removed, false otherwise
     */
    loseProperty(property) {
        if (this.properties.indexOf(property) !== -1){
            let index = this.properties.indexOf(property)
            this.properties.splice(index, 1)
            return true
        }
        else
            return false
    }

    /**
     * The player's money changes by a certain amount.
     * @param amt number amount of money to change by (can be pos/neg)
     * @return boolean true if player still has money left, false if negative (bankrupt)
     */
    deltaMoney(amt) {
        this.money += amt
        return this.money >= 0
    }

    /**
     * The player acquires the specified bus pass.
     * @param pass String name of the bus pass
     * @return boolean true if pass added
     */
    gainBusPass(pass) {
        if (pass.includes('expire')){
            this.busTickets = {}
            this.busTickets[pass] = 1
        }
        else if (this.busTickets.hasOwnProperty(pass))
            this.busTickets[pass] += 1
        else
            this.busTickets[pass] = 1
        return true
    }

    /**
     * The player uses the specified bus pass and loses it.
     * @param pass String name of the bus pass
     * @return boolean true if pass is used, false if do not own pass
     */
    useBusPass(pass) {
        // actual ticket usage handled by some other class
        if (this.busTickets.hasOwnProperty(pass)){
            this.busTickets[pass] -= 1
            if (this.busTickets[pass] === 0)
                delete this.busTickets[pass]
            return true
        }
        else
            return false
    }

    /**
     * The player acquires the specified chance/community chest card.
     * @param card Object name of the card
     * @return boolean true if card is added
     */
    gainSpecialCard(card) {
        if (this.specialCards.hasOwnProperty(card))
            this.specialCards[card] += 1
        else
            this.specialCards[card] = 1
        return true
    }

    /**
     * The player uses the specified chance/community chest card and loses it.
     * @param card Object name of the card
     * @return boolean true if card is used, false otherwise
     */
    useSpecialCard(card) {
        // Actual card usage handled by some other class
        if (this.specialCards.hasOwnProperty(card)){
            this.specialCards[card] -= 1
            if (this.specialCards[card] === 0)
                delete this.specialCards[card]
            return true
        }
        else
            return false
    }

    /**
     * The player moves to a new Location possibly gains money.
     * @param moveInfo JSON object with params moneyGained (num amount),
     *      currentLocation (Place object), and movedTo (list of Strings
     *      specifying the spots landed on to get to the current location)
     */
    moveToLocation(moveInfo) {
        this.location = moveInfo.currentLocation;
        this.deltaMoney(moveInfo.moneyGained);
    }

    /**
     * The player's forward direction changes.
     */
    switchDirection() {
        this.forward = !this.forward
    }

}

module.exports = Player;
