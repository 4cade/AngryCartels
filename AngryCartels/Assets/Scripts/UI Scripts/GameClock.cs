using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System;

public class GameClock : MonoBehaviour {
         
    // Text UI object to display the time to
    public Text timeText;
	
	// Update is called once per frame
	void Update () {
        int seconds = (int)Time.time % 60;
        int minutes = (int)Time.time / 60;

        timeText.text = minutes.ToString("00") + ":" + seconds.ToString("00");
	}
}
