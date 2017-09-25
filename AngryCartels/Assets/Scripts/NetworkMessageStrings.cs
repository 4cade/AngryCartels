using System;
using System.Collections;

/// <summary>
/// Abstract class of messages to communicate with node.
/// </summary>
public abstract class GameSocketMessages
{
    // General requests
    public const string GET_CLIENT_NAME = "get client name";
    public const string DISCONNECT = "disconnect";
    public const string CHAT_MESSAGE = "chat message";
    public const string CREATE_GAME = "create game";
    public const string STOP_HOSTING_GAME = "stop hosting game";
    public const string JOIN = "join"; // asdasdf
    public const string JOIN_GAME = "join game";
    public const string LEAVE_GAME = "leave game";
    public const string GET_GAMES = "get games";

    // Game specific requests
    public const string START_GAME = "start game";
    public const string SET_ORDER = "set order";
    public const string ROLL = "roll";
    public const string ROLL3 = "roll3";
    public const string MRMONOPOLY = "mrmonopoly";
    public const string RENT = "rent";
    public const string TRADE = "trade";
    public const string BUY_PROPERTY = "buy property";
    public const string BUY_HOUSE = "buy house";
    public const string SELL_HOUSE = "sell house";
    public const string MORTGAGE = "mortgage";
    public const string UP_AUCTION = "up auction";
    public const string SET_AUCTION_PRICE = "set auction price";
    public const string DRAW_CHANCE = "draw chance";
    public const string DRAW_COMMUNITY_CHEST = "draw community chest";
    public const string DRAW_MISFORTUNE = "draw misfortune";
    public const string DRAW_FORTUNE = "draw fortune";
    public const string END_TURN = "end turn";
    public const string PROPERTY_INFO = "property info";
    public const string RENT_INFO = "rent info";
    public const string HIGHEST_RENT= "highest rent";
    public const string ALL_LOCATIONS = "all locations";
    public const string ALL_UNOWNED = "all unowned";
    public const string REQUEST_GAME_DATA = "request game data";
    public const string NEXT_TURN = "next turn";
    public const string SPECIAL_CARD = "special card";
    public const string USE_SPECIAL_CARD = "use special card";
    public const string DRAW_BUS_PASS = "draw bus pass";
    public const string JAIL = "jail";
    public const string TELEPORT = "teleport";
    public const string BUS = "bus";
    public const string TAXI = "taxi";
    public const string SQUEEZE = "squeeze";

    // Server to Client
    public const string SEND_CLIENT_NAME = "send client name";
    public const string UPDATED_GAMES = "updated games";
    public const string GAME_DATA = "game data";
    public const string MOVEMENT = "movement";
    public const string ACTIONS = "actions";
    public const string PROPERTY_BOUGHT = "property bought";
    public const string UPDATE_HOUSES = "update houses";
    public const string NEW_AUCTION = "new auction";
    public const string NEW_AUCTION_PRICE = "new auction price";
    public const string AUCTION_WINNER= "auction winner";
    public const string ALL_UNOWNED_LOCATIONS = "all unowned locations";
    public const string IN_ROOM = "in room";
}
