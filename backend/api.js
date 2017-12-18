

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
}

/**
* Handles a request from the socket
* @param data JSON with fields: gameId (str), username (str), 
*       action (str) and info (JSON with any data necessary for the action)
* @return appropriate JSON for the request
*/
function handleRequest(gameId, username, action, info) {
    const game = getGame(gameId);

    switch(action) {
        case 'roll':
            // TODO

        case 'mrmonopoly':
            // TODO

        case 'jail':
            // TODO

        case 'teleport':
            // TODO

        case 'rent':
            // TODO

        case 'taxi':
            // TODO

        case 'bus':
            // TODO

        case 'trade':
            // TODO

        case 'buy':
            // TODO

        case 'set houses':
            // TODO

        case 'mortgage':
            // TODO

        case 'unmortgage':
            // TODO

        case 'up auction':
            // TODO

        case 'set auction price':
            // TODO

        case 'draw fortune':
            // TODO

        case 'draw misfortune':
            // TODO

        case 'use special card':
            // TODO

        case 'roll3':
            // TODO

        case 'squeeze':
            // TODO

        case 'end turn':
            // TODO

        case 'get actions':
            // TODO

        case 'property info':
            // TODO

        case 'rent info':
            // TODO

        case 'highest rent':
            // TODO

        case 'all locations':
            // TODO

        case 'all unowned':
            // TODO

        case 'request game data':
            // TODO

        default:
            // if the case doesn't exist
            return {'error': true, 'message': 'invalid action: ' + action};
    }
}