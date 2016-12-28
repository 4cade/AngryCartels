const Place = require('./location/place.js');
const HouseProperty = require('./location/houseProperty.js');
const Utility = require('./location/utility.js');
const Property = require('./location/property.js')
const Railroad = require('./location/railroad.js');
const CabCompany = require('./location/cabCompany.js');
const PropertyGroup = require('./location/propertyGroup.js');

/**
 * Manages all of the locations on the board and the states associated with them.
 * @param rawBoard JSON that represents a board
 */
class BoardManager {
    constructor(rawBoard) {
        this.houses = 81;
        this.hotels = 31;
        this.skyscrapers = 16;

        this.locations = {} //key location name to location objects
        this.propertyGroups = {}

        this.collectGroup = {
                                "go": [200],
                                "bonus": [250 ,300],    // [on, pass]
                                "pay day": [300, 400]   // [odd, even]
                            }
        this.teleportGroup = {
                                "go to jail": "jail", 
                                "holland tunnel ne": "holland tunnel sw", 
                                "holland tunnel sw": "holland tunnel ne", 
                                "subway": "here"
                            }
        this.cardGroup = {}

        for(let name in rawBoard) {
            const loc = rawBoard[name]; // preloaded data from the board
            let locObj = null; // it will get reassigned in the if statements

            if (loc.type === 'property') {
                locObj = new Property(name, loc);
            }
            else if (loc.type === 'railroad') {
                locObj = new Railroad(name, loc);
            }
            else if (loc.type === 'cab') {
                locObj = new CabCompany(name, loc);
            }
            else if (loc.type === 'utility') {
                locObj = new Utility(name, loc)
            }
            else {
                locObj = new Place(name, loc);
            }

            // populate the property groups
            if(locObj.kind !== 'place' && this.propertyGroups.hasOwnProperty(locObj.group)) {
                this.propertyGroups[locObj.group].addProperty(locObj);
            }
            else if(this.locObj !== 'place') {
                this.propertyGroups[locObj.group] = new PropertyGroup(locObj.group);
                this.propertyGroups[locObj.group].addProperty(locObj);
            }

            // populate the locations
            this.locations[name] = locObj
        }
    }

    /**
     * Finds the next location that is diceTotal steps away.
     * @param player the player object that rolled the dice
     * @param diceTotal total number rolled on the dice
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that
     */
    moveLocation(player, diceTotal) {
        let location = player.location
        let track = this.locations[player.location].track
        let nextInfo = {"next": location, "track": track}
        const odd = (diceTotal%2)===1
        let visited = []
        let gain = 0
        //let upperTrack = 

        while (diceTotal > 0){
            nextInfo = this.nextLocation(location, odd, player.forward, track)

            location = nextInfo["next"]
            track = nextInfo["track"]

            player.location = location
            visited.push(location)

            diceTotal -= 1

            let land = diceTotal===0
            if (this.collectGroup.hasOwnProperty(location)){
                if ((location === "pay day" && odd) || (location === "bonus" && land) || (location === "go"))
                    gain += this.collectGroup[location][0]
                else if ((location === "pay day" && !odd) || (location === "bonus" && !land))
                    gain += this.collectGroup[location][1]
            }
        }
        if (this.teleportGroup.hasOwnProperty(location)){
            location = this.teleportGroup[location]
            visited.push(location)
        }
        return {"next": location, "gain": gain, "track": track, "visit": visited}
    }

    /**
     * Returns the next location in whatever the forward direction is
     *
     * @param currentLocation string the current location of the player
     * @param odd true if the dice roll was odd or even
     * @param forward true if the player is moving in the forward direction
     * @param track the track that the user is on
     *
     * @return JSON with the next location that the user is going to go to, and the track of the user
     */
    nextLocation(currentLocation, odd, forward, track) {
        let next = null
        let current = this.locations[currentLocation]
        let lane = track
        
        let isRail = current.kind==="railroad"
        let upper = (current.track[0]===track && isRail)

        if (!isRail || (upper && odd) || (!upper && !odd)){
            if (forward)
                next = current.forward[0]
            else
                next = current.backward[0]
        }
        else if ((!upper && odd) || (upper && !odd)){
            if (forward)
                next = current.forward[1]
            else
                next = current.backward[1]
        }

        if (!upper && !odd && isRail)
            lane = current.track[0]
        else if (upper && !odd && isRail)
            lane = current.track[1]
        

        return {"next": next, "track": lane}
    }

    /**
     * Gets any side effects of landing only on that one location
     * @param location the name of the location that is desired to move to
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that
     */
    jumpToLocation(location) {
        let gain = 0
        let loc = this.locations[location]
        if (this.collectGroup.hasOwnProperty(location)){
            gain += this.collectGroup[location][0]                                                                //fix b.c assuming rolled odd
        }
        else if (this.teleportGroup.hasOwnProperty(location)){
            location = this.teleportGroup[location]
        }
        // TODO roll to choose the track to be on.
        return {"next": location, "gain": gain, "track": loc.track, "visit": [location]}
    }

