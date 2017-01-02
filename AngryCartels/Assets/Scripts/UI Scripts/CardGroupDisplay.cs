using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class CardGroupDisplay : MonoBehaviour {

    public GameObject groupPanel;
    public GameObject cardPanel;

    public GameObject cardGroupPrefab;

    //public GameObject playerContainerGameObject;
    //private PlayerScript[] players;

	// Use this for initialization
	void Start () {
        //players = playerContainerGameObject.GetComponentsInChildren<PlayerScript>();
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    public void DisplayCardGroup(GameObject player)
    {
        // display the card panel if being displayed
        //cardPanel.SetActive(false);

        PlayerScript playerScript = player.GetComponent<PlayerScript>();
        Dictionary<int, List<string>> cards = playerScript.cards;

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
}
