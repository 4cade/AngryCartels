using UnityEngine;
using System.Collections;
using UnityEngine.UI;

/// <summary>
/// Represents the player on the UI layer.
/// </summary>
public class PlayerCardScript : MonoBehaviour {

    private PlayerScript player = null;
    public PlayerScript Player
    {
        get { return player; }
        set
        {
            // do not set player a second time
            if (player == null)
            {
                nameText.text = value.PlayerName;
                SetMoneyText(value.PlayerMoney);
                placeText.text = value.PlayerPlace.ToString();
            }
        }
    }

    // Reference to the card group panel
    GameObject cardGroupPanel;

    // Default UI properties that are displayed about the player
    Text nameText;
    Text moneyText;
    Text placeText;

	// Use this for initialization
	void Awake () {
        nameText = transform.Find("PlayerName").GetComponent<Text>();
        moneyText = transform.Find("MoneyText").GetComponent<Text>();
        placeText = transform.Find("PlaceText").GetComponent<Text>();
    }

    /// <summary>
    /// Called before the game is run, after object have been created
    /// </summary>
    private void Start()
    {
        cardGroupPanel = GameObject.Find("Canvas").transform.Find("CardDisplayPanel").gameObject;
    }

    /// <summary>
    /// Called when a player clicks on a player card.
    /// </summary>
	public void CardSelected()
    {
        //Debug.Log("TODO: card selected~");
        cardGroupPanel.GetComponent<CardGroupDisplay>().Reset();
        cardGroupPanel.GetComponent<CardGroupDisplay>().DisplayCardGroup(player.gameObject);
    }

    /// <summary>
    /// Sets the text of the money UI object.
    /// </summary>
    /// <param name="money">The money value the player has.</param>
    private void SetMoneyText(float money)
    {
        moneyText.text = "$" + money.ToString("n1") + " M";
    }
}
