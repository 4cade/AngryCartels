using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class RoundCounter : MonoBehaviour {

    // The text ui element to display the round count
    public Text roundText;

    // Counts the number of rounds passed in the game
    int currentRound = 0;

    // The number of maximum rounds to be displayed
    int maxRounds = 1;

    // Checks if the maximum rounds should not be displayed
    bool displayMaxRounds = false;

	// Update is called once per frame
	void Update () {
        switch (displayMaxRounds)
        {
            case false:
                roundText.text = currentRound.ToString();
                break;
            case true:
                roundText.text = currentRound + " / " + maxRounds;
                break;
        }
	}

    // Sets the maximum number of rounds to be displayed for this game
    public void setMaxRoundsText(int maxRounds)
    {
        this.maxRounds = maxRounds;
        displayMaxRounds = true;
    }
}
