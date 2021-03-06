var Card = require('./card');

/**
 * Player object stores the state of a player and has functions to update state.
 * @param name String name of the player
 * @param startingSpace String name of the starting location of the player (usually Go)
 * @param startingTrack index of the starting track of the player (usually Go's track)
 */
class Team {

    // set up initial state
    constructor(name, savedState) {
        if(name)
            this.name = name;
        else
            this.name = Math.random().toString(36).substring(7); // random string

        if(!savedState) {
            this.money = 3200;
            this.properties = new Set(); // set of Property Objects
            this.busTickets = {}; // key of bus ticket type to quantity
            this.specialCards = {} // key of special cards acquired via fortune/misfortune to quantity

            // need to start with one bus ticket
            const pass = Card.drawBusPass();
            this.busTickets[pass] = 1;

            // TODO keep list of players?
        }
        else {
            // reload old state
            this.money = savedState['money'];
            this.properties = new Set(savedState['properties']); // TODO make sure get properties correctly
            this.busTickets = savedState['busTickets'];
            this.specialCards = savedState['specialCards'];
        }
        
    }

    /**
     * @return JSON representation without functions
     */
    toJSON() {
        let properties = [];
        for(let property of this.properties) {
            properties.push(property.name);
        }

        return {
            "name": this.name,
            "money": this.money,
            "properties": properties,
            "busTickets": this.busTickets,
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
        return this.money
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
        if (!this.properties.has(property)){
            this.properties.add(property)
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
        if (this.properties.has(property)){
            this.properties.delete(property)
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
     * The player acquires the specified fortune/misfortune card.
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
     * The player uses the specified fortune/misfortune card and loses it.
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

}

module.exports = Team;
