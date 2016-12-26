using UnityEngine;
using System.Collections;
using UnityEngine.UI;


public class PlayerCardSelected : MonoBehaviour {

    GameObject cardGroupPanel;

	// Use this for initialization
	void Start () {
        cardGroupPanel = GameObject.Find("Canvas").transform.Find("CardDisplayPanel").gameObject;
    }
	
	public void CardSelected()
    {
        Debug.Log("TODO: card selected~");
        cardGroupPanel.SetActive(true);
    }
}
