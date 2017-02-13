using UnityEngine;
using System.Collections.Generic;
using System;

public class MoveToTile : MonoBehaviour {

    public int playerID = 0;

    public bool isForwardDirection = true;

    public int goalIndex = 0;
    public int startIndex = 0;

    [Range(0, 1)]
    public float lerp;

    // TEMP - cheap way to check if value changed
    private int prevGoal;
    private int prevStart;
    private bool prevDir;

    private List<Vector3> path;
    private float lerpSpacer;

    // Use this for initialization
    void Start () {
        prevGoal = -1;
        prevStart = -1;
        prevDir = !isForwardDirection;
        path = null;
        lerp = 0;
        lerpSpacer = 1;

        MessageBus.Instance.Register("pathCreated", MovementPathCreated);
	}

    private void MovementPathCreated(Message obj)
    {
        path = new List<Vector3>(obj.GetData<LinkedList<Vector3>>());
        lerpSpacer = 1.0f / path.Count;
        //gameObject.transform.position = path.Last.Value;
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

        // A path is found do your lerp nonsense
        if (path != null)
        {
            int lerpStart = (int) Math.Floor(lerp / lerpSpacer);
            float percentage = (lerp / lerpSpacer - lerpStart);
            Vector3 startPoint = path[Math.Min(lerpStart, path.Count - 1)];
            Vector3 nextPoint = path[Math.Min(lerpStart + 1, path.Count - 1)];

            Vector3 lerpVector = Vector3.Lerp(startPoint, nextPoint, percentage);

            gameObject.transform.position = lerpVector;
        }
	}
}
