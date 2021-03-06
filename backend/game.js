var board = require('./config/large_board');
var Card = require('./card');
var BoardManager = require('./boardManager');
var PlayerManager = require('./playerManager');

/**
 * The Game object is the main entry point into the game. It manages everything
 * @param gamePresets preset data to initialze the game, has just players if a new game.
 *      Otherwise, it has data for an entire game to resume it.
 * @param newGame specifies whether this is a new game
 */
class Game {
    constructor(gamePresets, newGame=true) {
        if(newGame) {
            // first initialize players
            // TODO decide how to set other board presets, maybe just put in board
            this.playerManager = new PlayerManager(gamePresets['players'], 'go', 1);
            this.boardManager = new BoardManager(board);

            // auction variables
            this.auction = null; // object of player names : auction price
            this.auctionGoing = false;
            this.auctionedProperty = null;

            this.lastOdd = false; // used for some methods
            this.log = []; // log of actions that have occurred in the game

            // scrambles player order for more fun
            this.playerManager.scrambleTurnOrder();
            this.playerManager.start();

            // console.log(this.playerManager.toJSON());
            // TODO hold timestamp so that checks can be made for auctions and stuff if taking too long
        }
        else {
            // reload from saved state
            this.boardManager = new BoardManager(gamePresets['boardManager'], false);
            this.playerManager = new PlayerManager(null, null, null, gamePresets['playerManager'], this.boardManager.locations);
            
            this.auction = gamePresets['auction'];
            this.auctionGoing = gamePresets['auctionGoing'];
            this.auctionedProperty = gamePresets['auctionedProperty'];
            this.lastOdd = gamePresets['lastOdd'];
            this.log = gamePresets['log'];
        }
    }

    /**
     * Turns the Game into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        return {
            "playerManager": this.playerManager.toJSON(),
            "boardManager": this.boardManager.toJSON(),
            "auction": this.auction,
            "auctionGoing": this.auctionGoing,
            "auctionedProperty": this.auctionedProperty,
            "lastOdd": this.lastOdd,
            "log": this.log
        }
    }

    /****************************************************************************************
     * GAMEPLAY METHODS
     ****************************************************************************************/

    /**
     * Makes it so it is the next player's turn.
     * @return JSON with field message (string saying what happened), player (name of current player),
     *       and actions (list of actions that the player can do)
     */
    nextTurn() {
        this.playerManager.nextTurn();
        const message = "It is now " + this.playerManager.getCurrentPlayer().name + "'s turn!";

        let player = this.playerManager.getCurrentPlayer();
        player.startTurn();

        return {'message': message, "player": this.playerManager.getCurrentPlayer().name, "actions": player.getActions()}
    }

    /**
     * Rolls the 3 dice for the player and moves him/her to the next location.
     * @return JSON with fields rolled (list of what was rolled), action (list
     *       of actions that the player should perform), movedTo (list of locations
     *       visited), player (JSON with name: name, money: money), and
     *       message (string saying what happened)
     */
    rollDice() {
        // need to simulate 3 dice just like the real game
        let player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('roll');
        if(!go) {
            return {"fail": true};
        }
        this.playerManager.canRoll = false;

        let [die1, die2, die3] = [Card.rollDie(), Card.rollDie(), Card.rollDie()];
        let totalRoll = 0;
        let actions = [];
        let message = "";
        let json = {};

        if(die3 === 4 || die3 === 5) {
            die3 = 'mrmonopoly';
            totalRoll = die1 + die2;
        }
        else if(die3 === 6) {
            die3 = 'draw bus pass'
            totalRoll = die1 + die2;
        }
        else {
            totalRoll = die1 + die2 + die3
        }

        player.setLastRoll(totalRoll);

        // get stuff about the turn
        if(die1 === die2 === die3) {
            message = player.name + " rolled a triple " + die1;
            // do the teleport action
            actions.push('teleport');
        }
        else {
            let doubles = false;
            let goToJail = false;

            if(die1 == die2) {
                doubles = true;
                goToJail = this.playerManager.increaseDoubleCount();
            }

            if(goToJail) {
                json = Object.assign(json, this.boardManager.jumpToLocation(player, 'go to jail'));
                // no actions if player is in jail
                message = player.name + " rolled a third double and was sent to jail";
            }
            else {
                json = Object.assign(json, this.boardManager.moveLocation(player, totalRoll));
                message = player.name + " rolled a total of " + totalRoll + " to get to " + json.movedTo.slice(-1)[0];

                if(doubles) {
                    message += " and also had a double " + die1;
                    this.boardManager.canRoll = true;
                    json['actions'].push('roll');
                }
            }
            
        }

        // push other actions after based on priority
        if(isNaN(die3)) {
            json['actions'].push(die3);
        }

        json['rolled'] = [die1, die2, die3];
        json['message'] = message;

        player.addActions(json['actions']);
        json['actions'] = player.getActions();

        return json;
    }

