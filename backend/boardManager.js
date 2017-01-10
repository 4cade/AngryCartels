const Place = require('./location/place.js');
const HouseProperty = require('./location/houseProperty.js');
const Utility = require('./location/utility.js');
const Property = require('./location/property.js')
const Railroad = require('./location/railroad.js');
const CabCompany = require('./location/cabCompany.js');
const PropertyGroup = require('./location/propertyGroup.js');
const Collect = require('./location/collect.js');
const Teleport = require('./location/teleport.js');

/**
 * Manages all of the locations on the board and the states associated with them.
 * @param rawBoard JSON that represents a board
 */
class BoardManager {
    constructor(rawBoard) {
        this.houses = 81;
        this.hotels = 31;
        this.skyscrapers = 16;

        this.locations = {} //key location name to location object
        this.propertyGroups = {} // key group name to property/railroad/cab/utility object
        this.collects = {} // key location name to collect object
        this.teleports = {} // key location name to teleport object
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
                locObj = new Utility(name, loc);
            }
            else if (loc.type === 'collect') {
                locObj = new Collect(name, loc);
            }
            else if (loc.type === 'teleport'){
                locObj = new Teleport(name, loc);
            }
            else {
                locObj = new Place(name, loc);
            }

            let isProperty = (loc.type==='property' || loc.type==='railroad' || loc.type==='cab' || loc.type==="utility")
            // populate the property groups
            if(isProperty && this.propertyGroups.hasOwnProperty(locObj.group)) {
                this.propertyGroups[locObj.group].addProperty(locObj);
            }
            else if(isProperty) {
                this.propertyGroups[locObj.group] = new PropertyGroup(locObj.group);
                this.propertyGroups[locObj.group].addProperty(locObj);
            }

            // populate the locations
            this.locations[name] = locObj;

            // populate collects
            if (locObj.kind === 'collect')
                this.collects[name] = locObj;

