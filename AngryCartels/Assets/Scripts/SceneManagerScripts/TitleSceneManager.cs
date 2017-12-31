using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TitleSceneManager : GameSceneManager {

    public void LogIn(ref User user)
    {
        NetworkManager.Instance.CmdLogIn(user.Username);
    }

    public void RefreshGameLobbies()
    {
        // TODO:
        //MessageBus.Instance.Broadcast("ping_lobbies");
    }

    // Use this for initialization
    void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
