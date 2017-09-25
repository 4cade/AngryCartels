using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;


/// <summary>
/// Reacts when a player selects an action item on the action panel.
/// </summary>
public class PlayerActionItem : MonoBehaviour
{
    public Text ActionText = null;


    /// <summary>
    /// Gets called when the player selects this action item gameobject
    /// </summary>
    public void ActionSelected()
    {
        switch (ActionText.text)
        {
            case GameSocketMessages.BUY_HOUSE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.SELL_HOUSE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.UPDATE_HOUSES:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.MORTGAGE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.TRADE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.USE_SPECIAL_CARD:
                Debug.Log("NOTE: " + GameSocketMessages.SPECIAL_CARD + " might not be the right string sent to the server");
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.ROLL:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.MRMONOPOLY:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.JAIL:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.TELEPORT:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.BUS:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.BUY_PROPERTY:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.RENT:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.TAXI:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.UP_AUCTION:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.SET_AUCTION_PRICE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.ROLL3:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.SQUEEZE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.DRAW_MISFORTUNE:
                Debug.Log("TODO: Action not implemented");
                break;
            case GameSocketMessages.DRAW_FORTUNE:
                Debug.Log("TODO: Action not implemented");
                break;
            default:
                Debug.Log("Action not supported");
                break;
        }

    }

    public void InitControls()
    {
        ActionText = GetComponent<Text>();
    }
}