    /**
     * Handles a turn with the player in jail.
     * @param pay true if the player paid to get out
     *
     * @return actions (list of actions that the player should perform), 
     *       player (JSON with name: name, money: money), and
     *       message (string saying what happened)
     */
    handleJail(pay) {
        let player = this.playerManager.getCurrentPlayer();
        let message = "";
        let actions = [];
        const go = player.useAction('jail');
        if(!go) {
            return {"fail": true};
        }

        if(pay) {
            player.leaveJail(true);
            message = player.name + " paid 50 to leave jail.";
        }
        else {
            let die1, die2 = (Card.rollDie(), Card.rollDie());

            if(die1 === die2) {
                player.leaveJail();
                message = player.name + " rolled double " + die1 + "s to leave jail!";
            }
            else {
                player.jailTurn();
                message = player.name + " waited in jail and has " + player.jailTurnsLeft + "turns left";
            }
        }

        if(!player.inJail()) {
            actions.push('roll');
        }

        player.addActions(actions);
        actions = player.getActions();

        return {"player": {"name": player.name, "money": player.getMoney()},
            "message": message, "actions": actions};
    }

    /**
     * Performs the Mr. Monopoly search for the next unowned property and moves the player.
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), player (JSON with name: name, money: money),
     *       and message (string saying what happened)
     */
    unleashMrMonopoly() {
        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('mrmonopoly');
        if(!go) {
            return {"fail": true};
        }
        let json = this.boardManager.nextMrMonopolyLocation(player, this.lastOdd);
        json['message'] = player.name + " used Mr. Monopoly to get to " + player.location;
        player.addActions(json['actions']);
        json['actions'] = player.getActions();
        return json;
    }

    /**
     * Moves the player to the location.
     * @param location name of location to jump to
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), player (JSON with name: name, money: money),
     *       and message (string saying what happened)
     */
    teleport(location){
        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('teleport');
        if(!go) {
            return {"fail": true};
        }
        let json = this.boardManager.jumpToLocation(player, location);
        json['message'] = player.name + " jumped to " + player.location;
        player.addActions(json['actions']);
        json['actions'] = player.getActions();
        return json;
    }

    /**
     * Uses the specified bus pass.
     * @param pass the name of the bus pass
     * @param location if the pass says "any" then this is the location to advance to
     *
     * @return JSON with fields movedTo (list of locations visited), actions (list
     *       of actions that the player should perform), player (JSON with name: name, money: money),
     *       and message (string saying what happened) or {"fail": true}
     */
    useBusPass(pass, location) {
        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('bus');
        if(!go) {
            return {"fail": true};
        }

        //player does not have the pass
        if (!player.busTickets.has(pass))
            return {"fail": true}

        let json = {};
        let oldDirection = player.forward; // store to reset later

        if(pass.includes('backward')) {
            player.forward = !player.forward;
        }

        if(pass.includes('any') && option) {
            json['actions'] = this.boardManager.advanceToLocation(player, location)['actions'];
        }
        else if(!pass.includes('any')) {
            const num = parseInt(pass.replace('forward', '').replace('backward', '').replace('expire', ''));
            json = Object.assign(json, this.boardManager.moveLocation(player, num));
        }

        // reset player to how they were before
        player.forward = oldDirection;

        json['message'] = player.name + " used " + pass + " to move to " + player.location;
        player.addActions(json['actions']);
        json['actions'] = player.getActions();

        return json;
    }

