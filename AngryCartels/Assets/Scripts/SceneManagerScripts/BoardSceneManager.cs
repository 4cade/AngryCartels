using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class BoardSceneManager : GameSceneManager {

    public GameObject playerPrefab;

    public GameObject CurrentPlayer
    {
        get
        {
            return players[gameState.GetCurrentPlayerIndex()].gameObject;
        }
    }

    private TileHandler tileHandler;

    private GameBoardGui gameGui;

    private PlayerScript[] players;

    private GameState gameState = null;

    private int numPlayers = -1;

    // Used to check if the scene has been loaded and all UI elements
    private byte isBoardReadyCounter = 0;
    private const byte BOARD_READY = 3; // TODO: this is a really shitty way to handle dependencies. Should fix this later - LM 1.21.18


    // Use this for initialization
    void Awake() {
        gameState = GameState.Instance;

        MessageBus bus = MessageBus.Instance;
        bus.Register(GameMessages.ON_MOVEMENT, HandleOnMovement);
	}

    private void HandleOnMovement(Message obj)
    {
        MovementJSON movement = obj.GetData<MovementJSON>();
        Logger.d("BoardSceneManager", "Movement data has been received {0} {1} {2} {3}", 
            movement.player, movement.movedTo, movement.actions, movement.message);

        MoveToTile mtt = CurrentPlayer.GetComponent<MoveToTile>();

        //mtt.lerp = 1; // Currently no animation for movement
        // mtt.goalIndex can tell us what tier we are on
        // if goalindex >0 <54 
        //    tier 1
        // if goal >54 <109 etc....
        mtt.lerp = 1;
        mtt.startIndex = mtt.goalIndex;
        int[] result = tileHandler.GetTileIndexFromName(movement.movedTo[movement.movedTo.Length - 1]); // pass in the tier here to figure out what index to use

        if (result.Length == 1)
        {
            mtt.goalIndex = result[0];
        }
        else
        {
            // TODO: The player will always choose the bottom tile if they
            // land on a junction space. Will have to pass more data to figure
            // out if they want to stay on the bottom/top portion of the tile
            Logger.d("BoardSceneManager", "Landed on junction space " + result);
            mtt.goalIndex = result[0];
        }

        MessageBus.Instance.Broadcast(GameMessages.PATHING_GOAL_CHANGE, mtt);

    }

    private void Start()
    {
        gameGui = (GameBoardGui)(GameCanvas.currentSceneGui);
        MessageBus.Instance.Register(GameMessages.GAME_DATA_UPDATED, HandleGameStateUpdated);
    }

    private void HandleGameStateUpdated(Message obj /* we already have reference to gameState */)
    {
        // TODO: Might have current player index be updated here
    }

    override public void OnSceneExit()
    {
        
    }

    override public void OnSceneEnter()
    {
        SceneManager.sceneLoaded += SceneManager_sceneLoaded;
    }

    private void SceneManager_sceneLoaded(Scene arg0, LoadSceneMode arg1)
    {
        IncrementDependencyReady();
    }

    public void SetUpBoard()
    {
        Logger.d("BoardSceneManager", "Intsantiating Players...");
        numPlayers = gameState.GetNumberOfPlayers();
        Logger.d("BoardSceneManager", "Creating number of players: " + numPlayers);

        GameObject playerContainer = transform.Find("Players").gameObject;
        players = new PlayerScript[numPlayers];
        for (int i = 0; i < numPlayers; ++i)
        {
            GameObject player = Instantiate(playerPrefab);
            player.transform.SetParent(playerContainer.transform);
            players[i] = player.GetComponent<PlayerScript>();

            // initial player info here
            players[i].PlayerName = gameState.GetPlayerName(i);
            players[i].PlayerId = i; // TODO: This should be something better than just the index
            players[i].PlayerMoney = gameState.GetTeamMoney(i);

            if (players[i].PlayerName == GameManager.Instance.currentUser.Username)
            {
                Logger.w("BoardSceneManager", "We should not be assuming the local user based on their username");
                players[i].IsLocal = true;
            }

            Logger.d("BoardSceneManager", "Creating Player({0}) {1} with money {2}.", players[i].PlayerId, players[i].PlayerName, players[i].PlayerMoney);

            // properties
            List<string> propertyNames = gameState.GetTeamProperties(i);
            foreach (string property in propertyNames)
            {
                int groupId = gameState.GetGroup(property);
                Logger.d("BoardSceneManager", "Player Card: " + groupId + " -- " + property);
                players[i].Cards[groupId].Add(property);
            }

            // bus passes
            List<BusTicket> busTickets = gameState.GetTeamBusTickets(i);
            foreach (BusTicket ticket in busTickets)
            {
                Logger.d("BoardSceneManager", "Ticket: " + ticket.Name + " -- " + ticket.Amount);
                players[i].BusPasses[ticket.Name] = ticket.Amount;
            }

            // special cards
            List<SpecialCard> specialCards = gameState.GetTeamSpecialCards(i);
            foreach (SpecialCard card in specialCards)
            {
                Logger.d("BoardSceneManager", "SpecialCard: " + card.Name + " -- " + card.Amount);
                players[i].SpecialCards[card.Name] = card.Amount;
            }
        }

        IncrementDependencyReady();
    }

    private void PostSceneLoadSetup()
    {
        Logger.d("BoardScenemanager", "Starting Game...");
        SceneManager.sceneLoaded -= SceneManager_sceneLoaded;

        tileHandler = GameObject.Find("TileHandler").GetComponent<TileHandler>();

        StartGame();
    }

    private void StartGame()
    {
        PlacePlayersOnStart();

        int ii = gameState.GetCurrentPlayerIndex();
        GameObject cp = players[ii].gameObject;
        CameraFollowPlayer cfp = Camera.main.GetComponent<CameraFollowPlayer>();
        cfp.target = cp;

        gameGui.DisplayPlayerActions(ii);
    }

    private void PlacePlayersOnStart()
    {
        foreach (PlayerScript ps in players)
        {
            MoveToTile mtt = ps.GetComponent<MoveToTile>();
            mtt.startIndex = 0; // TODO: should later change to START_LOCATION instead of using the first index
            mtt.goalIndex = 0;
            MessageBus.Instance.Broadcast(GameMessages.PATHING_GOAL_CHANGE, mtt);
        }
    }

    public void IncrementDependencyReady()
    {
        if (++isBoardReadyCounter >= BOARD_READY)
        {
            PostSceneLoadSetup();
        }
    }

    public void UpdateActions()
    {
        int ii = gameState.GetCurrentPlayerIndex();
        gameGui.DisplayPlayerActions(ii);
    }
}