            // populate teleports
            if (locObj.kind === 'teleport')
                this.teleports[name] = locObj;
        }
    }

    /**
     * Moves the player to the next location that is diceTotal steps away.
     * @param player the player object that rolled the dice
     * @param diceTotal total number rolled on the dice
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), and player (JSON with name: name, money: money)
     */
    moveLocation(player, diceTotal) {
        let nextInfo = {"next": player.location, "track": player.track}
        let odd = (diceTotal%2)===1
        let land = false

        while (diceTotal > 0){
            nextInfo = this.nextLocation(player.location, odd, player.forward, player.track)

            player.track = nextInfo["track"]
            player.location = nextInfo["next"]

            diceTotal -= 1

            land = diceTotal===0
            if (this.collects.hasOwnProperty(player.location)){
                player.money += this.collects[player.location].getGain(odd, land)
            }
        }
        if (this.teleports.hasOwnProperty(player.location)){
            player.track = this.teleports[player.location].getTrack(land)
            player.location = this.teleports[player.location].getLocation(land)
        }
        return this.locationAction(player.location)
    }

    /**
     * Returns the next location in whatever the forward direction is
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
     * Moves the player to the specified location.
     * @param player the player to move
     * @param location the name of the location that is desired to move to
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), and player (JSON with name: name, money: money)
     */
    jumpToLocation(player, location) {
        let gain = 0
        let odd = true  ///temporary until get roll
        let track = this.locations[location].track
        if (this.collects.hasOwnProperty(location)){
            gain += this.collects[location].getGain(odd, true)
        }
        else if (this.teleports.hasOwnProperty(location)){
            track = this.teleports[location].getTrack(true)
            location = this.teleports[location].getLocation(true)
        }
        // TODO roll to choose the track to be on.
        return {"next": location, "gain": gain, "track": track[0], "visit": [location]}
    }

    /**
     * Returns the information to get to the desired location moving incrementally
     * @param player the player object that is going to move there
     * @param desiredLocation the location to move to
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), and player (JSON with name: name, money: money)
     */
     advanceToLocation(player, desiredLocation) {
        let nextInfo = {"next": player.location, "track": player.track}
        let visited = []
        let land = false

        while (player.location !== desiredLocation){
            let odd = track===this.locations[player.location].track[0]
            nextInfo = this.nextLocation(player.location, odd, player.forward, player.track)

            player.track = nextInfo["track"]
            player.location = nextInfo["next"]
            visited.push(player.location)

            land = player.location===desiredLocation
            if (this.collects.hasOwnProperty(player.location)){
                player.money += this.collects[player.location].getGain(odd, land)
            }
        }
        if (this.teleports.hasOwnProperty(location)){
            player.track = this.teleports[player.location].getTrack(land)
            player.location = this.teleports[player.location].getLocation(land)
            visited.push(player.location)
        }
        return {"next": player.location, "gain": player.money, "track": player.track, "visit": visited}
    }

    /**
     * Finds the next unowned property in the player's forward direction and moves the player there
     *      if it exists
     * @param player the player object about to do the Mr. Monopoly
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), and player (JSON with name: name, money: money)
     */
    nextMrMonopolyLocation(player) {
        let nextInfo = {"next": player.location, "track": player.track}
        let visited = []
        let odd = player.lastRolled%2===1

        while (!this.canBuy(location)){
            nextInfo = this.nextLocation(player.location, odd, player.forward, player.track)
            
            player.location = nextInfo["next"]
            player.track = nextInfo["track"]
            visited.push(player.location)

            let land = player.location===desiredLocation
            if (this.collects.hasOwnProperty(player.location)){
                player.money += this.collects[player.location].getGain(lastOdd, land)
            }
        }

        return {"next": player.location, "gain": player.money, "track": player.track, "visit": visited}
    }

    /**
     * Specifies what kind of action should occur on the current location that was landed on.
     * @param location string location of where to find action of
     * @return String indicating what kind of action should occur
     */
    locationAction(location) {
        let actions = []
        let land = this.locations[location]
        // TODO for this situation you can insert a property in Place called isProperty (boolean) and override it in Property
        if (land.kind === 'property' || land.kind === 'utility' || land.kind === 'railroad' || land.kind === "cab"){
            if (this.isOwned(location))
                actions.push("rent")
            else
                actions.push("buy")
        }
        if (land.kind === 'railroad'){
            actions.push("bus")
        }
        if (land.kind === 'chance'){
            actions.push("chance")
        }
        if (land.kind === 'community chest'){
            actions.push("community chest")
        }
        if (land.kind === 'subway'){
            actions.push("subway")
        }
        if (land.kind === 'bus'){
            actions.push("bus")
        }
        if (land.kind === 'stock'){
            actions.push("stock")
        }
        if (land.kind === 'auction'){
            let someLeft = false
            // TODO possible performance improvement: keep counter of unowned properties and dcerement/increment so doesn't have O(n) operation here
            for (let property in this.locations){
                if (!this.isOwned(property))
                    someLeft = true
            }
            if (someLeft){
                actions.push("auction")
            }
            else{
                actions.push("highest rent")
            }
        }
        // place, collect, reverse, teleport, squeeze play
        return actions
    }

    /**
    * When at least a majority is obtained in a property group, sets the number of houses to be placed on each property.
    * @param player the player object trying to set houses
    * @param houseMap JSON key property to preferred number of houses
    *
    * @return JSON with fields properties (map names to houses on them), player (name: name, money: money),
    *       delta (map names to change in houses)
    **/
    setHousesForProperties(player, houseMap) {
        /**
        if (propertySet.hasMajority(player)){
            for (let property of propertySet.properties){
                if (property ===){

                }
            }
            return true
        }
        return false
        **/
    }

    /**
     * Gives the player the property
     * @param player the player that is making the purchase
     * @param property String the property to buy
     * @param auctionPrice numerical value to pay in an auction, if -1 (default) there is no auction
     * 
     * @return JSON with fields player (name: name, money: money), location (name of location),
     *      price (price paid for the property). Empty JSON if failed
     */
    buyProperty(player, property, auctionPrice=-1) {
        if (auctionPrice>0){
            player.properties.push(property)
            // what if it's already owned? TODO
            this.locations[property].owner = player.name
            player.money -= auctionPrice
            return true
        }
        // TODO doesn't handle the normal case
        return false
    }

    /**
     * Causes the property to be mortgaged so rent cannot be charged.
     * Precondition: house balance is already maintained
     * @param the player that wants to mortgage the property
     * @param property the property to mortgage
     *
     * @return JSON with fields player (name: name, money: money), location (name of locations),
     *      gain (money gained through mortgage). Empty if failed
     */
    mortgageProperty(player, property) {
        // TODO remove precondition & just check if it has houses
        if (player.properties.includes(property)){ // TODO consider using location.owner.name and comparing names (faster)
            this.locations[property].mortgage()
            return true
        }
        return false
    }

    /**
     * Causes the property to be unmortgaged so rent cannot be charged.
     *
     * @param the player that wants to unmortgage the property
     * @param property the property to unmortgage
     *
     * @return JSON with fields player (name: name, money: money), location (name of locations),
     *      lose (money lost through unmortgage). Empty if failed
     */
    unmortgageProperty(player, property) {
        // TODO
    }

    /**
     * Transfers the properties from player1 to player2 if possible. Tries to keep as many houses as possible.
     * @param player1 player losing the properties
     * @param player2 player losing the properties
     * @param properties list of string names of properties to transfer
     *
     * @return JSON with fields player1 (money gained from lost houses), player2 (JSON of property: # of houses)
     */
    transferProperties(player1, player2, properties) {
        // TODO, give full value of houses if they are lost
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
    * Gets the amount of rent for a specific location
    * @param location String location to find rent of
    * 
    * @return int amount of money or null if none available
    **/
    getRent(player, location) {
        let land = this.locations[location]
        let numOwned = this.PropertyGroup[land.type].getNumberOwned(player)
        let monopoly = this.PropertyGroup[land.type].hasMonopoly()

        if (land.kind === 'property'){
            return land.getRent(monopoly)
        }
        else if (land.kind === 'utility'){
            return land.getRent(numOwned, player.lastRolled)
        }
        else if (land.kind === 'railroad'){
            return land.getRent(numOwned)
        }
        else if (land.kind === 'cab'){
            return land.getRent(numOwned)
        }
        return null
    }

    /**
     * States whether or not the location can be bought
     * @param the name of a location
     *
     * @return true if the location can be bought, otherwise false
     */
    canBuy(location) {
        let land = this.locations[location]
        // TODO create isProperty field of properties and others and just set true for properties
        let isProperty = (land.kind === 'property' || land.kind === 'utility' || land.kind === 'railroad' || land.kind === 'cab')
        return (isProperty && isOwned(location))
    }

    /**
     * Gets a list of all of the locations in the forward direction
     * @param player the player that wants to move somewhere in the forward direction
     *
     * @return list of all locations in the forward direction
     */
    locationsInForwardDirection(player) {
        // TODO use properties of player
    }

    /**
     * Gets the next railroad in the forward direction
     * @param player the player that wants to take the next transit
     *
     * @return name of next railroad in the forward direction
     */
    nextTransit(player) {
        // TODO probably use player instead of forward, stay on same track?
        let land = this.locations[location]
        let nextInfo = {"next": location, "track": land.track}

        while (land.type !== "railroad"){
            nextInfo = (location, true, forward, land.track)
            location = nextInfo["next"]
            land = this.locations[location]
        }
        return location
    }

    /**
     * Gets a list of all of the transit locations.
     *
     * @return list of all bus/train locations
     */
    getTransitLocations() {
        // TODO
    }

    /**
     * Pays the pool from the player.
     * @param player the player object that is paying the pool
     * @param money amount being paid
     *
     * @return JSON with fields player (money player has left) and pool (money in pool)
     */
    payPool(player, money) {
        // TODO
    }

    /**
     * Pays the pool from the player.
     * @param player the player object that is paying the pool
     * @param mult multiplier (0 <= amt <= 1) for amount collected from pool
     *
     * @return JSON with fields player (money player has left) and pool (money in pool)
     */
    collectFromPool(player, mult=0.5) {
        // TODO
    }
}



module.exports = BoardManager;