    /**
     * Takes a taxi ride to the specified location.
     * @param location to get transported to
     *
     * @return JSON with fields player1/player2? (JSON with name: name, money: money),
     *       pool (money in pool), message (string saying what happened), and location
     *       or {"fail": true} if not owned
     */
    taxiRide(location) {
        //location is not on board
        if (!this.boardManager.locations.hasOwnProperty(location))
            return -1

        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('taxi');
        if(!go) {
            return {"fail": true};
        }
        const owner = this.playerManger.getTeamMember(this.boardManager.isOwned());
        let json = {"location": location};

        // pay pool or owner
        if(owner === player.team.name) {
            let tempjson = this.boardManager.payPool(player, 20);
            json['player1'] = {"name": player.name, 'money': player.money}
            json['pool'] = tempjson['pool'];
        }
        else if(owner){
            player.deltaMoney(-50);
            owner.deltaMoney(50);
            json['player1'] = {"name": player.name, 'money': player.money}
            json['player2'] = {"name": owner.name, 'money': owner.money}
        }
        else {
            return {"fail": true};
        }

        let actions = this.boardManager.jumpToLocation(player, location)['actions'];
        // only handle a subset of actions
        if(actions.includes('buy'))
            json["actions"] = ['buy'];
        else
            json["actions"] = [];

        player.addActions(json['actions']);
        json['actions'] = player.getActions();

        json["message"] = player.name + " took a taxi to " + player.location;
        return json;
    }

    /**
     * The current player buys the property that they are located on for market price.
     *
     * @return JSON with fields player (name: name, money: money), location (name of location),
     *      price (price paid for the property), message (saying what happened).
     */
    buyProperty() {
        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('buy');
        if(!go) {
            return {"fail": true};
        }
        let json = this.boardManager.buyProperty(player, player.location);
        json['message'] = player.name + " bought " + json.location + " for " + json.price;
        this.log.push(json['message']);
        json['actions'] = player.getActions();
        return json;
    }

    /**
     * Buys the property for an auction price.
     * @param info JSON with fields player (name of player), location (name of location),
     *      price (price for the property)
     *
     * @return JSON with fields player (name: name, money: money), location (name of location),
     *      price (price paid for the property), message (saying what happened).
     */
    buyPropertyAuction(info) {
        const player = this.playerManager.getPlayer(info.player);
        let json = this.boardManager.buyProperty(player, info.location, info.price);
        json['message'] = player.name + " bought " + json.location + " for " + json.price;
        this.log.push(json['message']);
        json['actions'] = player.getActions();
        return json;
    }

    /**
     * The current player mortgages the properties in the list.
     * @param properties list of strings of property names to mortgage
     *
     * @return JSON with fields player (name: name, money: money), locations (list of successfully
     *      mortgaged locations), gain (money gained from mortgaging), message (saying
     *      what happened).
     */
    mortgage(properties) {
        const player = this.playerManager.getCurrentPlayer();
        let success = [];
        let gain = 0;

        for(let property of properties) {
            let json = this.boardManager.mortgageProperty(player, property);

            if(json.hasOwnProperty('location')) {
                success.push(property);
                gain += json.gain;
            }
        }
        
        const message = player.name + " mortgaged " + success + " and gained a total of " + gain; 

        return {"player": {"name": player.getName(), "money": player.getMoney()}, 
                "locations": success,
                "gain": gain,
                "message": message}
    }

    /**
     * The current player unmortgages the properties in the list.
     * @param properties list of strings of property names to unmortgage
     *
     * @return JSON with fields player (name: name, money: money), locations (list of successfully
     *      unmortgaged locations), lose (money lost from unmortgaging), message (saying
     *      what happened).
     */
    unmortgage(properties) {
        const player = this.playerManager.getCurrentPlayer();
        let success = [];
        let lose = 0;

        for(let property of properties) {
            let json = this.boardManager.unmortgageProperty(player, property);

            if(json.hasOwnProperty('location')) {
                success.push(property);
                lose += json.lose;
            }
        }
        const message = player.name + " unmortgaged " + success + " for a total of " + lose;
        return {"player": {"name": player.getName(), "money": player.getMoney()}, 
                "locations": success,
                "lose": lose,
                "message": message}
    }

