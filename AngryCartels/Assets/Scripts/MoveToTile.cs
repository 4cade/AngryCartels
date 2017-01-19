using UnityEngine;
using System.Collections;
using System;

public class MoveToTile : MonoBehaviour {

    public bool isForwardDirection = true;

    public int goalIndex = 0;
    public int startIndex = 0;

    [Range(0, 1)]
    public int lerp;

    // TEMP - cheap way to check if value changed
    private int prevGoal;
    private int prevStart;
    private bool prevDir;

	// Use this for initialization
	void Start () {
        prevGoal = -1;
        prevStart = -1;
        prevDir = !isForwardDirection;
	}

    // Update is called once per frame
    void Update () {
	    if (prevStart != startIndex || prevGoal != goalIndex || prevDir != isForwardDirection)
        {
            prevGoal = goalIndex;
            prevStart = startIndex;
            prevDir = isForwardDirection;
            Message message = new Message("goalChange", this);
            MessageBus.Instance.Broadcast(message);
        }
	}
}
