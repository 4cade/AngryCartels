using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// Note to myself, GUIs should not perform any game actions or requests, they
// should only take input and pass any parameters off to the active scene manager
public class GameBoardGui : SceneGui
{
    // Panels
    public GameObject TimeTurnPanel;
    public GameObject PlayerPanel;
    public GameObject ActionPanel;
    public GameObject PropertyPanel;

    // Prefabs
    public GameObject playerBadgeRowPrefab;
    public GameObject playerBadgePrefab;

    // Panel Scripts
    ActionPanel actionPanelScript;
    
    private const int MAX_PLAYERS_PER_ROW = 4;

    private GameState gameState;

    public override void GameStateUpdate()
    {
        throw new NotImplementedException();
    }

    private void Awake()
    {
        gameState = GameState.Instance;
    }

    private void Start()
    {
        actionPanelScript = ActionPanel.GetComponent<ActionPanel>();
    }

    public override void OnGuiExit()
    {
        
    }

    public override void OnGuiEnter()
    {
        Logger.d("GameBoardGui", "TODO: Set up game gui here");
        //CreatePlayerBadges();
    }

    public void DisplayPlayerActions(int playerIndex)
    {
        List<string> actionStrings = gameState.GetPlayerActions(playerIndex);
        Logger.d("GameBoardGui", "Player Actions for {0} {1}", playerIndex, actionStrings.Count);
        actionPanelScript.OpenActionPanel(actionStrings.ToArray());
    }

    private void CreatePlayerBadges()
    {
        int numPlayers = 0;// GameInfo.Instance.NumPlayers;

        Debug.Log("Creating " + numPlayers + " player badges");

        int playerScriptCounter = 0;

        if (enabled) // for debugging
        {
            // always create the first row
            GameObject row1 = Instantiate(playerBadgeRowPrefab);
            row1.transform.SetParent(PlayerPanel.transform, false);

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
                GameObject instance = Instantiate(playerBadgePrefab);
                instance.transform.SetParent(row1.transform);
                //instance.GetComponent<PlayerBadgeInfo>().Player = GameInfo.Instance.GetPlayerGameObject(playerScriptCounter++);
            }

            // check if we need a second row
            if (numPlayers > MAX_PLAYERS_PER_ROW)
            {
                GameObject row2 = Instantiate(playerBadgeRowPrefab);
                row2.transform.SetParent(PlayerPanel.transform, false);

                // Create the bottom row of player cards
                for (int i = 0, k = numPlayers - numPlayersTopRow; i < k; ++i)
                {
                    GameObject instance = Instantiate(playerBadgePrefab);
                    instance.transform.SetParent(row2.transform);
                    //instance.GetComponent<PlayerBadgeInfo>().Player = GameInfo.Instance.GetPlayerGameObject(playerScriptCounter++);
                }
            }
        }
    }
}
