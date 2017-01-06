using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class PlayerScript : MonoBehaviour {

    // TEMP: player counter
    static int counter = 0;

    // player's in game name
    private string playerName;
    public string PlayerName
    {
        get { return playerName; }
        //set { playerName = value; }
    }

    // players money
    private float playerMoney;
    public float PlayerMoney
    {
        get { return playerMoney; }
        //set { playerMoney = value; }
    }


    // Dictionary of properties held by the player
    public Dictionary<int, List<string>> cards;

	// Use this for initialization
	void Start () {

        playerName = "PoorSoul_" + counter++;
        playerMoney = Random.Range(0, 100);


        Debug.Log("Hardcoding 14 for card groups");
        cards = new Dictionary<int, List<string>>();

        // TEMP: Randomize the cards for each player
        for(int i = 0, size = Random.Range(0, 14); i < size; ++i)
        {
            int size2 = Random.Range(0, 3);
            cards.Add(i, new List<string>(size2));
            for (int k = 0; k < size2; ++k)
            {
                cards[i].Add("asdf");
            }
            
        }
	}
	
	// Update is called once per frame
	void Update () {
	    
	}
}
