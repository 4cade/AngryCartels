using UnityEngine;
using System.Collections;
using UnityEngine.Assertions;
using System;
using System.Collections.Generic;

/// <summary>
/// The GameInfo class contains replicated information from the server to 
/// the local machine. 
/// </summary>
public class GameInfo : MonoBehaviour {

    private static GameInfo instance;
    public static GameInfo Instance
    {
        get
        {
            if (instance == null)
            {
                Debug.LogError("GAME INSTANCE IS NULL YOU TWAT");
            }
            return instance;
        }
    }

    // Number of players in the game
    [Range(2, 8)]
    private int numPlayers;
    public int NumPlayers { get { return numPlayers; } }

    // Player Objects
    private PlayerScript[] players;

    //TODO:
    public GameObject playerPrefab;

    // TODO: Going to store action prefab here for now
    public GameObject actionItemPrefab;

    // Used to check if numRounds should be used
    public bool doesGameHaveRoundLimit;

    // The number of rounds for this particular game
    public int maxRounds;

    // handles location data of the game
    public GameObject mapManager;

    // Action Types
    public string[] actionNames;

    // The node Json parser
    private GameParser parser;

    /// <summary>
    /// Called after this object is constructed
    /// </summary>
    private void Awake()
    {
        // add the gamestate
        parser = GetComponent<GameParser>();

        MessageBus.Instance.Register("instantiate_players", OnInstantiatePlayers);
    }

    /// <summary>
    /// Called when the game should begin and players should be created on the local
    /// host.
    /// </summary>
    /// <param name="obj">Contains the number of players that should be created</param>
    private void OnInstantiatePlayers(Message obj)
    {
        numPlayers = obj.GetData<int>();
        List<PlayerPair> playerList = parser.GetPlayerNamesAndId();
        Debug.Log("instantiating players: " + numPlayers);
        
        // add number of players
        GameObject playerContainer = transform.Find("Players").gameObject;
        players = new PlayerScript[numPlayers];
        for (int i = 0; i < numPlayers; ++i)
        {
            GameObject player = Instantiate(playerPrefab);
            player.transform.SetParent(playerContainer.transform);
            players[i] = player.GetComponent<PlayerScript>();

            // initial player info here
            // name
            players[i].PlayerName = playerList[i].Name;
            Debug.Log("Player Name: " + players[i].PlayerName + "--" + playerList[i].Name);

            // game id
            players[i].PlayerId = playerList[i].ID;
            Debug.Log("Player ID: " + players[i].PlayerId);

            // money
            Debug.Log("TODO: set player information here like money and bitches");
            players[i].PlayerMoney = parser.GetTeamMoney(i); // NOTE: hopefully these indecies line up
            Debug.Log("Player Money: " + players[i].PlayerMoney);

            // properties
            List<string> propertyNames = parser.GetTeamProperties(i);
            foreach (string property in propertyNames)
            {
                int groupId = parser.GetGroup(property);
                Debug.Log("Player Card: " + groupId + " -- " + property);
                players[i].Cards[groupId].Add(property);
            }

            // bus passes
            List<BusTicket> busTickets = parser.GetTeamBusTickets(i);
            foreach (BusTicket ticket in busTickets)
            {
                // NEXT TODO: WHY IS THIS BREAKING
                Debug.Log(players[i].PlayerName + " -- " + ticket.Name + ": " + ticket.Amount);
                players[i].BusPasses[ticket.Name] = ticket.Amount;
            }

            // special cards
            List<SpecialCard> specialCards = parser.GetTeamSpecialCards(i);
            foreach (SpecialCard card in specialCards)
            {
                Debug.Log(players[i].PlayerName + " -- " + card.Name + ": " + card.Amount);
                players[i].SpecialCards[card.Name] = card.Amount;
            }

        }

        //GameObject.Find("PlayerPanel").GetComponent<PlayerCardCreator>().createPlayerCards(playerList, playerContainer);
    }

    // Use this for initialization
    void Start () {
        
        instance = this;

	    if (doesGameHaveRoundLimit)
        {
            GameObject.Find("RoundPanel").GetComponent<RoundCounter>().setMaxRoundsText(maxRounds);
        }

        // TEMP: Debugging the new ui
        GameObject canvas = GameObject.Find("Canvas");
        GameState.Instance = new GameState();
        GameState.Instance.Players = new GameObject[1];
        GameState.Instance.Players[0] = Instantiate(playerPrefab);
        PlayerScript ps = GameState.Instance.Players[0].GetComponent<PlayerScript>();
        ps.PlayerName = "TEST_NAME";
        ps.PlayerMoney = 100.5f;
        ps.PlayerPlace = 2;
        ps.Cards[1].Add("boardwalk");
        ps.Cards[1].Add("mother clucker");
        canvas.GetComponent<GameCanvas>().currentSceneGui.OnSceneEnter();

    }

    /// <summary>
    /// Returns an action string from a given index.
    /// </summary>
    public string GetActionName(int index)
    {
        return actionNames[index];
    }
}
