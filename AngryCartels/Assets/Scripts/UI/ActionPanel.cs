using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Displays the available actions for a player on the action ui panel.
/// </summary>
public class ActionPanel : MonoBehaviour
{
    // The prefab object for each selectable ui action
    public GameObject PlayerActionItemPrefab;

    // holds the action items
    public GameObject ContentPanel;

    public void TestOpenPanel()
    {
        MessageBus.Instance.Broadcast("instantiate_players", 1);
        (GameCanvas.currentSceneGui as GameBoardGui).OnGuiExit();
        Camera.main.GetComponent<CameraFollowPlayer>().target = GameInfo.Instance.GetPlayerGameObject(0);
    }

    /// <summary>
    /// Called when the showActionPanel message is thrown. Will enable the
    /// action panel so a player can select an action.
    /// </summary>
    /// <param name="actions">The options of actions the player can perform on their turn</param>
    public void OpenActionPanel(string[] actions)
    {
        Debug.Log("Displaying Actions for Player");

        // sort array before displaying it
        Array.Sort(actions);

        gameObject.SetActive(true);

        foreach (string actionText in actions)
        {
            GameObject item = Instantiate(PlayerActionItemPrefab);
            PlayerActionItem playerAction = item.GetComponent<PlayerActionItem>();
            playerAction.InitControls();
            playerAction.ActionText.text = actionText;
            item.transform.SetParent(ContentPanel.transform);
        }

    }

    /// <summary>
    /// Called when the action panel should be closed
    /// </summary>
    public void CloseActionPanel()
    {
        Debug.Log("Hiding Actions for player");
        
        // remove all children
        RectTransform rt = ContentPanel.GetComponent<RectTransform>();
        foreach (RectTransform childT in rt)
        {
            Destroy(childT.gameObject);
        }
        gameObject.SetActive(false);
    }
}
