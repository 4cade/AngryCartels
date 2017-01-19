using UnityEngine;
using System.Collections;
using System;
using System.Collections.Generic;

public class CardDisplay : MonoBehaviour {

    public GameObject cardPrefab;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

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
