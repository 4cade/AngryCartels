using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// The types of tiles that exist.
/// </summary>
public enum TileType
{
    PROPERTY,
    COMMUNITY_CHEST,
    CHANCE,
    PLACE,
    TELEPORT,
    AUCTION,
    MISFORTUNE,
    COLLECT,
    SQUEEZE_PLAY,
    FORTUNE,
    RAILROAD,
    BUS,
    UTILITY,
    CAB
}

/// <summary>
/// Holds name and id information
/// </summary>
public abstract class GamePair
{
    protected KeyValuePair<string, int> data;

    public string Name { get { return data.Key; } }
    public int ID { get { return data.Value; } }

    public GamePair(string name, int id)
    {
        data = new KeyValuePair<string, int>(name, id);
    }
}

/// <summary>
/// Holds information relating to a player and its id
/// on the server.
/// </summary>
public class PlayerPair : GamePair
{
    public PlayerPair(string name, int id) : base(name, id) { }
}

/// <summary>
/// Holds the information relating to a team and its 
/// id on the server.
/// </summary>
public class TeamPair : GamePair
{
    public TeamPair(string name, int id) : base(name, id) { }
}

/// <summary>
/// Represents a bus ticket
/// </summary>
public class BusTicket
{
    public string Name { get; set; }

    public int Amount { get; set; }

    public BusTicket(string name, int amount = 0)
    {
        Name = name;
        Amount = amount;
    }
}

/// <summary>
/// Represents a special card
/// </summary>
public class SpecialCard
{
    public string Name { get; set; }

    public int Amount { get; set; }

    public SpecialCard(string name, int amount = 0)
    {
        Name = name;
        Amount = amount;
    }
}

/// <summary>
/// Parsers the JSON object that is sent from the server.
/// The Json received from the server represents the entire 
/// gamestate.
/// </summary>
public class GameState : MonoBehaviour {

    private static GameState instance;
    public static GameState Instance
    {
        get
        {
            if (instance == null)
            {
                Logger.e("GameState", "Gamestate is NULL");
            }
            return instance;
        }
        set
        {
            if (instance != null)
            {
                Logger.e("GameState", "Why are you trying to set GameState again?");
            }
            else
            {
                instance = value;
            }
        }
    }

    /// <summary>
    /// The gamestate of the last received json
    /// </summary>
    private JSONObject gameState;

    /// <summary>
    /// TEMP: The number of players, I forgot why this was here.
    /// </summary>
    private int numPlayers = -1;

    /// <summary>
    /// called before the game begins.
    /// </summary>
	void Awake () {
        DontDestroyOnLoad(gameObject);
        gameState = null;
        Instance = this;
	}

    private void Start()
    {
        //Debug.Log("TEMP: load info here");
        //string file = System.IO.File.ReadAllText(@"C:\Users\lemyer\Desktop\game.json");
        //gameState = new JSONObject(file);
    }

    public List<string> GetPlayerNames()
    {
        List<string> playerNames = new List<string>();
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        foreach (JSONObject player in players.list)
        {
            JSONObject nameJson = player.GetField("name");
            playerNames.Add(nameJson.str);
        }
        return playerNames;
    }

    public string GetPlayerName(int index)
    {
        return GetPlayerNames()[index];
    }

    public int GetNumberOfPlayers()
    {
        if (numPlayers == -1)
        {
            numPlayers = GetPlayerNames().Count;
        }
        return numPlayers;
    }

    /// <summary>
    /// Returns the index of the player whose turn it is
    /// </summary>
    /// <returns>Dat player id tho.</returns>
    public int GetCurrentPlayerIndex()
    {
        int turnIndex = GetTurnIndex();

        return turnIndex % numPlayers;
    }

    /// <summary>
    /// Returns the current players name
    /// </summary>
    /// <returns>The in game name of the current player</returns>
    public string GetCurrentPlayerName()
    {
        int turnIndex = GetTurnIndex();
        string name = GetPlayerNameByIndex(turnIndex % numPlayers);

        return name;
    }

    /// <summary>
    /// Returns all the player in the game.
    /// </summary>
    /// <returns></returns>
    public List<PlayerPair> GetPlayerNamesAndId()
    {
        List<PlayerPair> playerNames = new List<PlayerPair>();
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        int count = 0;
        foreach (JSONObject player in players.list)
        {
            JSONObject nameJson = player.GetField("name");
            playerNames.Add(new PlayerPair(nameJson.str, count++));
        }
        return playerNames;
    }