    /**
     * Sets the houses for all of the properties in the houseMap.
     * @param houseMap JSON key property to preferred number of houses
     *
     * @return JSON with fields properties (map names to houses on them), player (name: name, money: money),
     *       delta (map names to change in houses) or fail: true if failed
     *
     */
    setHouses(houseMap) {
        const player = this.playerManager.getCurrentPlayer();
        let json = this.boardManager.setHousesForProperties(houseMap);

        if(json["delta"]) {
            json['message'] = player.name + " changed houses on " + Object.keys(json['delta']).length + " houses"
        }

        json['actions'] = player.getActions();

        return json;
    }

    // TODO upgrade railroads/cabs

    /**
     * The current player pays rent for the property that they are located on.
     * @return JSON with field message (string saying what happened) and
     *       player/owner (name: name, money: money)
     */
    payRent() {
        const player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('rent');
        if(!go) {
            return {"fail": true};
        }
        const rent = this.boardManager.getRent(player, player.location);
        const owner = this.playerManager.getTeamMember(this.boardManager.isOwned(player.location));
        let json = {};

        if(!rent) {
            return {"message": player.location + " is unowned."};
        }
        
        player.deltaMoney(-rent);
        json['player'] = {'name': player.team, 'money': player.getMoney()};
        owner.deltaMoney(rent);
        json['owner'] = {'name': owner.name, 'money': owner.getMoney()};
        json['actions'] = player.getActions();

        let message = player.name + " paid " + rent + " rent to " + owner.team;
        return {"message": message};
    }

    /**
     * The current player draws a fortune card.
     * @return JSON with field message (string saying what happened),
     *       player (name: name), and card (title, description, short, play)
     */
    drawFortune() {
        let player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('draw fortune');
        if(!go) {
            return {"fail": true};
        }
        let card = Card.drawFortune();
        player.gainSpecialCard(card);
        const message = player.name + " drew a fortune card";
        return {"card": card, "player": {"name": player.name}, "message": message, "actions": player.getActions()};
    }

    /**
     * The current player draws a misfortune card.
     * @return JSON with field message (string saying what happened),
     *       player (name: name), and card (title, description, short, play)
     */
    drawMisfortune() {
        let player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('draw misfortune');
        if(!go) {
            return {"fail": true};
        }
        let card = Card.drawMisfortune();
        player.gainSpecialCard(card);
        const message = player.name + " drew a misfortune card";
        return {"card": card, "player": {"name": player.name}, "message": message, "actions": player.getActions()};
    }

    /**
     * The current player uses a special card.
     * @return JSON with field message (string saying what happened),
     *       player (name: name), and card (title, description, short, play)
     */
    useSpecialCard(card) {
        let player = this.playerManager.getCurrentPlayer();
        let message = "";
        //player does not have card
        if (!player.specialCard.hasOwnProperty(card)){
            return -1 // TODO will actually return a JSON
        }

        player.useSpecialCard(card)
        let desc = card.short;
        if (desc.includes("pay")){

        }
        else if (desc.includes("collect")){

        }
        else if (desc.includes("trip")){

        }
        else if (desc.includes("move")){

        }
        else if (desc.includes("gain")){
            let words = desc.split(' ');
            const amt = parseInt(words[1])
            player.deltaMoney(amt);
            message = player.name + " gained $" + amt;
        }
        else if (desc.includes("lose")){
            let words = desc.split(' ');
            const amt = parseInt(words[1])
            player.deltaMoney(-amt);
            message = player.name + " lost $" + amt;
        }

        return {"card": card, "player": {"name": player.name}, "message": message}
    }

    /**
     * The current player draws a bus pass.
     * @return JSON with field message (string saying what happened),
     *       player (name: name), and card (string name of pass)
     */
    drawBusPass() {
        let player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('draw bus pass');
        if(!go) {
            return {"fail": true};
        }
        let card = Card.drawBusPass();
        player.gainBusPass(card);
        const message = player.name + " drew a " + card + " bus pass";
        return {"card": card, "player": {"name": player.name}, "message": message, "actions": player.getActions()};
    }

