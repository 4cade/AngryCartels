using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class PlayerScript : MonoBehaviour {

    Dictionary<int, List<string>> cards;

	// Use this for initialization
	void Start () {
        Debug.Log("Hardcoding 14 for card groups");
        cards = new Dictionary<int, List<string>>();

        // TEMP: Randomize the cards for each player
        for(int i = 0, size = Random.Range(0, 14); i < size; ++i)
        {
            int size2 = Random.Range(0, 3);
            cards.Add(i, new List<string>(size2));
        }
	}
	
	// Update is called once per frame
	void Update () {
	    
	}
}
