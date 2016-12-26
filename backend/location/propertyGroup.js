const Place = require('./place.js');
const HouseProperty = require('./houseProperty.js');
const Utility = require('./utility.js');
const Railroad = require('./railroad.js');

/**
 * Handles the state of a group of properties such as balancing houses, majority, and monopoly
 * @param index the index that any property added to this group has
 */
class PropertyGroup {
    constructor(index) {
        this.index = index;

        this.properties = [];
    }

    /**
     * Adds the property to the group if it can be added
     *
     * @return true if it was added to the group
     */
    addProperty(property) {
        if(this.index === property.group) {
            this.properties.push(property);
            return true;
        }
        return false;
    }

    /**
     * Makes a player own a property.
     * @return true if successfully set new owner
     */
    newOwner(property, player) {
        let index = this.properties.indexOf(property);

        // not found
        if(index === -1) {
            return false;
        }

        this.properties[index].setOwner(player);
        player.gainProperty(property);
        return true;
    }

    /**
     * Check if a player has a majority of the properties.
     * @param player name of player
     * @return true if the player has a majority
     */
    hasMajority(player) {
        let count = 0;

        this.properties.forEach(p => {
            if(p.owner === player) {
                count += 1;
            }
        });

        return count > this.properties.length/2;
    }

    /**
     * Check if a player has a monopoly of the properties.
     * @param player name of player
     * @return true if the player has a monopoly
     */
    hasMonopoly(player) {
        let count = 0;

        this.properties.forEach(p => {
            if(p.owner === player) {
                count += 1;
            }
        });

        return count === this.properties.length;
    }

    /**
     * Adds a house to the property. If it is unbalanced then the houses will be balanced.
     *      Prioritizes adding a house to this property if it can.
     * @return 'not added' if not added, 'true' if added to this property, 'other' if
     *      added to a different property
     */
    addHouse(property) {
        // you can only add houses to HouseProperties
        if(property.kind !== 'property') {
            return 'not added';
        }

        const owner = property.owner;
        let houseCount = 0;
        let ownedProps = [];

        // count number of properties owned by owner and number of houses
        this.properties.forEach(p => {
            if(p.owner === owner) {
                houseCount += p.houses;
                ownedProps.push(p);
            }
        });

        let maxHouses = 0

        // check houses mod number of properties, if 0 just add house
        // otherwise check the ones that are not floor(num_p/num_house) and add 1 to it
        if(this.hasMonopoly(owner)) {
            maxHouses = ownedProps.length*6
        }
        else if(this.hasMajority(owner)) {
            maxHouses = ownedProps.length*4
        }
        
        if(houseCount < maxHouses) {
            // check if balanced or this property needs to be balanced
            if(houseCount % ownedProps.length === 0  || (houseCount % ownedProps.length !== 0 && property.houses < houseCount/ownedProps.length)) {
                property.addHouse();
                return 'true';
            }
            // otherwise some other property needs to be balanced
            else {
                this.properties.forEach(p => {
                    if(p.houses < houseCount/ownedProps.length) {
                        p.addHouse();
                        return 'other';
                    }
                });
            }

        }

        // if gets here then didn't add a house to anything
        return 'not added';
    }

    /**
     * Makes sure that the balance of houses is maintained. Highest value properties are
     *      prioritized.
     */
    rebalanceHouses() {
        // TODO decide if should autobalance or force the user to handle that or maybe a preference?

    }


    /**
     * Sets a priority order for the houses when they are autobalanced.
     *
     */
    setPriority(properties) {
        // preferance will just be the order of the properties TODO
        // check that they have the same properties
    }

    /**
     * Gets the index of the property with name propertyName.
     * @param propertyName the name of the property to find
     * 
     * @return index of the property or -1 if not found
     */
    indexOfProperty(propertyName) {
        for(i in this.properties) {
            if(this.properties[i] === propertyName) {
                return i;
            }
        }
        return -1;
    }
}

module.exports = PropertyGroup;