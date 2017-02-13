using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

enum GameStateTimeType
{
    CURRENT,
    STALE
}

public class GameParser : MonoBehaviour {

    private JSONObject gameState;

	void Awake () {
        gameState = null;
        MessageBus.Instance.Register("game_data_received", OnGameDataReceived);		
	}

    private void OnGameDataReceived(Message obj)
    {
        gameState = obj.GetData<JSONObject>();
    }
}
