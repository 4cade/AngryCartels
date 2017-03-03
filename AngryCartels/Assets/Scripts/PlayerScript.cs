using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// TODO: Alot of this information should be moved to a 'team'
// info class so it can be shared amongst playesr

public class PlayerScript : MonoBehaviour {

    // player's in game name
    private string playerName = null;
    public string PlayerName
    {
        get { return playerName; }
        set
        {
            if (playerName == null)
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

    // Dictionary of properties held by the player - Temporary, this sh
    public Dictionary<int, List<string>> Cards;

    // bus passes
    public Dictionary<string, int> BusPasses;

    // special cards
    public Dictionary<string, int> SpecialCards;

    // Use this for initialization
    private void Awake()
    {
        playerMoney = 0.0f;
        playerPlace = 1;

        Cards = new Dictionary<int, List<string>>();
        BusPasses = new Dictionary<string, int>();
        SpecialCards = new Dictionary<string, int>();

        // create the possible cards
        for (int i = 0, size = 14; i < size; ++i)
        {
            Cards.Add(i, new List<string>());
        }
    }

    // Use this to run before first update cycle
	void Start () {
        
    }
	
	// Update is called once per frame
	void Update () {
	    
	}
}
