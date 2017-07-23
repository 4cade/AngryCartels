using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// The Network manager exists across scenes to communicate with the javascript
/// server.
/// NOTES:
/// We probably should only send the lobby hosts when searching for a lobby
/// and not include the players already in that lobby.
/// </summary>
public class NetworkManager : MonoBehaviour {

    // The build index for the title scene
    public int titleScene;

    // The build index for the game scene.
    public int gameScene;

    private SocketIO.SocketIOComponent socket;

    /// <summary>
    /// Called after this object is created, NOTE: not all game objects may 
    /// exist yet.
    /// </summary>
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

    /// <summary>
    /// Called when we want to ask the server what game lobbies exist.
    /// </summary>
    /// <param name="obj">null</param>
    private void GetGames(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    /// <summary>
    /// Called when we want to start the game as the host.
    /// </summary>
    /// <param name="obj"></param>
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

    /// <summary>
    /// TODO: Gets called when there is an auction winner.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewActionWinner(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Gets called when there is a new auction price
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewAuctionPrice(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Gets called when there is a new auction
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewAuction(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Gets called when we want to ask the server for player actions.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnActions(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Gets called when the server returns all unowned property.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnAllUnowned(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when the server is asked about all loations.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnAllLocations(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when server is asked about the highest rent.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnHighestRent(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when the server is asked about rent information.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnRentInfo(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when the server is asked about property informatation
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnPropertyInfo(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when a bus pass is draw.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnDrawBusPass(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Repsponse when a special card is drawn.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnSpecialCard(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when property is bought.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnPropertyBought(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when a player moves tiles.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnMovement(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when it is the next turn.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNextTurn(SocketIOEvent obj)
    {
        Debug.Log(obj.data.ToString());
    }

    /// <summary>
    /// TODO: Response when the game data is queried.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void GameData(SocketIOEvent obj)
    {
        Debug.Log("Game Data: " + obj);
        Message m = new Message("game_data_received", obj.data);
        m.DeleteIfNoReceivers = false;
        MessageBus.Instance.Broadcast(m);
    }

    /// <summary>
    /// Response when the game is started.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void StartGame(SocketIOEvent obj)
    {
        if (SceneManager.GetActiveScene().buildIndex != gameScene)
        {
            SceneManager.LoadScene(gameScene);
        }
    }

    /// <summary>
    /// What gets called when the player wants to join a lobby.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void JoinLobby(Message obj)
    {
        string name = obj.GetData<string>();
        socket.Emit(GameSocketMessages.JOIN_GAME, name);
    }

    /// <summary>
    /// Called when the player creates a game.
    /// </summary>
    /// <param name="obj"></param>
    private void CreateGame(Message obj)
    {
        socket.Emit(GameSocketMessages.CREATE_GAME);
    }

    /// <summary>
    /// Called when the user wants to refresh the lobbies.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void RefreshLobbies(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    /// <summary>
    /// Called when the player sets their name.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void PlayerNameReceived(Message obj)
    {
        string playerName = obj.GetData<string>();
        JSONObject json = new JSONObject();
        json.AddField("username", playerName);
        socket.Emit(GameSocketMessages.JOIN, json);
    }

    /// <summary>
    /// Called when the player joins a room.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void InRoom(SocketIOEvent obj)
    {
        Debug.Log("WARNING: If updated games message is received after the " 
            + "join game message, then the player lobby wont be properly displayed.");
        MessageBus.Instance.Broadcast("joined_room", obj.data);
    }

    /// <summary>
    /// Called when the server has set the player's name.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void ClientNameCallback(SocketIOEvent obj)
    {
        Debug.Log("Name received " + obj.data.ToString());
    }

    /// <summary>
    /// Gets called when there is an updated games request.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        MessageBus.Instance.Broadcast(new Message("title_response_received", TitleResponseType.LOBBY_UPDATE, obj.data));
    }
}
