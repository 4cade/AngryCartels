using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;

/// <summary>
/// Handles selecting a group of cards
/// </summary>
public class CardGroupSelected : MonoBehaviour {

    /// <summary>
    /// The card panel to display the cards on.
    /// </summary>
    private GameObject cardPanel;

    /// <summary>
    /// TEMP: Used to return to the card group panel
    /// </summary>
    public GameObject backButton;

    /// <summary>
    ///  The cards of a card group, this should be set when the card group.
    ///  This should be set when the card group is created.
    /// </summary>
    public List<string> cards;

    /// <summary>
    /// Init that shit.
    /// </summary>
    void Start()
    {
        // Get the Card Panel From the ALPHA PARENT
        cardPanel = transform.parent.parent.Find("CardPanel").gameObject;

        Button button = GetComponent<Button>();
        button.onClick.AddListener(GroupSelected);

        // Get the backbutton because we bad at planning shit
        backButton = transform.parent.parent.Find("BackToGroupButton").gameObject;
    }

    /// <summary>
    /// Gets called when a group of cards is selected.
    /// </summary>
    void GroupSelected()
    {
        Debug.Log("Card Group Selected");

        // set the card panel to active
        cardPanel.SetActive(true);

        // set the back button to active
        backButton.SetActive(true);

        // Display the given cards.
        cardPanel.GetComponent<CardDisplay>().DisplayCards(cards);

        // set the parent panel to non-active
        transform.parent.gameObject.SetActive(false);
    }
}
