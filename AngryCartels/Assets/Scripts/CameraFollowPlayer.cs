using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// This will only objects that have a MoveToTileComponent
/// </summary>
public class CameraFollowPlayer : MonoBehaviour {

    // The player the camera is currently following
    public GameObject target;

    public float DistanceFromPlayer = 100;
    public float PitchOffsetAngle = 0.0f;
    public float LookOffset = 0.0f;

	
	// Update is called once per frame
	void LateUpdate () {
        if (target != null)
        {
            Vector3 movementDir = target.GetComponent<MoveToTile>().MovementDirection;
            Debug.Log(movementDir);
            transform.position = target.transform.position + (DistanceFromPlayer * target.transform.position.normalized);
            transform.RotateAround(target.transform.position, movementDir, PitchOffsetAngle);
            transform.LookAt(target.transform.position + (movementDir * LookOffset));
        }
	}
}
