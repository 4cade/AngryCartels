using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gets called when a user selects a server / lobby
/// </summary>
public class ServerNameSelectedComponent : MonoBehaviour
{

    private Text nameText;

    private void Start()
    {
        nameText = GetComponentInChildren<Text>();
    }

    public void Selected()
    {
        MessageBus.Instance.Broadcast("join_lobby", nameText.text);
    }
}