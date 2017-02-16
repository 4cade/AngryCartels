using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum TileType
{
    PROPERTY,
    COMMUNITY_CHEST,
    CHANCE
}

public class PlayerPair
{
    private string name;
    public string Name { get { return name; } }
    private int id;
    public int ID { get { return id; } }

    PlayerPair(string name, int id)
    {
        this.name = name;
        this.id = id;
    }
}

public class TeamPair
{
    private string name;
    public string Name { get { return name; } }
    private int id;
    public int ID { get { return id; } }

    TeamPair(string name, int id)
    {
        this.name = name;
        this.id = id;
    }
}

public class BusTicket
{
    private string name;
    public string Name { get { return name; } }

    private int amount;
    public int Amount { get { return amount; } }

    BusTicket(string name, int amount = 0)
    {
        this.name = name;
        this.amount = amount;
    }
}

public class SpecialCard
{
    private string name;
    public string Name { get { return name; } }

    private int amount;
    public int Amount { get { return amount; } }

    SpecialCard(string name, int amount = 0)
    {
        this.name = name;
        this.amount = amount;
    }
}

public class GameParser : MonoBehaviour {

    private JSONObject gameState;

	void Awake () {
        gameState = null;
        MessageBus.Instance.Register("game_data_received", OnGameDataReceived);		
	}

    private void Start()
    {
        // TODO: load info here
    }

    public List<string> GetPlayerNames()
    {
        throw new NotImplementedException();
    }

    public List<PlayerPair> GetPlayerNamesAndId()
    {
        throw new NotImplementedException();
    }

    public string GetPlayerNameByIndex(int index)
    {
        throw new NotImplementedException();
    }

    public bool GetPlayerForward(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public string GetPlayerLocationString(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public int GetPlayerTrackId(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public int GetPlayerLastRolledNumber(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public string GetPlayerTeamString(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public int GetPlayerTeamId(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public List<string> GetPlayerActions(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public List<string> GetPlayerActionsOnHold(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public string GetPlayerOnNextTurn(int playerIndex)
    {
        throw new NotImplementedException();
    }

    public List<string> GetTeamNames()
    {
        throw new NotImplementedException();
    }

    public List<TeamPair> GetTeamNamesAndId()
    {
        throw new NotImplementedException();
    }

    public string GetTeamName(int teamIndex)
    {
        throw new NotImplementedException();
    }

    public int GetTeamMoney(int teamIndex)
    {
        throw new NotImplementedException();
    }

    public List<string> GetTeamProperties(int teamIndex)
    {
        throw new NotImplementedException();
    }

    public List<BusTicket> GetTeamBusTickets(int teamIndex)
    {
        throw new NotImplementedException();
    }

    public List<SpecialCard> GetTeamSpecialCards(int teamIndex)
    {
        throw new NotImplementedException();
    }

    public int GetTurnIndex()
    {
        throw new NotImplementedException();
    }

    public bool GetCanRoll()
    {
        throw new NotImplementedException();
    }

    public int GetAvailableHouses()
    {
        throw new NotImplementedException();
    }

    public int GetAvailableHotels()
    {
        throw new NotImplementedException();
    }

    public int GetAvailableSkyscrapers()
    {
        throw new NotImplementedException();
    }

    public int GetNumberPools()
    {
        throw new NotImplementedException();
    }

    public int GetNumberUnownedProperties()
    {
        throw new NotImplementedException();
    }

    public List<string> GetPropertyNames()
    {
        throw new NotImplementedException();
    }

    public TileType GetTileType(string tileName)
    {
        throw new NotImplementedException();
    }

    public string GetForwardTile(string tileName)
    {
        throw new NotImplementedException();
    }

    public string GetBackwardTile(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetSide(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetTrack(string tileName)
    {
        throw new NotImplementedException();
    }

    public string GetAboveTile(string tileName)
    {
        throw new NotImplementedException();
    }

    public string GetBelowTile(string tileName)
    {
        throw new NotImplementedException();
    }

    public bool GetSnapshot(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetGroup(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetRentCurrent(string tileName)
    {
        throw new NotImplementedException();
    }

    public List<int> GetRentList(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetMortgageValue(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetTileCost(string tileName)
    {
        throw new NotImplementedException();
    }

    public PlayerPair GetPropertyOwner(string tileName)
    {
        throw new NotImplementedException();
    }

    public bool GetIsMortgaged(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetNumberHotels(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetNumberHouses(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetNumberSkyscrapers(string tileName)
    {
        throw new NotImplementedException();
    }

    public int GetHousePrice(string tileName)
    {
        throw new NotImplementedException();
    }

    private void OnGameDataReceived(Message obj)
    {
        gameState = obj.GetData<JSONObject>();
    }

}
