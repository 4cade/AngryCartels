using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TitleListenerComponent : MonoBehaviour {

    public GameObject inputField;
    public GameObject lobbyList;
    public GameObject playerList;

	// Use this for initialization
	void Start ()
    {
		
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
}