    /// <summary>
    /// Returns the string name of the player by the specified index.
    /// </summary>
    /// <param name="index">The index of the player in the game.</param>
    /// <returns></returns>
    public string GetPlayerNameByIndex(int index)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[index];
        return player.GetField("name").str;
    }

    /// <summary>
    /// Returns if the player is moving forward around the map or backwards
    /// </summary>
    /// <param name="playerIndex">The index of the player to check</param>
    /// <returns>True if moving forward, false if moving in reverse</returns>
    public bool GetPlayerForward(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("forward").b;
    }

    /// <summary>
    /// Gets the string tile name of the player at a specfiied player index.
    /// </summary>
    /// <param name="playerIndex">The index of the player to query</param>
    /// <returns></returns>
    public string GetPlayerLocationString(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("location").str;
    }

    /// <summary>
    /// Gets the track of the player given by the player index
    /// </summary>
    /// <param name="playerIndex">The index of the player to query</param>
    /// <returns>returns 1, 2, or 3</returns>
    public int GetPlayerTrackId(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return (int)player.GetField("track").f;
    }

    /// <summary>
    /// Returns the last rolled number of a player
    /// </summary>
    /// <param name="playerIndex">The player to query.</param>
    /// <returns></returns>
    public int GetPlayerLastRolledNumber(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return (int)player.GetField("lastRolled").f;
    }

    /// <summary>
    /// Gets the player team name
    /// </summary>
    /// <param name="playerIndex">The player to query.</param>
    /// <returns></returns>
    public string GetPlayerTeamString(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("team").str;
    }

    /// <summary>
    /// Gets the team id of a particular player
    /// </summary>
    /// <param name="playerIndex">The player to query.</param>
    /// <returns></returns>
    public int GetPlayerTeamId(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        string teamName = player.GetField("team").str;

        int teamIndex = 0;
        JSONObject teams = gameState.GetField("teams");
        foreach(JSONObject team in teams.list)
        {
            if (team.str == teamName)
            {
                return teamIndex;
            }
            ++teamIndex;
        }

        return -1;
    }

    /// <summary>
    /// Gets the available actions of a player.
    /// </summary>
    /// <param name="playerIndex">The player to query.</param>
    /// <returns></returns>
    public List<string> GetPlayerActions(int playerIndex)
    {
        List<string> actions = new List<string>();
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        JSONObject actionJson = player.GetField("actions");
        foreach (JSONObject action in actionJson.list)
        {
            actions.Add(action.str);
        }
        return actions;
    }

    /// <summary>
    /// TODO: 
    /// </summary>
    /// <param name="playerIndex"></param>
    /// <returns></returns>
    public List<string> GetPlayerActionsOnHold(int playerIndex)
    {
        List<string> actions = new List<string>();
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        JSONObject actionJson = player.GetField("onHoldActions");
        foreach (string action in actionJson.keys)
        {
            actions.Add(action);
        }
        return actions;
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <param name="playerIndex"></param>
    /// <returns></returns>
    public string GetPlayerOnNextTurn(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("onNextTurn").str;
    }

    /// <summary>
    /// Gets all the team names
    /// </summary>
    /// <returns></returns>
    public List<string> GetTeamNames()
    {
        List<string> teamNames = new List<string>();
        JSONObject teams = gameState.GetField("teams");
        foreach (JSONObject team in teams.list)
        {
            teamNames.Add(team.str);
        }
        return teamNames;
    }

    /// <summary>
    /// Gets all the team names and their ID
    /// </summary>
    /// <returns></returns>
    public List<TeamPair> GetTeamNamesAndId()
    {
        List<TeamPair> teamNames = new List<TeamPair>();
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        int count = 0;
        foreach (JSONObject team in teams.list)
        {
            teamNames.Add(new TeamPair(team.str, count++));
        }
        return teamNames;
    }

    /// <summary>
    /// Gets the team name of a given team index.
    /// </summary>
    /// <param name="teamIndex"></param>
    /// <returns></returns>
    public string GetTeamName(int teamIndex)
    {
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        return teams.list[teamIndex].str;
    }

    /// <summary>
    /// Gets the money of a particular team.
    /// </summary>
    /// <param name="teamIndex">The index of the team, will be the same 
    /// as the playerIndex if game is FFA</param>
    /// <returns></returns>
    public int GetTeamMoney(int teamIndex)
    {
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        int value = (int)teams.list[teamIndex].GetField("money").f;
        return value;
    }

    /// <summary>
    /// Gets all the property names owned by the tema.
    /// </summary>
    /// <param name="teamIndex">The team index to query, will be the same 
    /// as the playerIndex if game is FFA</param>
    /// <returns></returns>
    public List<string> GetTeamProperties(int teamIndex)
    {
        List<string> teamProperties = new List<string>();
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        JSONObject propertyJson = teams.list[teamIndex].GetField("properties");
        foreach(JSONObject property in propertyJson.list)
        {
            teamProperties.Add(property.str);
        }
        return teamProperties;
    }

    /// <summary>
    /// Gets the bus tickets owned by a team.
    /// </summary>
    /// <param name="teamIndex">The team index to query, will be the same 
    /// as the playerIndex if game is FFA</param>
    /// <returns></returns>
    public List<BusTicket> GetTeamBusTickets(int teamIndex)
    {
        List<BusTicket> teamBuses = new List<BusTicket>();
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        JSONObject busJson = teams.list[teamIndex].GetField("busTickets");

        foreach (string bus in busJson.keys)
        {
            teamBuses.Add(new BusTicket(bus, 0));
        }
        for (int i = 0; i < busJson.list.Count; ++i)
        {
            teamBuses[i].Amount = (int)busJson.list[i].f;
        }

        return teamBuses;
    }

    /// <summary>
    /// Gets the special cards owned by a particular team.
    /// </summary>
    /// <param name="teamIndex">The team index to query, will be the same 
    /// as the playerIndex if game is FFA</param>
    /// <returns></returns>
    public List<SpecialCard> GetTeamSpecialCards(int teamIndex)
    {
        List<SpecialCard> teamSpecial = new List<SpecialCard>();
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        JSONObject cardsJson = teams.list[teamIndex].GetField("specialCards");

        foreach (string card in cardsJson.keys)
        {
            teamSpecial.Add(new SpecialCard(card, 0));
        }
        for (int i = 0; i < cardsJson.list.Count; ++i)
        {
            teamSpecial[i].Amount = (int)cardsJson.list[i].f;
        }

        return teamSpecial;
    }

    /// <summary>
    /// Gets the current turn that the game is on.
    /// </summary>
    /// <returns></returns>
    public int GetTurnIndex()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return (int)playerManager.GetField("turnIndex").f;

    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public bool GetCanRoll()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return playerManager.GetField("canRoll").b;
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public int GetDoubleCount()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return (int)playerManager.GetField("doubleCount").f;
    }

    /// <summary>
    /// Gets the number of available houses.
    /// </summary>
    /// <returns></returns>
    public int GetAvailableHouses()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("houses").f;
    }

    /// <summary>
    /// Gets the number of available hotels.
    /// </summary>
    /// <returns></returns>
    public int GetAvailableHotels()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("hotels").f;
    }

    /// <summary>
    /// Gets the number of available skyscrypesersers
    /// </summary>
    /// <returns></returns>
    public int GetAvailableSkyscrapers()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("skyscrapers").f;
    }

    /// <summary>
    /// Gets the number of Pools
    /// </summary>
    /// <returns></returns>
    public int GetNumberPools()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("pool").f;
    }

    /// <summary>
    /// Gets the number of unowned property
    /// </summary>
    /// <returns>List of strings</returns>
    public int GetNumberUnownedProperties()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("unownedProperties").f;
    }

    /// <summary>
    /// Gets all the property names.
    /// </summary>
    /// <returns></returns>
    public List<string> GetPropertyNames()
    {
        List<string> tiles = new List<string>();
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        foreach(JSONObject location in locations.list)
        {
            tiles.Add(location.str);
        }
        return tiles;
    }

    /// <summary>
    /// Gets the type of tile based on its name
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public TileType GetTileType(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return ConvertTypeFromString(tile.GetField("type").str);
    }

    /// <summary>
    /// Gets the tile in the forward position of the tile name.
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public string GetForwardTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("forward").keys[0];
    }

    /// <summary>
    /// Gets the tile name of the tile behind a given tilename.
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public string GetBackwardTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("backward").keys[0];
    }

    /// <summary>
    /// Gets the tile to the side of the tilename
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetSide(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return Convert.ToInt32(tile.GetField("side").keys[0]);
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetTrack(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return Convert.ToInt32(tile.GetField("track").keys[0]);
    }

    /// <summary>
    /// Gets the tile about the given tileName.
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns>can return "" of the tile is on the highest track.</returns>
    public string GetAboveTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("above").keys[0];
    }

    /// <summary>
    /// Gets the tile below the given tielName
    /// </summary>
    /// <param name="tileName">can return "" if the tile is on the lowest track.</param>
    /// <returns></returns>
    public string GetBelowTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("below").keys[0];
    }

    /// <summary>
    /// TODO: 
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public bool GetSnapshot(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("snapshot").b;
    }

    /// <summary>
    /// Gets the number representing a card group from a given tilename
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetGroup(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("group").f;
    }

    /// <summary>
    /// Gets the current rent for a given tilename
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetRentCurrent(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        int numHouses = (int)tile.GetField("houses").f;
        int rent = Convert.ToInt32(tile.GetField("rent").keys[numHouses + (3 * Math.Min(1, numHouses))]);
        //throw new NotImplementedException(); // TODO: how is rent calculated
        return rent;
    }

    /// <summary>
    /// Gets the list of rent values for a given tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public List<int> GetRentList(string tileName)
    {
        List<int> rents = new List<int>();
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        foreach (string key in tile.GetField("rent").keys)
        {
            rents.Add(Convert.ToInt32(key));
        }
        return rents;
    }

    /// <summary>
    /// Gets the value of morgaging the property of a given tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetMortgageValue(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("mortgageValue").f;
    }

    /// <summary>
    /// Gets the cost of a property of a given tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetTileCost(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("cost").f;
    }

    /// <summary>
    /// Returns the owner of a property of the given tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns>Can return "" if no owner</returns>
    public string GetPropertyOwner(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("owner").str;
    }

    /// <summary>
    /// Returns if a property is mortgaged given a tileName.
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns>Returns true if mortgaged and false if otherwise.</returns>
    public bool GetIsMortgaged(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("isMortgaged").b;
    }

    /// <summary>
    /// Gets the number of hotels on a property given by its tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetNumberHotels(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("hotels").f;
    }

    /// <summary>
    /// Returns the number of houses on a tile given by a tileName.
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetNumberHouses(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("houses").f;
    }

    /// <summary>
    /// Gets the number of skyscrappers on a tile given by the tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetNumberSkyscrapers(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("skyscrappers").f;
    }

    /// <summary>
    /// Gets the price for a house on a tileName
    /// </summary>
    /// <param name="tileName"></param>
    /// <returns></returns>
    public int GetHousePrice(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("housePrice").f;
    }

    /// <summary>
    /// Converts a type type string to an TileType integer
    /// </summary>
    /// <param name="tileTypeStr"></param>
    /// <returns></returns>
    public TileType ConvertTypeFromString(string tileTypeStr)
    {
        switch (tileTypeStr)
        {
            case "property":
                return TileType.PROPERTY;
            case "chance":
                return TileType.CHANCE;
            case "community chest":
                return TileType.COMMUNITY_CHEST;
            default:
                throw new ArgumentException(tileTypeStr);
        }
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public string GetAuction()
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public bool IsAuctionGoing()
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public string GetAuctionedProperty()
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public int GetLastOdd()
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// TODO:
    /// </summary>
    /// <returns></returns>
    public string GetLog()
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// Gets called when the client receives a new gamestate update from the server.
    /// </summary>
    /// <param name="obj"></param>
    public void UpdateGameState(JSONObject data)
    {
        gameState = data;

        MessageBus.Instance.Broadcast(GameMessages.GAME_DATA_UPDATED);
        
        // TODO: Still might want to have an event be thrown that the game state has updated
        // Although it would probably be more efficient to check what changed but I'm not sure 
        // how to do that when we get the whole game state everytime.
    }
}