    /**
     * The current player goes through a roll3 ritual.
     * @return JSON with fields message (string saying what happened),
     *       player (name: name, money: amt), card (list of numbers to match),
     *       and rolled (list of numbers that were rolled)
     */
    roll3(){
        let player = this.boardManager.getCurrentPlayer();
        const go = player.useAction('roll3');
        if(!go) {
            return {"fail": true};
        }
        const card = Card.drawRoll3()
        let nums = new Set(card);
        let rolled = []
        
        for(let i=0; i<3; i++) {
            let die = Card.rollDie();
            rolled.push(die);
            nums.remove(die);
        }
        rolled.sort();

        let matches = 3 - Array.from(nums).length;
        let gain = 0;
        const gainAmounts = {1: 50, 2: 200, 3: 1000}

        if(gainAmounts.hasOwnProperty(matches)) {
            gain = gainAmounts[matches];
        }

        player.deltaMoney(gain);

        let message = player.name + " matched " + matches + " and won " + gain;
        return {'card': card, 'message': message, "rolled": rolled, "player": {"name": player.name, "money": player.getMoney()}, "actions": player.getActions()};
    }

    /**
     * The current player has fun messing with everyone else using a squeeze play.
     * @return JSON with field message (string saying what happened),
     *       players (list of {name: name, money: amt}),
     *       and rolled (list of numbers that were rolled)
     */
    squeezePlay(){
        let player = this.playerManager.getCurrentPlayer();
        let [die1, die2] = [Card.rollDie(), Card.rollDie()]; // just need for JSON
        const go = player.useAction('squeeze');
        if(!go) {
            return {"fail": true};
        }
        let total = die1 + die2;
        let collect = 50;
        let json = {"rolled": [die1, die2]};

        if([5, 6, 7, 8, 9].includes(total)) {
            collect = 100;
        }
        else if([2, 12].includes(total)) {
            collect = 200;
        }

        let players = this.boardManager.getPlayers();

        // grab from each player
        for(let p of players) {
            p.deltaMoney(-collect);
            player.deltaMoney(collect);
        }

        // now construct JSON since money amounts are constant
        json['players'] = [];
        for(let p of players) {
            json['players'].push({'name': p.name, 'money': p.getMoney()});
        }

        json['message'] = player.name + " rolled a total of " + total + " and took " + gain + "from each player";

        json['actions'] = player.getActions();

        return json
    }

    // TODO stocks?


    /**
     * Executes a trade with the player specified in info under info's conditions.
     * @param info JSON object with 6 fields: player1 (name of first player in trade),
     *     player2 (name of second player in trade), properties1  (list of properties
     *     that the first player is trading), properties2 (list of properties that the
     *     the second player is trading), wealth1 (money that first player is trading),
     *     and wealth2 (money that the second player is trading)
     * @return JSON with fields player1/player2 (subfields name, money, and properties
     *      (list of string names of properties that the player now has)) and message
     */
    trade(info) {
        const player1 = this.playerManager.getPlayer(info.player1);
        const player2 = this.playerManager.getPlayer(info.player2);
        
        this.boardManager.transferProperties(player1, player2, info.properties1);
        this.boardManager.transferProperties(player2, player1, info.properties2);
        // TODO break down houses all the way if can't maintain because of limits

        player1.deltaMoney(info.wealth2-info.wealth1);
        player2.deltaMoney(info.wealth1-info.wealth2);

        const message = player1.name + " traded with " + player2.name; // TODO maybe improve?

        return {"player1": {"name": player1.name, "money": player1.getMoney(),
                            "properties": info.properties2},
                "player2": {"name": player2.name, "money": player2.getMoney(),
                            "properties": info.properties1},
                "message": message};
    }

    /****************************************************************************************
     * AUCTION METHODS
     ****************************************************************************************/

