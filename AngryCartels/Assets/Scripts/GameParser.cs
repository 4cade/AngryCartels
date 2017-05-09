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
/// Holds player name and player id
/// </summary>
public class PlayerPair : GamePair
{
    PlayerPair(string name, int id) : base(name, id) { }
}

/// <summary>
/// holds team name and id
/// </summary>
public class TeamPair : GamePair
{
    TeamPair(string name, int id) : base(name, id) { }
}

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

public class GameParser : MonoBehaviour {

    private JSONObject gameState;
    private int numPlayers = -1;

	void Awake () {
        gameState = null;
        MessageBus.Instance.Register("game_data_received", OnGameDataReceived);		
	}

    private void Start()
    {
        // TEMP: load info here
        string file = System.IO.File.ReadAllText(@"C:\Users\chats\Desktop\game.json");
        //gameState = new JSONObject(file);
        //Debug.Log("It is: " + GetCurrentPlayerName() + " turn");
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

    public int GetCurrentPlayerIndex()
    {
        if (numPlayers == -1)
        {
            numPlayers = GetPlayerNames().Count;
        }

        int turnIndex = GetTurnIndex();

        return turnIndex % numPlayers;
    }

    public string GetCurrentPlayerName()
    {
        if (numPlayers == -1)
        {
            numPlayers = GetPlayerNames().Count;
        }

        int turnIndex = GetTurnIndex();
        string name = GetPlayerNameByIndex(turnIndex % numPlayers);

        return name;
    }

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

    public string GetPlayerNameByIndex(int index)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[index];
        return player.GetField("name").str;
    }

    public bool GetPlayerForward(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("forward").b;
    }

    public string GetPlayerLocationString(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("location").str;
    }

    public int GetPlayerTrackId(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return (int)player.GetField("track").f;
    }

    public int GetPlayerLastRolledNumber(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return (int)player.GetField("lastRolled").f;
    }

    public string GetPlayerTeamString(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("taem").str;
    }

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

    public List<string> GetPlayerActions(int playerIndex)
    {
        List<string> actions = new List<string>();
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        JSONObject actionJson = player.GetField("actions");
        foreach (string action in actionJson.keys)
        {
            actions.Add(action);
        }
        return actions;
    }

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

    public string GetPlayerOnNextTurn(int playerIndex)
    {
        JSONObject players = gameState.GetField("playerManager").GetField("players");
        JSONObject player = players.list[playerIndex];
        return player.GetField("onNextTurn").str;
    }

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

    public string GetTeamName(int teamIndex)
    {
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        return teams.list[teamIndex].str;
    }

    public int GetTeamMoney(int teamIndex)
    {
        JSONObject teams = gameState.GetField("playerManager").GetField("teams");
        int value = (int)teams.list[teamIndex].GetField("money").f;
        return value;
    }

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

    public int GetTurnIndex()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return (int)playerManager.GetField("turnIndex").f;

    }

    public bool GetCanRoll()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return playerManager.GetField("canRoll").b;
    }

    public int GetDoubleCount()
    {
        JSONObject playerManager = gameState.GetField("playerManager");
        return (int)playerManager.GetField("doubleCount").f;
    }

    public int GetAvailableHouses()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("houses").f;
    }

    public int GetAvailableHotels()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("hotels").f;
    }

    public int GetAvailableSkyscrapers()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("skyscrapers").f;
    }

    public int GetNumberPools()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("pool").f;
    }

    public int GetNumberUnownedProperties()
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        return (int)boardManager.GetField("unownedProperties").f;
    }

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

    public TileType GetTileType(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return ConvertTypeFromString(tile.GetField("type").str);
    }

    public string GetForwardTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("forward").keys[0];
    }

    public string GetBackwardTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("backward").keys[0];
    }

    public int GetSide(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return Convert.ToInt32(tile.GetField("side").keys[0]);
    }

    public int GetTrack(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return Convert.ToInt32(tile.GetField("track").keys[0]);
    }

    public string GetAboveTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("above").keys[0];
    }

    public string GetBelowTile(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("below").keys[0];
    }

    public bool GetSnapshot(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("snapshot").b;
    }

    public int GetGroup(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("group").f;
    }

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

    public int GetMortgageValue(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("mortgageValue").f;
    }

    public int GetTileCost(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("cost").f;
    }

    public string GetPropertyOwner(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("owner").str;
    }

    public bool GetIsMortgaged(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return tile.GetField("isMortgaged").b;
    }

    public int GetNumberHotels(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("hotels").f;
    }

    public int GetNumberHouses(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("houses").f;
    }

    public int GetNumberSkyscrapers(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("skyscrappers").f;
    }

    public int GetHousePrice(string tileName)
    {
        JSONObject boardManager = gameState.GetField("boardManager");
        JSONObject locations = boardManager.GetField("locations");
        JSONObject tile = locations.GetField(tileName);
        return (int)tile.GetField("housePrice").f;
    }

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

    public string GetAuction()
    {
        throw new NotImplementedException();
    }

    public bool IsAuctionGoing()
    {
        throw new NotImplementedException();
    }

    public string GetAuctionedProperty()
    {
        throw new NotImplementedException();
    }

    public int GetLastOdd()
    {
        throw new NotImplementedException();
    }

    public string GetLog()
    {
        throw new NotImplementedException();
    }

    private void OnGameDataReceived(Message obj)
    {
        gameState = obj.GetData<JSONObject>();

        // used for the start of the game
        if (numPlayers == -1)
        {
            MessageBus.Instance.Broadcast("instantiate_players", GetPlayerNames().Count);
        }

        Debug.Log("It is: " + GetCurrentPlayerName() + " turn");

        // TEMP
        //System.IO.File.WriteAllText(@"C:\Users\chats\Desktop\game.json", gameState.ToString());
    }

}
