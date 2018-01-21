using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// TODO: Alot of this information should be moved to a 'team'
// oe 'info' class so it can be shared amongst playesr

/// <summary>
/// The player script hold information relating to that player.
/// TODO: Should the play be able to call player actions in here?
/// For example, auction, buy, sell etc...
/// </summary>
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

    // player place - 1rst, 2nd, 3rd...
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

    // is the player playing on the local machine?
    private bool isLocal = false;
    public bool IsLocal
    {
        get { return isLocal; }
        set { isLocal = value; }
    }


    // The player's property cards.
    public Dictionary<int, List<string>> Cards;

    // The player's bus passes.
    public Dictionary<string, int> BusPasses;

    // The player's special cards.
    public Dictionary<string, int> SpecialCards;

    /// <summary>
    /// Use this for initialization. Note: not all game objects may exist
    /// yet.
    /// </summary>
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
}
