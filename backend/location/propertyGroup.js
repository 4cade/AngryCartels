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
        this.prioritySet = false;

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

            if(!this.prioritySet) {
                // order by highest cost
                this.properties.sort(function(a,b) {return a.cost < b.cost});
            }

            return true;
        }
        return false;
    }

    /**
     * Makes a player own a property.
     * @return -1 if failed, else number of houses lost by switching player
     */
    setOwner(property, player) {
        let index = this.properties.indexOf(property);

        // not found
        if(index === -1) {
            return -1;
        }

        // used to know how many houses lost from this property
        let theseHouses = property.houses;

        if(this.ownsMost() === player) {
            theseHouses = 0; // this means that these will not be in lost in the calculation
        }


        this.properties[index].setOwner(player);
        if(player !== null)
            player.gainProperty(property);

        // if houses are present majority/monopoly could have changed
        let needRebalance = false;
        this.properties.forEach(p => {
            if(p.houses > 0) {
                needRebalance = true;
            }
        });

        if(needRebalance) {
            return this.rebalanceHouses(theseHouses);
        }

        return 0;
    }

    /**
     * Moves all properties that player1 owns to player2.
     * @param player1 player object of sender
     * @param player2 player object of receiver
     * 
     * @return number of houses lost in the switch (should be 0)
     */
    transferAllOwnership(player1, player2) {
        this.properties.forEach(p => {
            if(p.owner === player1) {
                player1.loseProperty(p);
                p.setOwner(player2);
                player2.gainProperty(p);
            }
        });
        return this.rebalanceHouses(0);
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
     * Finds the player that owns the most properties in this set.
     * @return player that owns the most
     */
    ownsMost() {
        let freqMap = new Map();

        this.properties.forEach(p => {
            if(freqMap.has(p.owner)) {
                const old = freqMap.get(p.owner);
                freqMap.set(p.owner, old+1);
            }
            else {
                // store the player object so don't have to get it later
                freqMap.set(p.owner, 1);
            }
        });

        let best = null;
        let bestNum = 0;

        for(let [owner, freq] of freqMap) {
            if(freq > bestNum) {
                best = owner;
                bestNum = freq;
            }
        }

        return best;
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
     * @return 'false' if not added, 'true' if added to this property, 'other' if
     *      added to a different property
     */
    addHouse(property) {
        // you can only add houses to HouseProperties
        if(property.kind !== 'property') {
            return 'false';
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

        if(this.hasMonopoly(owner)) {
            maxHouses = ownedProps.length*6
        }
        else if(this.hasMajority(owner)) {
            maxHouses = ownedProps.length*4
        }

        if(houseCount < maxHouses) {
            // check if balanced or this property needs to be balanced
            if(houseCount % ownedProps.length === 0  || (houseCount % ownedProps.length !== 0 && property.houses <= Math.floor(houseCount/ownedProps.length))) {
                property.addHouse();
                return 'true';
            }
            // otherwise some other property needs to be balanced
            else {
                let added = false; // can't break from a forEach loop, just learned this
                this.properties.forEach(p => {
                    if(p.houses <= Math.floor(houseCount/ownedProps.length) && !added) {
                        added = true
                        p.addHouse();
                        return 'other';
                    }
                });
            }

        }

        // if gets here then didn't add a house to anything
        return 'false';
    }

    /**
     * Remove a house from the property. If it is unbalanced then the houses will be balanced.
     *      Prioritizes removing a house from this property if it can.
     * @return 'not removed' if not removed, 'true' if added to this property, 'other' if
     *      added to a different property
     */
    removeHouse(property) {
        // you can only add/remove houses to HouseProperties
        if(property.kind !== 'property') {
            return 'false';
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
        
        // check if balanced or this property can be used to balance
        if(houseCount % ownedProps.length === 0  || (houseCount % ownedProps.length !== 0 && property.houses > Math.floor(houseCount/ownedProps.length))) {
            property.removeHouse();
            return 'true';
        }
        // otherwise some other property needs to be balanced
        else {
            this.properties.forEach(p => {
                let removed = false;
                if(p.houses > Math.floor(houseCount/ownedProps.length) && !removed) {
                    removed = true;
                    p.removeHouse();
                    return 'other';
                }
            });
        }

        return 'false'
    }

    /**
     * Upgrades the property regardless of the kind of property.
     * @param property the property object to upgrade
     * @return 'true' if upgraded, 'false' if not upgraded, 'other' if
     *      upgraded a different property
     */
    upgrade(property) {
        if(property.kind === 'property') {
            return this.addHouse(property);
        }
        else if(property.kind == 'railroad') {
            return property.addTrainDepot().toString();
        }
        else if(property.kind == 'cab') {
            return property.addCabStand().toString();
        }

        // this property cannot be upgraded (ie. utility)
        return 'false';
    }

    /**
     * Downgrades the property regardless of the kind of property.
     * @param property the property object to downgrade
     * @return 'true' if downgraded, 'false' if not downgraded, 'other' if
     *      downgraded a different property
     */
    downgrade(property) {
        if(property.kind === 'property') {
            return this.removeHouse(property);
        }
        else if(property.kind == 'railroad') {
            return property.removeTrainDepot().toString();
        }
        else if(property.kind == 'cab') {
            return property.removeCabStand().toString();
        }

        // this property cannot be downgraded (ie. utility)
        return 'false';
    }

    /**
     * Makes sure that the balance of houses is maintained. Highest value properties are
     *      prioritized, unless it has been overridden.
     *  @offset number of houses that were lost from the property change
     *
     *  @return number of houses that were lost
     */
    rebalanceHouses(offset=0) {
        // you can only add houses to HouseProperties
        if(this.properties[0].kind !== 'property') {
            return 0;
        }

        const owner = this.ownsMost();
        let houseCount = 0 + offset;
        let ownedProps = [];

        // count number of properties owned by owner and number of houses
        this.properties.forEach(p => {
            if(p.owner === owner) {
                houseCount += p.houses;
                ownedProps.push(p);
            }
        });

        let maxHouses = 0

        if(this.hasMonopoly(owner)) {
            maxHouses = ownedProps.length*6
        }
        else if(this.hasMajority(owner)) {
            maxHouses = ownedProps.length*4
        }
        else {
            // just count all houses and set to 0, otherwise errors
            let lost = 0;

            this.properties.forEach(p => {
                lost += p.houses;
                p.houses = 0;
            });

            return lost;
        }

        let amt = Math.min(maxHouses, houseCount);
        let target = Math.floor(amt/ownedProps.length); // this is the target per property
        let excess = amt - target*ownedProps.length;
        let lost = houseCount - amt;

        this.properties.forEach(p => {
            if(p.owner === owner) {
                p.houses = target;
                if(excess > 0) {
                    p.addHouse();
                    excess -= 1;
                }
            }
            else {
                p.houses = 0;
            }
        });

        return lost;
    }


    /**
     * Sets a priority order for the houses when they are autobalanced.
     * @param properties list of properties in the order they should be prioritized
     *      (earlier means higher priority)
     * @return true if a new priority was set
     */
    setPriority(properties) {
        // preferance will just be the order of the properties
        // check that they have the same properties
        if(properties.length !== this.properties.length) {
            return false;
        }

        // get 2 sorted versions and compare elements
        const p_sorted = properties.slice().sort(function(a, b) {return a.name < b.name});
        const this_sorted = this.properties.slice().sort(function(a, b) {return a.name < b.name});

        for(let i = 0; i < this_sorted.length; i++) {
            // TODO see if this method works... because I'm lazy... very lazy
            if(p_sorted[i] !== this_sorted[i]) {
                return false;
            }
        }

        // just reset if hasn't been proven wrong
        this.properties = properties;
        this.prioritySet = true;
        return true;
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