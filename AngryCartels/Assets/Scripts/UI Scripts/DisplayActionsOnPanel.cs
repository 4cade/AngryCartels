using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DisplayActionsOnPanel : MonoBehaviour {

    private Transform contentPanelTransform;

	// Use this for initialization
	void Start () {
        contentPanelTransform = transform.FindChild("Content");

        MessageBus.Instance.Register("showActionPanel", openActionPanel);
        MessageBus.Instance.Register("closeActionPanel", CloseActionPanel);

        // The object must begin as active for the register message 
        // to take effect.
        gameObject.SetActive(false);
    }

    private void openActionPanel(Message obj)
    {
        Debug.Log("TODO: YOU SHOULD SHOW THE ACTION PANEL");
        GameObject[] actionItems = obj.GetData<GameObject[]>();

        for (int i = 0; i < actionItems.Length; ++i)
        {
            actionItems[i].GetComponent<PlayerActionSelected>().SetActionType(ActionType.ROLL, 5);
            actionItems[i].transform.SetParent(contentPanelTransform);
        }

        gameObject.SetActive(true);
    }

    private void CloseActionPanel(Message obj)
    {
        Debug.Log("TODO: YOU SHOULD CLOSE THE ACTION PANEL");
        gameObject.SetActive(false);
    }

    // Update is called once per frame
    void Update () {
		
	}
}
