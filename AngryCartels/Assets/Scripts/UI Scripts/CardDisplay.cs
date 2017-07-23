using UnityEngine;
using System.Collections;
using System;
using System.Collections.Generic;

/// <summary>
/// Displays all the cards of a group.
/// </summary>
public class CardDisplay : MonoBehaviour {

    /// <summary>
    /// The prefab of a game game obect when inspecting the 
    /// cards in a group.
    /// </summary>
    public GameObject cardPrefab;

    /// <summary>
    /// Displays all the cards (TODO: currently just strings) from a
    /// list of cards to be displayed on this panel. This script
    /// assumes that the panel already handles formatting.
    /// </summary>
    /// <param name="cards">The list of cards to be displayed</param>
    internal void DisplayCards(List<string> cards)
    {
        // Destroy all previous children
        foreach (Transform child in gameObject.transform)
        {
            Destroy(child.gameObject);
        }

        // Add the new cards to the display
        foreach (var item in cards)
        {
            GameObject instance = Instantiate(cardPrefab);
            instance.transform.SetParent(gameObject.transform);
        }
    }
}
