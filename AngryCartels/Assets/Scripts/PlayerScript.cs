using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class PlayerScript : MonoBehaviour {

    // TEMP: player counter
    static int counter = 0;

    // player's in game name
    private string playerName = "";
    public string PlayerName
    {
        get { return playerName; }
        set
        {
            if (playerName == "")
            {
                playerName = value;
            }
        }
    }

    // players money
    private float playerMoney;
    public float PlayerMoney
    {
        get { return playerMoney; }
        set { playerMoney = value; }
    }

    // player place
    private uint playerPlace;
    public uint PlayerPlace
    {
        get { return playerPlace; }
        set { playerPlace = value; }
    }

    // player Id
    private int playerId = -1;
    public int PlayerId
    {
        get { return playerId; }
        set
        {
            if (playerId == -1)
            {
                playerId = value;
            }
        }
    }



    // Dictionary of properties held by the player - Temporary, would be stored in the db
    public Dictionary<int, List<string>> cards;

	// Use this for initialization
	void Start () {

        playerName = "PoorSoul_" + counter++;
        playerMoney = 0.0f;
        playerPlace = 1;

        cards = new Dictionary<int, List<string>>();

        // create the possible cards
        for (int i = 0, size = 14; i < size; ++i)
        {
            cards.Add(i, new List<string>());
        }
    }
	
	// Update is called once per frame
	void Update () {
	    
	}
}
