using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;

/// <summary>
/// Used to switch on the type of responses from the server.
/// </summary>
enum TitleResponseType
{
    LOBBY_UPDATE
}

/// <summary>
/// Sends messagse to the network manager based on the input the user does 
/// in the title screen.
/// </summary>
public class TitleSceneGui : SceneGui {

    // some temporary game objects in the title screen.
    public GameObject inputField;
    public GameObject serverList;
    public GameObject serverButtonlPrefab;
    public GameObject playerList;
    public GameObject playerTextPrefab;

    // currently connected lobby information
    private string lobbyHostName = null;
    private bool isHost = false;

    // some refresh counters
    private float serverRefreshCounter = 0;
    public float SERVER_REFRESH_INTERVAL = 3.0f;
    private float lobbyRefreshCounter = 0;
    public float LOBBY_REFRESH_INTERVAL = 1.0f;

    public override void GameStateUpdate(GameState gs)
    {
        throw new NotImplementedException();
    }

    public override void OnSceneEnter()
    {
        base.OnSceneEnter();
    }

    // Use this for initialization
    void Awake()
    {
        MessageBus.Instance.Register("title_response_received", TitleResponseReceived);
        MessageBus.Instance.Register("joined_room", JoinRoom);
    }

    /// <summary>
    /// Ccalled after object creation
    /// </summary>
    private void Start()
    {
        serverRefreshCounter = SERVER_REFRESH_INTERVAL;
    }

    /// <summary>
    /// Gets called when the player is joining a room.
    /// </summary>
    /// <param name="obj">Contains the name of which host the player is joining.</param>
    private void JoinRoom(Message obj)
    {
        lobbyHostName = obj.GetData<JSONObject>().list[0].str;
        Debug.Log("joining");
    }

    /// <summary>
    /// Called when the title screen should process information received over the network.
    /// </summary>
    /// <param name="obj">Contains what kind of update was received and data pertaining to that update</param>
    private void TitleResponseReceived(Message obj)
    {
        switch (obj.GetData<TitleResponseType>(0))
        {
            case TitleResponseType.LOBBY_UPDATE:
                ClearLobbyItems();
                JSONObject json = obj.GetData<JSONObject>(1);
                CreateLobbyList(json);

                // add people in lobby if we have a host
                if (lobbyHostName != null)
                {
                    int index = json.keys.FindIndex(x => x == lobbyHostName);
                    JSONObject childObject = json.list[index];
                    ClearPlayerTextInLobby();
                    CreateLobbyPlayerText(childObject.GetField("players"));
                }

                break;
        }

    }

    /// <summary>
    /// Lists all the lobbies on the lobby list panel when they are received from teh server.
    /// </summary>
    /// <param name="json">json information about the lobbies</param>
    private void CreateLobbyList(JSONObject json)
    {
        List<string> hostNames = json.keys;
        // then add all the servers to the list
        Transform contentTransform = serverList.transform.Find("Content");
        foreach (string name in hostNames)
        {
            GameObject button = Instantiate(serverButtonlPrefab);
            button.transform.SetParent(contentTransform);
            button.GetComponentInChildren<Text>().text = name;
        }
    }

    /// <summary>
    /// Creates player name text for the currently entered lobby
    /// </summary>
    /// <param name="playersObject">Json information about all lobbies</param>
    private void CreateLobbyPlayerText(JSONObject playersObject)
    {
        List<JSONObject> nameList = playersObject.list;
        Transform contentTransform = playerList.transform.Find("Content");
        foreach (JSONObject json in nameList)
        {
            GameObject text = Instantiate(playerTextPrefab);
            text.transform.SetParent(contentTransform);
            if (json.str.Length == 0)
            {
                Debug.LogError("Invalid player name");
            }
            text.GetComponent<Text>().text = json.str;
        }
    }

    /// <summary>
    /// TODO: called when the player wants to leave a lobby
    /// </summary>
    public void LeaveLobby()
    {
        Debug.Log("WARNNIG - SERVER DOES NOT KNOW PLAYER LEFT LOBBY");
        ClearPlayerTextInLobby();
        lobbyHostName = null;
        isHost = false;
    }

    /// <summary>
    /// Sets the name of the player and stores it in a file.
    /// TODO: should later read to check if username exists in player prefs.
    /// </summary>
    public void EnterName()
    {
        //Debug.Log("Name Entered");

        inputField.GetComponent<InputField>().interactable = false;
        string playerName = inputField.transform.Find("Text").GetComponent<Text>().text;
        PlayerPrefs.SetString("username", playerName);
        MessageBus.Instance.Broadcast("player_name_set", playerName);
    }

    /// <summary>
    /// Callen when the lobby list should be refreshed.
    /// </summary>
    public void RefreshList()
    {
        // First remove all children that have been added
        ClearLobbyItems();

        // add items to list
        MessageBus.Instance.Broadcast("refresh");
    }

    /// <summary>
    /// Aparently this is an unused button
    /// </summary>
    public void JoinGame()
    {
        Debug.Log("unused button");
    }

    /// <summary>
    /// Called when the local player wants to host a game.
    /// </summary>
    public void CreateGame()
    {
        isHost = true;
        MessageBus.Instance.Broadcast("create_game");
    }

    public void StartGame()
    {
        MessageBus.Instance.Broadcast("start_game");
        MessageBus.Instance.Broadcast(MessageStrings.SWITCH_SCENE, 1);
    }

    /// <summary>
    /// Clears all the lobbies in the server list.
    /// </summary>
    private void ClearLobbyItems()
    {
        Button[] buttons = serverList.GetComponentsInChildren<Button>();
        foreach (Button butt in buttons)
        {
            Destroy(butt.gameObject);
        }
    }

    /// <summary>
    /// Clears all the players in the current lobby.
    /// </summary>
    private void ClearPlayerTextInLobby()
    {
        Text[] textItems = playerList.GetComponentsInChildren<Text>();
        foreach (Text butt in textItems)
        {
            Destroy(butt.gameObject);
        }
    }

    /// <summary>
    /// Refreshes server list and lobby information.
    /// </summary>
    private void Update()
    {
        serverRefreshCounter -= Time.deltaTime;
        //lobbyRefreshCounter -= Time.deltaTime;

        if (serverRefreshCounter <= 0)
        {
            // TODO: Create automatic refresh
            MessageBus.Instance.Broadcast("ping_lobbies");
            serverRefreshCounter = SERVER_REFRESH_INTERVAL;
        }
    }
}
