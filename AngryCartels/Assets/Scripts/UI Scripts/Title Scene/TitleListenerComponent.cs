using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

enum TitleResponseType
{
    LOBBY_UPDATE
}

public class TitleListenerComponent : MonoBehaviour {

    public GameObject inputField;
    public GameObject serverList;
    public GameObject serverButtonlPrefab;
    public GameObject playerList;
    public GameObject playerTextPrefab;

    private string lobbyHostName = null;
    private bool isHost = false;

	// Use this for initialization
	void Awake ()
    {
        MessageBus.Instance.Register("title_response_received", TitleResponseReceived);
        MessageBus.Instance.Register("joined_room", JoinRoom);
    }

    private void JoinRoom(Message obj)
    {
        lobbyHostName = obj.GetData<JSONObject>().list[0].str;
    }

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

    private void CreateLobbyPlayerText(JSONObject playersObject)
    {
        List<JSONObject> nameList = playersObject.list;
        Transform contentTransform = playerList.transform.Find("Content");
        foreach(JSONObject json in nameList)
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

    public void LeaveLobby()
    {
        Debug.Log("WARNNIG - SERVER DOES NOT KNOW PLAYER LEFT LOBBY");
        ClearPlayerTextInLobby();
        lobbyHostName = null;
        isHost = false;
    }

    public void EnterName()
    {
        //Debug.Log("Name Entered");

        inputField.GetComponent<InputField>().interactable = false;
        string playerName = inputField.transform.Find("Text").GetComponent<Text>().text;

        MessageBus.Instance.Broadcast("player_name_set", playerName);
    }

    public void RefreshList()
    {
        // First remove all children that have been added
        ClearLobbyItems();
        
        // add items to list
        MessageBus.Instance.Broadcast("refresh");
    }

    public void JoinGame()
    {
        Debug.Log("unused button");
    }

    public void CreateGame()
    {
        isHost = true;
        MessageBus.Instance.Broadcast("create_game");
    }

    public void StartGame()
    {
        Debug.Log("TODO: start game");
    }

    private void ClearLobbyItems()
    {
        Button[] buttons = serverList.GetComponentsInChildren<Button>();
        foreach (Button butt in buttons)
        {
            Destroy(butt.gameObject);
        }
    }

    private void ClearPlayerTextInLobby()
    {
        Text[] textItems = playerList.GetComponentsInChildren<Text>();
        foreach (Text butt in textItems)
        {
            Destroy(butt.gameObject);
        }
    }
}
