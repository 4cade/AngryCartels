using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;

/// <summary>
/// Enum of actions
/// </summary>
public enum ActionType
{
    BUILD,
    MORTGAGE,
    UNMORTGAGE,
    TRADE,
    USE_SPECIAL,
    ROLL,
    MRMONOPOLY,
    JAIL,
    TELEPORT,
    BUS,
    BUY,
    RENT,
    TAXI,
    UP_AUCTION,
    SET_AUCTION_PRICE,
    ROLL3,
    SQUEEZE,
    DRAW_MISFORTUNE,
    DRAW_FORTUNE
}


/// <summary>
/// A shitty name for a script that should react when a player
/// selects an action item on the action panel.
/// </summary>
public class PlayerActionSelected : MonoBehaviour
{

    private ActionType type;
    private Text actionText = null;

    /// <summary>
    /// Gets called when the player selects this action item gameobject
    /// </summary>
    public void ActionSelected()
    {
        Debug.Log("Action Type: " + actionText.text);
    }

    /// <summary>
    /// Sets the type of action and text for this action item.
    /// </summary>
    /// <param name="newType">The numeric value of the action</param>
    /// <param name="actionNameIndex">This is shitty design, but this paramter is the action string based on the index in the game info class.</param>
    public void SetActionType(ActionType newType, int actionNameIndex)
    {
        actionText = GetComponent<Text>();
        type = newType;
        actionText.text = GameInfo.Instance.GetActionName(actionNameIndex);
    }

}
