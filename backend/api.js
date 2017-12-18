var Game = require('./game');

// cache of games, TODO persist on the persistent store in case of crash
let games = {};


/**
* Gets the game from the cache, otherwise tries the persistent store
* @param gameId id of the game
* @return Game object
*/
function getGame(gameId) {
    // TODO
    if(games.hasOwnProperty(gameId)) {
        return games[gameId];
    } else {
        // TODO try get game from persistent store
        // on fail... send error
    }
}

/**
* Persists the game on the persistent store.
* @param gameObj Game Object that will get saved
*/
function persistGame(gameObj) {
    // TODO
}

function createGame(gameId, gamePresets) {
    // TODO
    if(!games.hasOwnProperty(gameId)) {
        games[gameId] = new Game(gamePresets);
        return games[gameId].toJSON();
    }
}

/**
* Handles a request from the socket
* @param data JSON with fields: gameId (str), username (str), 
*       action (str) and info (JSON with any data necessary for the action)
* @return appropriate JSON for the request
*/
function handleRequest(gameId, username, action, info) {
    const game = getGame(gameId);
    console.log(gameId + ' ' + username + " " + action + " " + JSON.stringify(info));

    switch(action) {
        case 'roll':
            return game.rollDice();

        case 'draw bus pass':
            return game.drawBusPass();

        case 'mrmonopoly':
            return game.unleashMrMonopoly();

        case 'jail':
            return game.handleJail(info.pay);

        case 'teleport':
            return game.teleport(info.location);

        case 'rent':
            return game.payRent();

        case 'taxi':
            return game.taxiRide(info.location);

        case 'bus':
            return game.useBusPass(info.pass, info.location);

        case 'trade':
            return game.trade(info);

        case 'buy':
            // different actions if was auctioned
            if(info.price)
                return game.buyPropertyAuction(info);
            else
                return game.buyProperty();

        case 'set houses':
            return game.setHouses(info);

        case 'mortgage':
            return game.mortgageProperty(info);

        case 'unmortgage':
            return game.unmortgageProperty(info);

        case 'up auction':
            game.startAuction(info.location);
            return game.getPropertyInfo(info.location);

        case 'set auction price':
            game.addBid(username, info.price);
            return game.finishAuction();

        case 'draw fortune':
            return game.drawFortune();

        case 'draw misfortune':
            return game.drawMisfortune();

        case 'use special card':
            return game.useSpecialCard(username, info.card);

        case 'roll3':
            return game.roll3();

        case 'squeeze':
            return game.squeezePlay();

        case 'end turn':
            return game.nextTurn();

        case 'get actions':
            return game.getActions(info.player);

        case 'property info':
            return game.getPropertyInfo(info.location);

        case 'rent info':
            return game.getRent(username, info.location);

        case 'highest rent':
            let property = game.getHighestRent();
            return game.getPropertyInfo(property);

        case 'all locations':
            return game.getAllLocations();

        case 'all unowned':
            return game.getAllUnownedLocations();

        case 'request game data':
            return game.toJSON();

        default:
            // if the case doesn't exist
            return {'error': true, 'message': 'invalid action: ' + action};
    }

    persistGame(game);
}

module.exports = {'createGame': createGame, 'handleRequest': handleRequest}