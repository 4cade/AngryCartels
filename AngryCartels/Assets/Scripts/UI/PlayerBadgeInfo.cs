using UnityEngine;
using System.Collections;
using UnityEngine.UI;

/// <summary>
/// Represents the player on the UI layer.
/// </summary>
public class PlayerBadgeInfo : MonoBehaviour {

    private GameObject player = null;
    public GameObject Player
    {
        get { return player; }
        set
        {
            // do not set player a second time
            if (player == null)
            {
                player = value;
                PlayerScript ps = value.GetComponent<PlayerScript>();
                nameText.text = ps.PlayerName;
                SetMoneyText(ps.PlayerMoney);
                placeText.text = ps.PlayerPlace.ToString();
            }
        }
    }

    // Reference to the card group panel
    private GameBoardGui sceneGui;

    // Default UI properties that are displayed about the player
    private Text nameText;
    private Text moneyText;
    private Text placeText;

	// Use this for initialization
	void Awake () {
        sceneGui = GameObject.Find("Canvas").GetComponent<GameCanvas>().currentSceneGui as GameBoardGui;

        nameText = transform.Find("PlayerName").GetComponent<Text>();
        moneyText = transform.Find("MoneyText").GetComponent<Text>();
        placeText = transform.Find("PlaceText").GetComponent<Text>();
    }

    /// <summary>
    /// Called when a player clicks on a player card.
    /// </summary>
	public void BadgeSelected()
    {
        PropertyPanel gd = sceneGui.PropertyPanel.GetComponent<PropertyPanel>();
        gd.Reset();
        gd.DisplayPropertyGroups(player);
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
