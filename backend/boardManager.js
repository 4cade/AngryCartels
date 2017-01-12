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

        this.unownedProperties = 0;
        this.locations = {}; //key location name to location object
        this.propertyGroups = {}; // key group name to property/railroad/cab/utility object
        this.collects = {}; // key location name to collect object
        this.teleports = {}; // key location name to teleport object
        this.cardGroup = {};

        for(let name in rawBoard) {
            const loc = rawBoard[name]; // preloaded data from the board
            let locObj = null; // it will get reassigned in the if statements

            if (loc.type === 'property') {
                locObj = new HouseProperty(name, loc);
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

            // populate the property groups
            if(locObj.isProperty && this.propertyGroups.hasOwnProperty(locObj.group)) {
                this.propertyGroups[locObj.group].addProperty(locObj);
                this.unownedProperties += 1;
            }
            else if(locObj.isProperty) {
                this.propertyGroups[locObj.group] = new PropertyGroup(locObj.group);
                this.propertyGroups[locObj.group].addProperty(locObj);
                this.unownedProperties += 1;
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
        let visited = []

        while (diceTotal > 0){
            nextInfo = this.nextLocation(player.location, odd, player.forward, player.track)

            player.track = nextInfo["track"]
            player.location = nextInfo["next"]
            visited.push(player.location)

            diceTotal -= 1

            land = diceTotal===0
            if (this.collects.hasOwnProperty(player.location)){
                player.money += this.collects[player.location].getGain(odd, land)
            }
        }
        if (this.teleports.hasOwnProperty(player.location)){
            player.track = this.teleports[player.location].getTrack(land)
            player.location = this.teleports[player.location].getLocation(land)
            visited.push(player.location)
        }
        return {
                'player': {
                            'name': player.name, 
                            'money': player.money
                            }, 
                'movedTo': visited, 
                'actions': this.locationAction(player.location)
                }
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
        let odd = true  ///temporary until get roll\
        let visited = [location]
        player.location = location
        if (this.collects.hasOwnProperty(location)){
            player.money += this.collects[location].getGain(odd, true)
        }
        else if (this.teleports.hasOwnProperty(location)){
            player.track = this.teleports[location].getTrack(true)
            player.location = this.teleports[location].getLocation(true)
            visited.push(player.location)
        }
        // TODO roll to choose the track to be on.
        return {
                'player': {
                            'name': player.name, 
                            'money': player.money
                            }, 
                'movedTo': visited, 
                'actions': this.locationAction(player.location)
                }
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
        let visited = []
        let landed = false
        let odd = player.lastRolled%2===1
   
        // finds the path with shortest distance
        let visitedLoc = []
        let paths = [this.locations[player.location].forward]
        let connected = null

        while (paths.length > 0){
            for (let path of paths){
                let location = path[path.length-1]
                if (location === desiredLocation){
                    visited = path
                    paths = [] 
                }
                else {
                    if(player.forward){
                        connected = this.locations[location].forward
                    }
                    else{
                        connected = this.locations[location].backward
                    }
                    if (connected.length === 2 && visitedLoc.indexOf(connected[1]) === -1){
                        let copy = path.concat()
                        copy.push(connected[1])
                        paths.push(copy)
                        visitedLoc.push(connected[1])
                    }
                    if (visitedLoc.indexOf(connected[0]) === -1){
                        path.push(connected[0])
                        visitedLoc.push(connected[0])
                    }
                }
            }
        }

        player.location = this.locations[desiredLocation].name
        player.track = this.locations[desiredLocation].track
        for(let place of visited){
            landed = place===desiredLocation
            if (this.collects.hasOwnProperty(place)){
                player.money += this.collects[player.location].getGain(odd, landed)
            }
            if (this.teleports.hasOwnProperty(place)){
                player.track = this.teleports[player.location].getTrack(landed)
                player.location = this.teleports[player.location].getLocation(landed)
                visited.push(player.location)
            }
        }

        return {
                'player': {
                            'name': player.name, 
                            'money': player.money
                            }, 
                'movedTo': visited, 
                'actions': this.locationAction(player.location)
                }
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

        while (!this.canBuy(player.location)){
            nextInfo = this.nextLocation(player.location, odd, player.forward, player.track)
            
            player.location = nextInfo["next"]
            player.track = nextInfo["track"]
            visited.push(player.location)

            if (this.collects.hasOwnProperty(player.location)){
                player.money += this.collects[player.location].getGain(player.lastOdd, false)
            }
        }

        return {
                'player': {
                            'name': player.name, 
                            'money': player.money
                            }, 
                'movedTo': visited,
                'actions': this.locationAction(player.location)
                }
    }

    /**
     * Specifies what kind of action should occur on the current location that was landed on.
     * @param location string location of where to find action of
     * @return String indicating what kind of action should occur
     */
    locationAction(location) {
        let actions = []
        let land = this.locations[location]

        if (land.isProperty){
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
            if (this.unownedProperties > 0){
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
        let delta = {}
        let properties = {}
        for (let property in houseMap){
            if (this.locations[property].owner === player.name){
                delta[property] = houseMap[property]-this.locations[property].houses
                this.locations[property].houses += delta[property]
                if (delta[property] > 0){
                    player.money -= delta[property]*this.locations[property].housePrice
                }
                else if (delta[property] < 0){
                    player.money -= delta[property]*(this.locations[property].housePrice/2)
                }
            }
            else {
                delta[property] = 0
            }
            properties[property] = this.locations[property].houses   
        }

        return {
                'player': {
                            'name': player.name,
                            'money': player.money
                            },
                'properties': properties,
                'delta': delta
                }
    }

    /**
     * Gives the player the property
     * @param player the player that is making the purchase
     * @param property String the property to buy
     * @param auctionPrice numerical value to pay in an auction, if null (default) there is no auction
     * 
     * @return JSON with fields player (name: name, money: money), location (name of location),
     *      price (price paid for the property). Empty JSON if failed
     */
    buyProperty(player, property, auctionPrice) {
        let land = this.locations[property]
        let lose = 0

        if (land.owner === null){
            this.unownedProperties -= 1
            land.owner = player.name
            player.properties.push(land)
            if (auctionPrice === undefined){
                lose = land.cost
            }
            else {
                lose = auctionPrice
            }
            player.money -= lose
            return {
                    'player': {
                                'name': player.name, 
                                'money': player.money
                                }, 
                    'location': property, 
                    'price': lose
                    }
        }
        else {
            return {}
        }
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
        let land = this.locations[property]
        if (land.houses === 0 && land.owner === player.name && !land.isMortgaged){
            land.mortgage()
            player.money += land.mortgageValue
            return {
                    'player': {
                                'name': player.name, 
                                'money': player.money
                                }, 
                    'location': property, 
                    'gain': land.mortgageValue
                    }
        }
        else {
            return {}
        }
    }

    /**
     * Causes the property to be unmortgaged so rent can be charged.
     *
     * @param the player that wants to unmortgage the property
     * @param property the property to unmortgage
     *
     * @return JSON with fields player (name: name, money: money), location (name of locations),
     *      lose (money lost through unmortgage). Empty if failed
     */
    unmortgageProperty(player, property) {
        let land = this.locations[property]
        if (land.houses === 0 && land.owner === player.name){
            land.unmortgage()
            player.money -= Math.round(land.mortgageValue*1.15)
            return {
                    'player': {
                                'name': player.name,
                                'money': player.money
                                },
                    'location': property,
                    'lose': Math.round(land.mortgageValue*1.15)
                    }
        }
        return {}
    }

    /**
     * Transfers the properties from player1 to player2 if possible. Tries to keep as many houses as possible.
     * @param player1 player losing the properties
     * @param player2 player gaining the properties
     * @param properties list of string names of properties to transfer
     *
     * @return JSON with fields player1 (money gained from lost houses), player2 (JSON of property: # of houses)
     */
    transferProperties(player1, player2, properties) {
        let money = 0
        let propertyHouses = {}
        let groupChanged = []

        for (let property of properties){
            let land = this.locations[property]
            if (land.owner === player1.name){
                land.owner = player2.name
                player2.properties.push(land)
                let i = player1.properties.indexOf(land)
                player1.properties.splice(i) 
                if (groupChanged.indexOf(land.group) === -1){
                    groupChanged.push(land.group)
                }
                propertyHouses[property] = land.houses
            }
        }

        for (let group of groupChanged){
            money += this.propertyGroups[group].rebalanceHouses()
        }
        return {
                'player1': money,
                'player2': propertyHouses
                }
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
        let numOwned = this.propertyGroups[land.group].getNumberOwned(player.name)
        let monopoly = this.propertyGroups[land.group].hasMonopoly()

        if (land.owner === player.name){
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
        return (land.isProperty && !this.isOwned(location))
    }

    /**
     * Gets a list of all of the locations in the forward direction
     * @param player the player that wants to move somewhere in the forward direction
     *
     * @return list of all locations in the forward direction
     */
    locationsInForwardDirection(player) {
        let nextInfo = {"next": player.location, "track": player.track}
        let forwards = []
        let land = this.locations[player.location]
        let verticals = [land.name]

        //finds locations in vertical direction
        while (land.above !== undefined){
            verticals.push(land.above[0])
            land = this.locations[land.above[0]]
        }
        land = this.locations[player.location]
        while (land.below !== undefined){
            verticals.push(land.below[0])
            land = this.locations[land.below[0]]
        }
        land = this.locations[player.location]

        for (let property of verticals){
            let next = this.locations[property]
            let location = property
            let track = next.track[0]
            while (next.side[0] === land.side[0]){
                nextInfo = this.nextLocation(location, true, player.forward, track)
                location = nextInfo["next"]
                track = nextInfo["track"]
                next = this.locations[location]
                if (forwards.indexOf(location) === -1){
                    if (player.forward){
                        if (next.side[0] === land.side[0]){
                            forwards.push(location)
                        }
                    }
                    else if (!player.forward) {
                        if (next.side[1] === land.side[0]){
                            forwards.push(location)
                        }
                    }
                }
            }
        }

        return forwards
    }

    /**
     * Gets the next railroad in the forward direction
     * @param player the player that wants to take the next transit
     *
     * @return name of next railroad in the forward direction
     */
    nextTransit(player) {
        let nextInfo = {"next": player.location, "track": player.track}

        while (this.locations[player.location].kind !== "railroad"){
            nextInfo = this.nextLocation(player.location, true, player.forward, player.track)
            player.location = nextInfo["next"]
            player.track = nextInfo["track"]
        }
        return player.location
    }

    /**
    * Gets a list of all of the transit locations.
    *
    * @return list of all bus/train locations
    */
    getTransitLocations() {
        let places = []
        for (let property of this.locations){
            if (property.kind === "railroad" || property.kind === "bus"){
                places.push(property)
            }
        }
        return places
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