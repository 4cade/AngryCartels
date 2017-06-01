using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using System;

/// <summary>
/// Displays all the groups of cards.
/// </summary>
public class CardGroupDisplay : MonoBehaviour {

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
    public GameObject cardGroupPrefab;
    
	// Use this for initialization
	void Start () {
        //players = playerContainerGameObject.GetComponentsInChildren<PlayerScript>();
        //backButton = transform.GetComponentInChildren<Button>();
        backButton.onClick.AddListener(Reset);
	}

    /// <summary>
    /// Displays all the owned card groups owned by the given player.
    /// </summary>
    /// <param name="player">The desired player.</param>
    public void DisplayCardGroup(GameObject player)
    {
        // display the card panel if being displayed
        //cardPanel.SetActive(false);

        PlayerScript playerScript = player.GetComponent<PlayerScript>();
        Dictionary<int, List<string>> cards = playerScript.Cards;

        // Destroy all previous children
        foreach (Transform child in groupPanel.transform)
        {
            Destroy(child.gameObject);
        }

        // Add the new card groups
        foreach (var key in cards.Keys)
        {
            GameObject instance = Instantiate(cardGroupPrefab);
            instance.transform.SetParent(groupPanel.transform);
            List<string> test = cards[key];
            instance.GetComponent<CardGroupSelected>().cards = cards[key];
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
