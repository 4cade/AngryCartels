using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using System;

/// <summary>
/// Displays all the groups of cards.
/// </summary>
public class PropertyPanel : MonoBehaviour {

    /// <summary>
    /// The panel that exists in the canvas that displays all card groups
    /// </summary>
    public GameObject groupPanel;

    /// <summary>
    /// The panel that exists in the canvas that displays all the cards of a group.
    /// </summary>
    public GameObject cardPanel;

    /// <summary>
    /// TEMP: used to leave the card display panel
    /// </summary>
    public Button backButton;

    /// <summary>
    /// The prefab game object used to represent a group of cards.
    /// </summary>
    public GameObject propertyGroupPrefab;

    /// <summary>
    /// The prefab of a game game obect when inspecting the 
    /// cards in a group.
    /// </summary>
    public GameObject propertyCardPrefab;

    /// <summary>
    /// The Player we are currently inspecting
    /// </summary>
    public PlayerScript selectedPlayer;
    
    /// <summary>
    /// Displays all the owned card groups owned by the given player.
    /// </summary>
    /// <param name="player">The desired player.</param>
    public void DisplayPropertyGroups(GameObject player)
    {
        selectedPlayer = player.GetComponent<PlayerScript>();
        Dictionary<int, List<string>> cards = selectedPlayer.Cards;

        // Destroy all previous children
        foreach (Transform child in groupPanel.transform)
        {
            Destroy(child.gameObject);
        }

        // Add the new card groups
        foreach (KeyValuePair<int, List<string>> group in cards)
        {
            if (group.Value.Count > 0)
            {
                GameObject instance = Instantiate(propertyGroupPrefab);
                instance.GetComponent<PropertyGroup>().propertyPanel = this;
                instance.GetComponent<PropertyGroup>().propertyGroup = group;
                instance.transform.SetParent(groupPanel.transform);
            }
        }
    }

    /// <summary>
    /// TODO: resets the displayed cards.
    /// </summary>
    public void Reset()
    {
        gameObject.SetActive(true);
        groupPanel.SetActive(true);
        cardPanel.SetActive(false);
        backButton.gameObject.SetActive(false);
    }

}
