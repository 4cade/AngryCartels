using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// NOTES:
/// We probably should only send the lobby hosts when searching for a lobby
/// and not include the players already in that lobby.
/// </summary>

public class NetworkManager : MonoBehaviour {

    public int titleScene;
    public int gameScene;

    private SocketIO.SocketIOComponent socket;

    void Awake()
    {
        // Register MessageBus Events     
        MessageBus.Instance.Register("player_name_set", PlayerNameReceived);
        MessageBus.Instance.Register("refresh", RefreshLobbies);
        MessageBus.Instance.Register("join_lobby", JoinLobby);
        MessageBus.Instance.Register("create_game", CreateGame);
        MessageBus.Instance.Register("start_game", StartGameAsHost);
        MessageBus.Instance.Register("ping_lobbies", GetGames);

        DontDestroyOnLoad(gameObject); // Create this object between scenes
    }

    private void GetGames(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    private void StartGameAsHost(Message obj)
    {
        socket.Emit(GameSocketMessages.START_GAME);
        //StartGame(null);
    }

    // Use this for initialization
    void Start()
    {
        socket = GetComponent<SocketIO.SocketIOComponent>();

        socket.On(GameSocketMessages.SEND_CLIENT_NAME, ClientNameCallback);
        socket.On(GameSocketMessages.UPDATED_GAMES, UpdatedGamesCallback);
        socket.On(GameSocketMessages.IN_ROOM, InRoom);
        socket.On(GameSocketMessages.START_GAME, StartGame);

        // In Game Messages
        socket.On(GameSocketMessages.GAME_DATA, GameData);
        socket.On(GameSocketMessages.NEXT_TURN, OnNextTurn);
        socket.On(GameSocketMessages.MOVEMENT, OnMovement);
        socket.On(GameSocketMessages.PROPERTY_BOUGHT, OnPropertyBought);
        socket.On(GameSocketMessages.SPECIAL_CARD, OnSpecialCard);
        socket.On(GameSocketMessages.DRAW_BUS_PASS, OnDrawBusPass);
        socket.On(GameSocketMessages.PROPERTY_INFO, OnPropertyInfo);
        socket.On(GameSocketMessages.RENT_INFO, OnRentInfo);
        socket.On(GameSocketMessages.HIGHEST_RENT, OnHighestRent);
        socket.On(GameSocketMessages.ALL_LOCATIONS, OnAllLocations);
        socket.On(GameSocketMessages.ALL_UNOWNED, OnAllUnowned);
        socket.On(GameSocketMessages.ACTIONS, OnActions);
        socket.On(GameSocketMessages.NEW_AUCTION, OnNewAuction);
        socket.On(GameSocketMessages.NEW_AUCTION_PRICE, OnNewAuctionPrice);
        socket.On(GameSocketMessages.AUCTION_WINNER, OnNewActionWinner);
    }

    private void OnNewActionWinner(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnNewAuctionPrice(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnNewAuction(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnActions(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnAllUnowned(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnAllLocations(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnHighestRent(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnRentInfo(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnPropertyInfo(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnDrawBusPass(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnSpecialCard(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnPropertyBought(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnMovement(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void OnNextTurn(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    private void GameData(SocketIOEvent obj)
    {
        //Debug.Log("Game Data: " + obj.data.ToString());
        MessageBus.Instance.Broadcast("game_data_received", obj.data);
    }

    private void StartGame(SocketIOEvent obj)
    {
        if (SceneManager.GetActiveScene().buildIndex != gameScene)
        {
            SceneManager.LoadScene(gameScene);
        }
    }

    private void JoinLobby(Message obj)
    {
        string name = obj.GetData<string>();
        socket.Emit(GameSocketMessages.JOIN_GAME, name);
    }

    private void CreateGame(Message obj)
    {
        socket.Emit(GameSocketMessages.CREATE_GAME);
    }

    private void RefreshLobbies(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    private void PlayerNameReceived(Message obj)
    {
        string playerName = obj.GetData<string>();

        //socket.Emit("join", "{\"username\": " + playerName + "}");
        //Dictionary<string, string> data = new Dictionary<string, string>();
        //data["username"] = playerName;
        //JSONObject json = new JSONObject(data);
        JSONObject json = new JSONObject();
        json.AddField("username", playerName);
        socket.Emit(GameSocketMessages.JOIN, json);
        //Debug.Log("Network Manager Received " + playerName);
    }

    private void InRoom(SocketIOEvent obj)
    {
        Debug.Log("WARNING: If updated games message is received after the " 
            + "join game message, then the player lobby wont be properly displayed.");
        MessageBus.Instance.Broadcast("joined_room", obj.data);
    }

    private void ClientNameCallback(SocketIOEvent obj)
    {
        Debug.Log("Name received " + obj.data.ToString());
    }

    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        MessageBus.Instance.Broadcast(new Message("title_response_received", TitleResponseType.LOBBY_UPDATE, obj.data));
    }
}
