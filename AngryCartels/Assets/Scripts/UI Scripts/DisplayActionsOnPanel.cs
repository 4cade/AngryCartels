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
        Debug.Log("YOU SHOULD SHOW THE ACTION PANEL");
        GameObject actionItemPrefab = obj.GetData<GameObject>();
        int numItems = obj.GetData<int>(1);

        for (int i = 0; i < numItems; ++i)
        {
            GameObject item = Instantiate(actionItemPrefab);
            item.GetComponent<PlayerActionSelected>().SetActionType(ActionType.ROLL, 5);
            item.transform.SetParent(contentPanelTransform);
        }

        gameObject.SetActive(true);
    }

    private void CloseActionPanel(Message obj)
    {
        Debug.Log("YOU SHOULD CLOSE THE ACTION PANEL");
        // remove all children
        RectTransform rt = contentPanelTransform.GetComponent<RectTransform>();
        foreach(RectTransform childT in rt)
        {
            Destroy(childT.gameObject);
        }
        gameObject.SetActive(false);
    }

    // Update is called once per frame
    void Update () {
		
	}
}
