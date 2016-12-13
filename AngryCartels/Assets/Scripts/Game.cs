using UnityEngine;
using System.Collections;

public class Game : MonoBehaviour {

    // Number of players in the game
    [Range(2, 8)]
    public int numPlayers;

    // Used to check if numRounds should be used
    public bool doesGameHaveRoundLimit;

    // The number of rounds for this particular game
    public int maxRounds;

	// Use this for initialization
	void Start () {
	    if (doesGameHaveRoundLimit)
        {
            GameObject.Find("RoundPanel").GetComponent<RoundCounter>().setMaxRoundsText(maxRounds);
        }

        GameObject.Find("PlayerPanel").GetComponent<PlayerCardCreator>().createPlayerCards(numPlayers);
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
