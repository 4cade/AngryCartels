using UnityEngine;
using System.Collections;
using UnityEngine.Assertions;

public class GameInfo : MonoBehaviour {

    private static GameInfo instance;
    public static GameInfo Instance
    {
        get
        {
            if (instance == null)
            {
                Debug.LogError("GAME INSTANCE IS NULL YOU TWAT");
            }
            return instance;
        }
    }

    // Number of players in the game
    [Range(2, 8)]
    public int numPlayers;

    // Player Objects
    private PlayerScript[] players;

    //TODO:
    public GameObject playerPrefab;

    // TODO: Going to store action prefab here for now
    public GameObject actionItemPrefab;

    // Used to check if numRounds should be used
    public bool doesGameHaveRoundLimit;

    // The number of rounds for this particular game
    public int maxRounds;

    // handles location data of the game
    public GameObject mapManager;

    // Action Types
    public string[] actionNames;

	// Use this for initialization
	void Start () {
        
        instance = this;

	    if (doesGameHaveRoundLimit)
        {
            GameObject.Find("RoundPanel").GetComponent<RoundCounter>().setMaxRoundsText(maxRounds);
        }

        // TEMP: add number of players
        GameObject playerContainer = transform.Find("Players").gameObject;
        players = new PlayerScript[numPlayers];
        for (int i = 0; i < numPlayers; ++i)
        {
            GameObject player = Instantiate(playerPrefab);
            player.transform.parent = playerContainer.transform;
            players[i] = player.GetComponent<PlayerScript>();
        }

        GameObject.Find("PlayerPanel").GetComponent<PlayerCardCreator>().createPlayerCards(numPlayers, playerContainer);


        // TEMP
        MessageBus.Instance.Broadcast(new Message("showActionPanel", actionItemPrefab, 5));

    }

    private bool tempClick = true;
    // Update is called once per frame
    void Update () {
	    // TODO: WE CAN DO THE NETWORK CALLS IN HERE FOR NOW
        // ITS PROBABLY NOT THE BEST PLACE BUT WE CAN MAKE A 
        // SEPPORATE NETWORK MANAGER ONCE MORE OBJECTS ARE ADDED
        if (Input.GetMouseButton(0) && tempClick)
        {
            int numItems = 5;
            //GameObject[] actionItems = new GameObject[numItems];
            //for (int i = 0; i < actionItems.Length; ++i)
            //{
            //    actionItems[i] = Instantiate(actionItemPrefab);
            //}
            //MessageBus.Instance.Broadcast(new Message("showActionPanel", actionItems));
            //MessageBus.Instance.Broadcast(new Message("showActionPanel", actionItemPrefab, numItems));
            tempClick = false;
        }
        if (!Input.GetMouseButton(0))
        {
            if (!tempClick)
            {
                //MessageBus.Instance.Broadcast(new Message("closeActionPanel"));
                tempClick = true;
            }
        }
	}

    public string GetActionName(int index)
    {
        return actionNames[index];
    }
}
