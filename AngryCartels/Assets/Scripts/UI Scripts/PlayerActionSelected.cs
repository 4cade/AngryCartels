using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;

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


public class PlayerActionSelected : MonoBehaviour
{

    private ActionType type;
    private Text actionText = null;


    public void ActionSelected()
    {
        Debug.Log("Action Type: " + actionText.text);
    }


    public void SetActionType(ActionType newType, int actionNameIndex)
    {
        actionText = GetComponent<Text>();
        type = newType;
        actionText.text = Game.Instance.GetActionName(actionNameIndex);
    }

}
