using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;


public class CardGroupSelected : MonoBehaviour {

    private GameObject cardPanel;

    public List<string> cards;

    void Start()
    {
        // Get the Card Panel From the ALPHA PARENT
        cardPanel = transform.parent.parent.Find("CardPanel").gameObject;

        Button button = GetComponent<Button>();
        button.onClick.AddListener(GroupSelected);
    }

    void GroupSelected()
    {
        Debug.Log("Card Group Selected");

        // set the card panel to active
        cardPanel.SetActive(true);

        cardPanel.GetComponent<CardDisplay>().DisplayCards(cards);

        // set the parent panel to non-active
        transform.parent.gameObject.SetActive(false);
    }
}
