using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// TODO: information about the game that isn't in json format
/// </summary>
public class GameState
{
    private static GameState instance;
    public static GameState Instance
    {
        get
        {
            if (instance == null)
            {
                Debug.LogError("GAME INSTANCE IS NULL YOU TWAT");
            }
            return instance;
        }
        set
        {
            if (instance == null)
            {
                instance = value;
            }
        }
    }

    public List<PlayerPair> playerList;

    public GameObject[] Players;

    public int NumPlayers
    {
        get
        {
            return Players.Length;
        }
    }



    public GameObject GetPlayerGameObject(int index)
    {
        return Players[index];
    }
}
