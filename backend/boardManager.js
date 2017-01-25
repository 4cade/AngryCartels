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
 * @param state JSON that represents a board
 */
class BoardManager {
    constructor(state, newGame=true) {
        this.houses = 81;  // TODO check if this is maintained
        this.hotels = 31;  // TODO check if this is maintained
        this.skyscrapers = 16;  // TODO check if this is maintained
        this.pool = 0;
        this.unownedProperties = 0;

        this.locations = {}; //key location name to location object
        this.propertyGroups = {}; // key group name to property/railroad/cab/utility object
        this.collects = {}; // key location name to collect object
        this.teleports = {}; // key location name to teleport object

        for(let name in state.locations) {
            const loc = state.locations[name]; // preloaded data from the board
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

        if(!newGame) {
            this.houses = state.houses;
            this.hotels = state.hotels;
            this.skyscrapers = state.skyscrapers;
            this.pool = state.pool;
            this.unownedProperties = state.unownedProperties;

            // sets the rest correct based on "snapshot" field in Place
        }
        
    }

    /**
     * Turns the BoardManager into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        // for now ignore property groups since they just store priority and
        // that might not be an essential feature
        let locations = {};

        for(let name in this.locations) {
            locations[name] = this.locations[name].toJSON();
        }

        return {
            "houses": this.houses,
            "hotels": this.hotels,
            "skyscrapers": this.skyscrapers,
            "pool": this.pool,
            "unownedProperties": this.unownedProperties,
            "locations": locations
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
        let odd = diceTotal%2===1
        let land = false
        let visited = []
        let location = player.location
        let track = player.track
        let money = 0
        let nextInfo = {"next": location, "track": track}

        while (diceTotal > 0){
            nextInfo = this.nextLocation(location, odd, player.forward, track)

            track = nextInfo["track"]
            location = nextInfo["next"]
            visited.push(location)

            diceTotal -= 1

            land = diceTotal===0
            if (this.collects.hasOwnProperty(location)){
                money += this.collects[location].getGain(odd, land)
            }
        }
        if (this.teleports.hasOwnProperty(location)){
            track = this.teleports[location].getTrack(land)
            location = this.teleports[location].getLocation(land)
            visited.push(location)
        }
        player.moveToLocation(location, track, money)

        return {
                'player': {
                            'name': player.name, 
                            'money': player.getMoney()
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
        let odd = player.lastRolled%2===1
        let visited = [location]
        let track = this.locations[location].track
        let money = 0

        if (this.collects.hasOwnProperty(location)){
            money += this.collects[location].getGain(odd, true)
        }
        else if (this.teleports.hasOwnProperty(location)){
            track = this.teleports[location].getTrack(true)
            location = this.teleports[location].getLocation(true)
            visited.push(player.location)
        }
        player.moveToLocation(location, track, money)

        return {
                'player': {
                            'name': player.name, 
                            'money': player.getMoney()
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
        let odd = player.lastRolled%2===1
        let visited = []
        let landed = false

        // finds the path with shortest distance
        let visitedLoc = []
        let paths = [this.locations[player.location].forward]
        let connected = null

        while (paths.length > 0){
            for (let path of paths){
                let place = path[path.length-1]
                if (place === desiredLocation){
                    visited = path
                    paths = [] 
                }
                else {
                    if(player.forward){
                        connected = this.locations[place].forward
                    }
                    else{
                        connected = this.locations[place].backward
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

        //moves player to desiredLocation
        let location = desiredLocation
        let track = this.locations[desiredLocation].track
        let money = 0

        for(let place of visited){
            landed = place===desiredLocation
            if (this.collects.hasOwnProperty(place)){
                money += this.collects[place].getGain(odd, landed)
            }
            if (this.teleports.hasOwnProperty(place)){
                track = this.teleports[place].getTrack(landed)
                location = this.teleports[place].getLocation(landed)
            }
        }
        player.moveToLocation(location, track, money)

        return {
                'player': {
                            'name': player.name, 
                            'money': player.getMoney()
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
     *       or--- return make it move to nextRent space if there are no unowned properties
     */
    nextMrMonopolyLocation(player) {
        let odd = player.lastRolled%2===1
        let visited = []
        let location = player.location
        let track = player.track
        let money = 0
        let nextInfo = {"next": location, "track": track}

        if (this.unownedProperties === 0){
            return this.nextRentLocation(player)
        }

        while (!this.canBuy(location)){
            nextInfo = this.nextLocation(location, odd, player.forward, track)
            
            location = nextInfo["next"]
            track = nextInfo["track"]
            visited.push(location)

            if (this.collects.hasOwnProperty(location)){
                money += this.collects[location].getGain(odd, false)
            }
        }
        player.moveToLocation(location, track, money)

        return {
                'player': {
                            'name': player.name, 
                            'money': player.getMoney()
                            }, 
                'movedTo': visited,
                'actions': this.locationAction(player.location)
                }
    }

    nextRentLocation(player){
        let odd = player.lastRolled%2===1
        let visited = []
        let location = player.location
        let track = player.track
        let money = 0
        let nextInfo = {"next": location, "track": track}

        while (!this.canRent(location)){
            nextInfo = this.nextLocation(location, odd, player.forward, track)
            
            location = nextInfo["next"]
            track = nextInfo["track"]
            loc = this.locations[location]
            visited.push(location)

            if (this.collects.hasOwnProperty(location)){
                money += this.collects[location].getGain(odd, false)
            }
        }
        player.moveToLocation(location, track, money)

        return {
                'player': {
                            'name': player.name, 
                            'money': player.getMoney()
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
                actions.push("rent")        // pay rent
            else
                actions.push("buy")         // buy property
        }
        if (land.kind === 'railroad'){
            actions.push("bus")             // draw bus pass
        }
        if (land.kind === 'chance'){
            actions.push("chance")          // draw chance card
        }
        if (land.kind === 'community chest'){
            actions.push("community chest") // draw community chest
        }
        if (land.kind === 'subway'){
            actions.push("subway")          // take subway
        }
        if (land.kind === 'bus'){ 
            actions.push("bus")             // draw bus pass
        }
        if (land.kind === 'cab'){
            actions.push("cab")             // choose to take taxi
        }
        if (land.kind === 'stock'){
            actions.push("stock")
        }
        if (land.kind === 'auction'){
            if (this.unownedProperties > 0){
                actions.push("choose auction") // choose to auction
            }
            else{
                actions.push("highest rent")    // travel to highest rent
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
    *       delta (map names to change in houses) or {fail: true} if failed
    **/
    setHousesForProperties(player, houseMap) {
        let groups = {};
        let delta = {};
        let changeHouse = 0;
        let changeHotel = 0;
        let changeSky = 0;

        for(let propertyName in houseMap) {
            let property = this.locations[propertyName];
            if(property.owner === player.team.name) {
                if(groups.hasOwnProperty(property.group)) {
                    groups[property.group][propertyName] = houseMap[propertyName];
                }
                else {
                    groups[property.group] = {}
                    groups[property.group][propertyName] = houseMap[propertyName]
                }

                // verify houses
                if(houseMap[propertyName] <= 4) {
                    if(property.houses === 6) {
                        changeSky += 1;
                        changeHouse -= houseMap[propertyName];
                    }
                    else if(property.houses === 5) {
                        changeHotel += 1;
                        changeHouse -= houseMap[propertyName];
                    }
                    else {
                        changeHouse += property.houses - houseMap[propertyName];
                    }
                }
                else if(houseMap[propertyName] === 5) {
                    if(property.houses === 6) {
                        changeSky += 1;
                        changeHotel -= 1;
                    }
                    else if(property.houses < 5) {
                        changeHotel -= 1;
                        changeHouse += property.houses;
                    }
                }
                else {
                    if(property.houses === 5) {
                        changeSky -= 1;
                        changeHotel += 1;
                    }
                    else if(property.houses < 5) {
                        changeSky -= 1;
                        changeHouse += property.houses;
                    }
                }
            }
            else {
                delta[propertyName] = 0;
            }
        }

        // return if impossible
        if(this.houses + changeHouse < 0 || this.hotels + changeHotel < 0 || this.skyscrapers + changeSky < 0) {
            return {"fail": true};
        }
        else {
            this.houses += changeHouse;
            this.hotels += changeHotel;
            this.skyscrapers += changeSky;
        }

        // actually commit changes
        for(let groupName in groups) {
            let houseMap = groups[groupName];
            Object.assign(delta, this.propertyGroups[groupName].setHouses(player, houseMap));
        }

        let properties = {};
        for(let property in delta) {
            let p = this.locations[property]
            properties[property] = p.houses;
            if (delta[property] > 0){
                player.deltaMoney(-delta[property]*p.housePrice)
            }
            else if (delta[property] < 0){
                player.deltaMoney(-delta[property]*p.housePrice/2)
            }
        }

        return {
                'player': {
                            'name': player.name,
                            'money': player.getMoney()
                            },
                'properties': properties,
                'delta': delta
                }
    }

    /**
     * Checks if the number of houses is maintained.
     * @return boolean true if houses are maintained
     */
    checkBuildings(){
        let numHouses = 0;
        let numHotels = 0;
        let numSkyscrapers = 0;

        //counts number of houses, hotels, skyscrapers on the board
        for (let location in this.locations){
            let loc = this.locations[location];
            if (loc.houses < 5) {
                numHouses += loc.houses;
            }
            else if (loc.houses === 5) {
                numHotels += 1;
            }
            else if (loc.houses === 6) {
                numSkyscrapers += 1;
            }
        }

        if (numHouses > this.houses || numHotels > this.hotels || numSkyscrapers > this.skyscrapers){
            return false
        }
        return true;
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
            land.setOwner(player.name)
            player.gainProperty(land)
            if (auctionPrice === undefined){
                lose = land.cost
            }
            else {
                lose = auctionPrice
            }
            player.deltaMoney(-lose)
            return {
                    'player': {
                                'name': player.name, 
                                'money': player.getMoney()
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
        if (land.houses === 0 && land.owner === player.team.name && !land.isMortgaged){
            land.mortgage()
            player.deltaMoney(land.mortgageValue)
            return {
                    'player': {
                                'name': player.name, 
                                'money': player.getMoney()
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
        if (land.houses === 0 && land.owner === player.team.name && land.isMortgaged){
            land.unmortgage()
            player.deltaMoney(-Math.round(land.mortgageValue*1.15))
            return {
                    'player': {
                                'name': player.name,
                                'money': player.getMoney()
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
        let movedProperties = []
        let groupChanged = new Set();

        for (let property of properties){
            let land = this.locations[property]
            if (land.owner === player1.name){
                land.setOwner(player2.name)
                player2.gainProperty(land);
                player1.loseProperty(land);
                movedProperties.push(property);
                groupChanged.add(land.group);
            }
        }

        // rebalance for houses + check money gained for destroying houses
        for (let group of groupChanged){
            let pgroup = this.propertyGroups[group];
            let house, hotel, sky = (0, 0, 0);

            // count previous houses
            for(let p of pgroup.properties) {
                if(p.houses <= 4) {
                    house += p.houses
                }
                else if(p.houses === 5) {
                    house += 4;
                    hotel += 1;
                }
                else {
                    house += 4;
                    hotel += 1;
                    sky += 1;
                }
            }

            // TODO break down houses all the way if can't maintain because of limits
            let houseLost = pgroup.rebalanceHouses();
            let pricePerHouse = pgroup.properties[0].housePrice;

            // count previous houses
            for(let p of pgroup.properties) {
                if(p.houses <= 4) {
                    house -= p.houses
                }
                else if(p.houses === 5) {
                    house -= 4;
                    hotel -= 1;
                }
                else {
                    house -= 4;
                    hotel -= 1;
                    sky -= 1;
                }
            }

            // downgrade skyscrapers if can't keep
            if(this.skyscrapers + sky < 0) {
                for(let p of pgroup.properties) {
                    p.houses -= 1;
                    houseLost += 1;
                }
            }
            // TODOO

            // downgrade hotels if can't keep
            if(this.hotels + hotel < 0) {
                for(let p of pgroup.properties) {
                    p.houses -= 1;
                    houseLost += 1;
                }
            }

            // downgrade houses if can't keep
            if(this.houses + house < 0) {
                for(let p of pgroup.properties) {
                    houseLost += p.houses;
                    this.houses += p.houses;
                    p.houses = 0;
                }
            }

            // check if houses disrupt balance

            money += houseLost*pricePerHouse;
        }

        // check new number of houses on properties
        for (let property of movedProperties){
            let land = this.locations[property]
            if (land.owner === player2.name){
                propertyHouses[property] = land.houses
            }
        }

        return {
                'player1': money,
                'player2': propertyHouses
                }
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
        let owner = this.isOwned(location);
        let numOwned = this.propertyGroups[land.group].getNumberOwned(owner)
        let monopoly = this.propertyGroups[land.group].hasMonopoly()

        if (land.owner && land.owner !== player.team.name){
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
        else if(land.owner) {
            return 0;
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
     * States whether or not the location is rentable
     * @param the name of the location
     * 
     * @return true if the location is rentable
    */

    canRent(location) {
        let land = this.locations[location]
        return (land.isProperty && this.isOwned(location))
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

        //finds forward locations of the vertical locations
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
        let location = player.location
        let track = player.track
        let nextInfo = {"next": location, "track": track}

        while (this.locations[location].kind !== "railroad"){
            nextInfo = this.nextLocation(location, true, player.forward, track)
            location = nextInfo["next"]
            track = nextInfo["track"]
        }
        return location
    }

    /**
     * Gets a list of locations.
     *
     * @return string list of all locations
     */
    getLocationNames() {
        return Object.keys(this.locations);
    }

    /**
     * Gets a list of unowned locations.
     *
     * @return string list of all unowned properties
     */
    getUnownedLocations() {
        let names = [];

        for(let name in this.locations) {
            let p = this.locations[name];

            if(p.isProperty && !p.owner) {
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Gets a list of all places that you can get by taxi.
     *
     * @return string list of all taxi/train locations
     */
    getTaxiLocations() {
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
        player.deltaMoney(-money)
        this.pool += money
        return {
                'player': player.getMoney(),
                'pool': this.pool
                }

    }
 
    /**
     * Pays the pool from the player.
     * @param player the player object that is paying the pool
     * @param mult multiplier (0 <= amt <= 1) for amount collected from pool
     *
     * @return JSON with fields player (money player has left) and pool (money in pool)
     */
    collectFromPool(player, mult=0.5) {
        player.deltaMoney(mult * this.pool)
        this.pool -= mult*this.pool
        return {
                'player': player.getMoney(),
                'pool': this.pool
                }
    }

    /**
     * Gets the location with the highest rent. (ignore utility/other ones based on multipliers)
     *
     * @return string name of location with highest rent or null if all unowned
     */
    getHighestRent() {
        let topName = null;
        let topRent = 0;

        for(let locName in this.locations) {
            let loc = this.locations[locName];
            if(loc.kind === 'property') {
                let monopoly = this.propertyGroups[loc.group].hasMonopoly();
                if(loc.getRent(monopoly) > topRent) {
                    topName = locName;
                    topRent = loc.getRent(monopoly);
                }
            }
        }

        return topName;
    }
 }



module.exports = BoardManager;