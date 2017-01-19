using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;


public class CardGroupSelected : MonoBehaviour {

    private GameObject cardPanel;

    public GameObject backButton;

    public List<string> cards;

    void Start()
    {
        // Get the Card Panel From the ALPHA PARENT
        cardPanel = transform.parent.parent.Find("CardPanel").gameObject;

        Button button = GetComponent<Button>();
        button.onClick.AddListener(GroupSelected);

        // Get the backbutton because we bad at planning shit
        backButton = transform.parent.parent.Find("BackToGroupButton").gameObject;
    }

    void GroupSelected()
    {
        Debug.Log("Card Group Selected");

        // set the card panel to active
        cardPanel.SetActive(true);

        // set the back button to active
        backButton.SetActive(true);

        cardPanel.GetComponent<CardDisplay>().DisplayCards(cards);

        // set the parent panel to non-active
        transform.parent.gameObject.SetActive(false);
    }
}
