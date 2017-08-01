using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Displays the available actions for a player on the action ui panel.
/// </summary>
public class DisplayActionsOnPanel : MonoBehaviour {

    // The transform of the content game object on the action panel.
    private Transform contentPanelTransform;

	// Use this for initialization
	void Start () {
        contentPanelTransform = transform.Find("Content");

        MessageBus.Instance.Register("showActionPanel", openActionPanel);
        MessageBus.Instance.Register("closeActionPanel", CloseActionPanel);

        // The object must begin as active for the register message 
        // to take effect.
        gameObject.SetActive(false);
    }

    /// <summary>
    /// Called when the showActionPanel message is thrown. Will enable the
    /// action panel so a player can select an action.
    /// </summary>
    /// <param name="obj">An action item prefab to display on the action panel</param>
    private void openActionPanel(Message obj)
    {
        Debug.Log("TODO:YOU SHOULD SHOW THE ACTION PANEL");
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

    /// <summary>
    /// Called when the action panel should be closed
    /// </summary>
    /// <param name="obj">Null</param>
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
}
