using UnityEngine;
using System.Collections;
using System;
using UnityEngine.UI;

public class PlayerCardCreator : MonoBehaviour {

    // Used to organize rows of player cards
    public GameObject playerCardRowPrefab;

    // Default card for each player
    public GameObject playerCardPrefab;

    // Max number of players in the game
    int numPlayers;

    const int MAX_PLAYERS_PER_ROW = 4;

	// Use this for initialization
	void Start () {
        
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    /// <summary>
    /// Creates Player UI Cards to display in this attached game object.
    /// This method should only be called once at the start of the game scene.
    /// </summary>
    /// <param name="numPlayers"></param>
    internal void createPlayerCards(int numPlayers, GameObject playersContainer)
    {
        PlayerScript[] players = playersContainer.GetComponentsInChildren<PlayerScript>();
        int playerCount = 0;

        if (enabled) // for debugging
        {
            this.numPlayers = numPlayers;

            // always create the first row
            GameObject row1 = Instantiate(playerCardRowPrefab);
            row1.transform.SetParent(transform, false);

            // Check how many players should be on the top row
            int numPlayersTopRow = Math.Min(MAX_PLAYERS_PER_ROW, numPlayers);

            // Create a cool jagged effect if there is 5
            if (numPlayers == 5)
            {
                numPlayersTopRow = MAX_PLAYERS_PER_ROW - 1;
            }

            // Create the top row of player cards
            for (int i = 0; i < numPlayersTopRow; ++i)
            {
                GameObject instance = Instantiate(playerCardPrefab);
                instance.transform.SetParent(row1.transform);
                instance.GetComponent<PlayerCardSelected>().player = players[playerCount++].gameObject;
                //instance.transform.parent = row1.transform;
                //instance.GetComponent<RectTransform>().SetParent(row1.transform);
            }

            // check if we need a second row
            if (numPlayers > MAX_PLAYERS_PER_ROW)
            {
                GameObject row2 = Instantiate(playerCardRowPrefab);
                row2.transform.SetParent(transform, false);

                // Create the bottom row of player cards
                for (int i = 0, k = numPlayers - numPlayersTopRow; i < k; ++i)
                {
                    GameObject instance = Instantiate(playerCardPrefab);
                    instance.transform.SetParent(row2.transform);
                    instance.GetComponent<PlayerCardSelected>().player = players[playerCount++].gameObject;
                }
            }
        }
    }
}
