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
        bus.Register("create_game", CreateGame);

        DontDestroyOnLoad(gameObject); // Create this object between scenes
    }

    private void CreateGame(Message obj)
    {
        socket.Emit(NetworkMessageStrings.CREATE_GAME, new JSONObject());
    }

    private void RefreshLobbies(Message obj)
    {
        Debug.Log("TODO get games");
    }

    private void PlayerNameReceived(Message obj)
    {
        string playerName = obj.GetData<string>();

        //socket.Emit("join", "{\"username\": " + playerName + "}");
        Dictionary<string, string> data = new Dictionary<string, string>();
        data["username"] = playerName;
        socket.Emit(NetworkMessageStrings.JOIN_GAME, new JSONObject(data));
        //Debug.Log("Network Manager Received " + playerName);
    }

    // Use this for initialization
    void Start () {
        socket = GetComponent<SocketIO.SocketIOComponent>();

        socket.On(NetworkMessageStrings.SEND_CLIENT_NAME, ClientNameCallback);
        //socket.On(NetworkMessageStrings.UPDATED_GAMES, UpdatedGamesCallback);
    }

    private void ClientNameCallback(SocketIOEvent obj)
    {
        Debug.Log("Name received " + obj.data.ToString());
    }

    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        Debug.Log("Updated Games: " + obj.data.ToString());
    }

    // Update is called once per frame
    void Update () {
		
	}
}
