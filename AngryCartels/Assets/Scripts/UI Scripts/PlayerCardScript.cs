using UnityEngine;
using System.Collections;
using UnityEngine.UI;


public class PlayerCardScript : MonoBehaviour {

    private PlayerScript player = null;
    public PlayerScript Player
    {
        get { return player; }
        set
        {
            if (player == null)
            {
                nameText.text = player.PlayerName;
                SetMoneyText(player.PlayerMoney);
                placeText.text = player.PlayerPlace.ToString();
            }
        }
    }


    GameObject cardGroupPanel;

    Text nameText;
    Text moneyText;
    Text placeText;

	// Use this for initialization
	void Start () {
        cardGroupPanel = GameObject.Find("Canvas").transform.Find("CardDisplayPanel").gameObject;

        nameText = transform.Find("PlayerName").GetComponent<Text>();
        moneyText = transform.Find("MoneyText").GetComponent<Text>();
        placeText = transform.Find("PlaceText").GetComponent<Text>();
    }
	
    void Update()
    {
        // Could continuously update money and place here but it only
        // should happen when an event in thrown.
    }

	public void CardSelected()
    {
        //Debug.Log("TODO: card selected~");
        cardGroupPanel.GetComponent<CardGroupDisplay>().Reset();
        cardGroupPanel.GetComponent<CardGroupDisplay>().DisplayCardGroup(player.gameObject);
    }

    private void SetMoneyText(float money)
    {
        moneyText.text = "$" + money.ToString("n1") + " M";
    }
}
