using UnityEngine;
using System.Collections.Generic;
using System;

/// <summary>
/// The MoveToTile class allows for game objects to travel to different tiles.
/// This component also provides a lerp parameter to move the object smoothly 
/// from one tile to another.
/// </summary>
public class MoveToTile : MonoBehaviour {

    // The ID of the player this component is attached to.
    public int playerID = 0;

    // Used to check if the attached game object should move forward or backward.
    public bool isForwardDirection = true;

    // The goal index of movement.
    public int goalIndex = 1;

    // The starting index of movement.
    public int startIndex = 0;

    // The percentage [0,1] of startIndex to GoalIndex.
    [Range(0, 1)]
    public float lerp;

    // TEMP - cheap way to check if value changed
    private int prevGoal;
    private int prevStart;
    private bool prevDir;

    Vector3 startPoint;
    Vector3 nextPoint;
    public Vector3 MovementDirection;

    // The path to travel
    private List<Vector3> path;

    // The space between each tile.
    private float lerpSpacer;

    // Use this for initialization
    void Start () {
        prevGoal = -1;
        prevStart = -1;
        prevDir = !isForwardDirection;
        path = null;
        lerp = 0;
        lerpSpacer = 1;

        //GameObject mapManager = GameObject.Find("MapManager");
        //TileHandler th = mapManager.GetComponent<TileHandler>();
        //startPoint = th.tiles[0].location;
        //nextPoint = th.tiles[1].location;
        //MovementDirection = (nextPoint - startPoint).normalized;

        MessageBus.Instance.Register("pathCreated", MovementPathCreated);
	}

    /// <summary>
    /// This function gets called when a path has been created after searching.
    /// </summary>
    /// <param name="obj">The linked list of the movement path</param>
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

            startPoint = path[Math.Min(lerpStart, path.Count - 1)];
            nextPoint = path[Math.Min(lerpStart + 1, path.Count - 1)];
            MovementDirection = (nextPoint - startPoint).normalized;

            Vector3 lerpVector = Vector3.Lerp(startPoint, nextPoint, percentage);

            gameObject.transform.position = lerpVector;
        }
	}

}
