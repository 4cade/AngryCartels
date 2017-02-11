using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;

public class NetworkManager : MonoBehaviour {

    private SocketIO.SocketIOComponent socket;
    private MessageBus bus;

    void Awake()
    {
        // Register MessageBus Events
        bus = MessageBus.Instance;
        bus.Register("player_name_set", PlayerNameReceived);
        bus.Register("refresh", RefreshLobbies);
        bus.Register("join_lobby", JoinLobby);
        //bus.Register("create_game", CreateGame);

        DontDestroyOnLoad(gameObject); // Create this object between scenes
    }

    private void JoinLobby(Message obj)
    {
        string name = obj.GetData<string>();
        Debug.Log("unity joining server host " + name);
        socket.Emit(NetworkMessageStrings.JOIN_GAME, name);
    }

    private void CreateGame(Message obj)
    {
        socket.Emit(NetworkMessageStrings.CREATE_GAME);
    }

    private void RefreshLobbies(Message obj)
    {
        Debug.Log("TODO get games");
        socket.Emit(NetworkMessageStrings.GET_GAMES);
    }

    private void PlayerNameReceived(Message obj)
    {
        string playerName = obj.GetData<string>();

        //socket.Emit("join", "{\"username\": " + playerName + "}");
        Dictionary<string, string> data = new Dictionary<string, string>();
        data["username"] = playerName;
        JSONObject json = new JSONObject(data);
        socket.Emit(NetworkMessageStrings.JOIN, json);
        //Debug.Log("Network Manager Received " + playerName);
    }

    // Use this for initialization
    void Start () {
        socket = GetComponent<SocketIO.SocketIOComponent>();

        socket.On(NetworkMessageStrings.SEND_CLIENT_NAME, ClientNameCallback);
        socket.On(NetworkMessageStrings.UPDATED_GAMES, UpdatedGamesCallback);
        socket.On(NetworkMessageStrings.IN_ROOM, InRoom);
    }

    private void InRoom(SocketIOEvent obj)
    {
        Debug.Log("WARNING: If updated games message is received after the " 
            + "join game message, then the player lobby wont be properly displayed.");
        bus.Broadcast("joined_room", obj.data.list[0].keys[0]);
    }

    private void ClientNameCallback(SocketIOEvent obj)
    {
        Debug.Log("Name received " + obj.data.ToString());
    }

    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        Debug.Log("Updated Games: " + obj.data.ToString());
        MessageBus.Instance.Broadcast(new Message("title_response_received", TitleResponseType.LOBBY_UPDATE, obj.data));
    }
}