    /**
     * Starts an auction for a property. At most one auction can happen at any time.
     */
    startAuction(property) {
        // starts the auction and inits stuff
        let player = this.playerManager.getCurrentPlayer();
        const go = player.useAction('up auction');
        if(!go) {
            return {"fail": true};
        }
        this.auction = {};
        this.auctionGoing = true;
        this.auctionedProperty = property;
        const players = this.playerManager.getPlayers();

        players.forEach(p => {
            this.auction[p.name] = null;
        });
    }

    /**
     * Sets the price the player is willing to bid. Assumes no JS concurrency issues.
     * @param player the name of a player
     * @param price the price the player is willing to bid
     */
    addBid(player, price) {
        let playerObj = this.playerManager.getPlayer(player);
        const go = playerObj.useAction('set auction price');
        if(!go) {
            return {"fail": true};
        }
        if(this.auctionGoing) {
            this.auction[player] = price;
        }
    }

    /**
     * Decides the winning player of the auction.
     * 
     * @return JSON with fields player (name of player), location (name of location),
     *      price (price for the property), message (saying what happened). null if failed
     */
    finishAuction() {
        if(this.auctionGoing) {
            // check that all fields are not null
            this.over = true;

            for(p in this.auction) {
                if(!this.auction[p]) {
                    this.over = false;
                }
            }

            if(this.over) {
                let top = -1
                let names = [];

                let second = -1;

                for(p in this.auction) {
                    if(this.auction[p] > top) {
                        second = top;
                        top = this.auction[p];
                        names = [p];
                    }
                    else if (this.auction[p] === top) {
                        names.push(p);
                    }
                }

                let player;
                let price;
                // goes 20 over the next highest bidder
                if(names.length === 1) {
                    player = this.playerManager.getPlayer(names[0]);
                    price = Math.min(top, second + 20);
                }
                // if multiple people chose the same amount, then randomly choose one to win
                else {
                    player = this.playerManager.getPlayer(Card.chooseRandom(names));
                    price = top;
                }

                player.addAction('buy');

                let json = {"player": player.name, "location": this.auctionedProperty, "price": price, "actions": player.getActions()};

                this.auction = null;
                this.auctionGoing = false;
                this.auctionedProperty = null;
                json['message'] = player.name + " won the auction for " + json['location'];
                return json; 
            }
        }

        // no winner
        return null;
    }

    /****************************************************************************************
     * GET METHODS
     ****************************************************************************************/

    // TODO expand by adding more getter methods

    /**
     * Informs whose turn it is.
     *
     * @return object of the player whose turn it is
     */
    getCurrentPlayer() {
        return this.playerManager.getCurrentPlayer().toJSON();
    }

    /**
     * Gets the rent of the property.
     * @param property name of the property
     *
     * @return JSON of {name: property, price: rent price (null if unowned)}
     */
    getRent(player, property) {
        let rent = this.boardManager.getRent(player, player.location);
        return {"name": property, "price": rent}
    }

    /**
     * Gets all of the information about a property
     * @param property string name of property
     *
     * @return JSON of relevant property information
     */
    getPropertyInfo(property) {
        return this.boardManager.locations[property].toJSON();
    }

    /**
     * Gets a list of all places that you can get by taxi.
     *
     * @return string list of all taxi/train locations
     */
    getTaxiLocations() {
        return this.boardManager.getTransitLocations();
    }

    /**
     * Gets a list of all places on the board.
     *
     * @return string list of all locations
     */
    getAllLocations() {
        return this.boardManager.getLocationNames();
    }

    /**
     * Gets a list of all unowned properties on the board.
     *
     * @return string list of all unowned properties
     */
    getAllUnownedLocations() {
        return this.boardManager.getUnownedLocations();
    }

    /**
     * Gets the name of the location with the highest base rent.
     *
     * @return string name of property
     */
    getHighestRent() {
        return this.boardManager.getHighestRent();
    }

    /**
     * Gets the names of all of the players in the game;
     *
     * @return list of string player names
     */
    getPlayerNames() {
        return this.playerManager.getPlayerNames();
    }

    /**
     * Gets the actions for the player
     * @param name name of player asking
     *
     * @return JSON with field actions (list of actions)
     */
    getActions(name) {
        return this.playerManager.getPlayer(name).getActions();
    }
}

module.exports = Game;
