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
    private JSONObject playerJson = null;

	// Use this for initialization
	void Awake ()
    {
        MessageBus.Instance.Register("title_response_received", TitleResponseReceived);
        MessageBus.Instance.Register("joined_room", JoinRoom);
    }

    private void JoinRoom(Message obj)
    {
        lobbyHostName = obj.GetData<string>();
        Debug.Log("TODO WHYYYYY");
    }

    private void TitleResponseReceived(Message obj)
    {
        switch (obj.GetData<TitleResponseType>(0))
        {
            case TitleResponseType.LOBBY_UPDATE:
                ClearLobbyItems();
                JSONObject json = obj.GetData<JSONObject>(1);
                List<string> hostNames = json.keys;
                // then add all the servers to the list
                Transform contentTransform = serverList.transform.Find("Content");
                foreach (string name in hostNames)
                {
                    GameObject button = Instantiate(serverButtonlPrefab);
                    button.transform.SetParent(contentTransform);
                    button.GetComponentInChildren<Text>().text = name;
                }

                // add people in lobby if we have a host
                if (lobbyHostName != null)
                {
                    int index = json.keys.FindIndex(x => x == lobbyHostName);
                    JSONObject childObject = json.list[index];
                    Debug.Log(childObject.ToString());
                }

                break;
        }

    }

    public void LeaveLobby()
    {
        ClearPlayerTextInLobby();
        lobbyHostName = null;
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
        Debug.Log("Refresh List");
        // First remove all children that have been added
        ClearLobbyItems();
        
        // add items to list
        MessageBus.Instance.Broadcast("refresh");
    }

    public void JoinGame()
    {
        Debug.Log("TODO: Join Game");
    }

    public void CreateGame()
    {
        MessageBus.Instance.Broadcast("create_game");
    }

    public void StartGame()
    {
        Debug.Log("TODO: Start Game");
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
        Text[] textItems = serverList.GetComponentsInChildren<Text>();
        foreach (Text butt in textItems)
        {
            Destroy(butt.gameObject);
        }
    }
}