    /**
     * Returns the information to get to the desired location moving incrementally
     * @param player the player object that is going to move there
     * @param desiredLocation the location to move to
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that
     */
     advanceToLocation(player, desiredLocation) {
        let location = player.location
        let track = this.locations[player.location].track
        let nextInfo = {"next": location, "track": track}
        let visited = []
        let gain = 0

        while (location !== desiredLocation){
            let odd = player.track===this.locations[location].track[0]                                           //fix b.c dont understand
            nextInfo = this.nextLocation(location, odd, player.forward, track)

            location = nextInfo["next"]
            track = nextInfo["track"]

            player.location = location
            visited.push(location)

            let land = location===desiredLocation
            if (this.collectGroup.hasOwnProperty(location)){
                if ((location === "pay day" && odd) || (location === "bonus" && land) || (location === "go"))
                    gain += this.collectGroup[location][0]
                else if ((location === "pay day" && !odd) || (location === "bonus" && !land))
                    gain += this.collectGroup[location][1]
            }
        }

        if (this.teleportGroup.hasOwnProperty(location)){
            location = this.teleportGroup[location]
            visited.push(location)
        }

        return {"next": location, "gain": gain, "track": track, "visit": visited}
    }

    /**
     * Finds the next unowned property in the player's forward direction, or
     *     null if there are no unowned properties in the forward path
     * @param player the player object about to do the Mr. Monopoly
     * @param lastOdd true if the last roll was an odd
     *
     * @return a JSON specifying the new location of the player, any money gained along the journey,
     *     a boolean specifying if the user is on the upper or lower track of a railroad, and an array
     *     of all of the locations visited in order in case an animation would like to have that
     */
    nextMrMonopolyLocation(player, lastOdd) {
        let location = player.location
        let track = this.locations[player.location].track
        let nextInfo = {"next": location, "track": track}
        let visited = []
        let gain = 0

        while (!this.canBuy(location)){
            nextInfo = this.nextLocation(location, lastOdd, player.forward, track)
            
            location = nextInfo["next"]
            track = nextInfo["track"]

            player.location = location
            visited.push(location)

            let land = location===desiredLocation
            if (this.collectGroup.hasOwnProperty(location)){
                if ((location === "pay day" && odd) || (location === "go"))
                    gain += this.collectGroup[location][0]
                else if ((location === "pay day" && !odd) || (location === "bonus" && !land))
                    gain += this.collectGroup[location][1]
            }
        }

        return {"next": location, "gain": gain, "track": track, "visit": visited}
    }

    /**
     * Specifies what kind of action should occur on the current location that was landed on.
     *
     * @return String indicating what kind of action should occur
     */
    locationAction(location) {
        // TODO see if should change
    }

    setHouseNumbersForPropertySet() {
        // TODO decide on spec for this, ie. automatically do it or let user set preference of order
        //      or make user manually add houses. many possible options TODO TODO TODO
        // depending on this can decide if we need buy/sell house functions too
    }

    /**
     * Gives the player the property
     * @param property the property to buy
     * @param player the player that is making the purchase
     * @param auctionPrice numerical value to pay in an auction, if -1 (default) there is no auction
     * 
     * @return true if the player can buy the property
     */
    buyProperty(player, property, auctionPrice=-1) {
        // TODO
    }

    /**
     * Causes the property to be mortgaged so rent cannot be charged.
     * Precondition: house balance is already maintained
     * @param the player that wants to mortgage the property
     * @param property the property to mortgage
     *
     * @return true if the player successfully mortgaged the property
     */
    mortgageProperty(player, property) {
        // TODO
    }

    transferProperty(player1, player2, property) {
        // TODO decide how exactly to handle this and to check house balancing and stuff like that
    }

    /**
     * Tells the owner of the property or false if there is none
     * @param property the name of the property to check
     *
     * @return the owner of the property or null if no owner
     */
    isOwned(property) {
        return this.locations[property].owner
    }

    /**
     * States whether or not the location can be bought
     * @param the name of a location
     *
     * @return true if the location can be bought, otherwise false
     */
    canBuy(location) {
        return !this.locations[location].owner
    }

    /**
     * Gets a list of all of the locations in the forward direction
     * @param location the name of the current locatoin
     * @param forward true if forward, false if backward
     *
     * @return list of all locations in the forward direction
     */
    locationsInForwardDirection(location, forward) {
        // TODO, also figure out what exactly we want to define as the forward direction
    }

    /**
     * Gets the next railroad in the forward direction
     * @param location the name of the current locatoin
     * @param forward true if forward, false if backward
     *
     * @return next railroad in the forward direction
     */
    nextTransit(location, forward) {
        // TODO
    }
}



module.exports = BoardManager;