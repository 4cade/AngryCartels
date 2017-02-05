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

        DontDestroyOnLoad(gameObject); // Create this object between scenes
    }

    private void RefreshLobbies(Message obj)
    {
        Debug.Log("Get Games Emitted");
        socket.Emit("create game");
    }

    private void PlayerNameReceived(Message obj)
    {
        string playerName = obj.GetData<string>();
        
        socket.Emit("join", "{\"username\": " + playerName + "}");

        Debug.Log("Network Manager Received " + playerName);
    }

    // Use this for initialization
    void Start () {
        socket = GetComponent<SocketIO.SocketIOComponent>();


        socket.On("updated games", UpdatedGamesCallback);
    }

    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        Debug.Log("Updated Games: " + obj.data.ToString());
    }

    // Update is called once per frame
    void Update () {
		
	}
}
