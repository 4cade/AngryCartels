using System;
using System.Collections;

public abstract class NetworkMessageStrings
{
    // General requests
    public static readonly string GET_CLIENT_NAME = "get client name";
    public static readonly string DISCONNECT = "disconnect";
    public static readonly string CHAT_MESSAGE = "chat message";
    public static readonly string CREATE_GAME = "create game";
    public static readonly string STOP_HOSTING_GAME = "stop hosting game";
    public static readonly string JOIN = "join"; // asdasdf
    public static readonly string JOIN_GAME = "join game";
    public static readonly string LEAVE_GAME = "leave game";
    public static readonly string GET_GAMES = "get games";

    // Game specific requests
    public static readonly string START_GAME = "start game";
    public static readonly string SET_ORDER = "set order";
    public static readonly string ROLL = "roll";
    public static readonly string MRMONOPOLY = "mrmonopoly";
    public static readonly string RENT = "rent";
    public static readonly string TRADE = "trade";
    public static readonly string BUY_PROPERTY = "buy property";
    public static readonly string BUY_HOUSE = "buy house";
    public static readonly string SELL_HOUSE = "sell house";
    public static readonly string MORTGAGE = "mortgage";
    public static readonly string UP_AUCTION = "up auction";
    public static readonly string SET_AUCTION_PRICE = "set auction price";
    public static readonly string DRAW_CHANCE = "draw chance";
    public static readonly string DRAW_COMMUNITY_CHEST = "draw community chest";
    public static readonly string END_TURN = "end turn";
    public static readonly string PROPERTY_INFO = "property info";
    public static readonly string RENT_INFO = "rent info";
    public static readonly string HIGHEST_RENT= "highest rent";
    public static readonly string ALL_LOCATIONS = "all locations";
    public static readonly string ALL_UNOWNED = "all unowned";
    public static readonly string REQUEST_GAME_DATA = "request game data";
    public static readonly string NEXT_TURN = "next turn";
    public static readonly string SPECIAL_CARD = "special card";
    public static readonly string DRAW_BUS_PASS = "draw bus pass";

    // Server to Client
    public static readonly string SEND_CLIENT_NAME = "send client name";
    public static readonly string UPDATED_GAMES = "updated games";
    public static readonly string GAME_DATA = "game data";
    public static readonly string MOVEMENT = "movement";
    public static readonly string ACTIONS = "actions";
    public static readonly string PROPERTY_BOUGHT = "property bought";
    public static readonly string UPDATE_HOUSES = "update houses";
    public static readonly string NEW_AUCTION = "new auction";
    public static readonly string NEW_AUCTION_PRICE = "new auction price";
    public static readonly string AUCTION_WINNER= "auction winner";
    public static readonly string ALL_UNOWNED_LOCATIONS = "all unowned locations";
    public static readonly string IN_ROOM = "in room";
}
