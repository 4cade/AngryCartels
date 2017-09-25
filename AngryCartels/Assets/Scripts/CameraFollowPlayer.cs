using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFollowPlayer : MonoBehaviour {

    // The player the camera is currently following
    public GameObject Player;

    public float DistanceFromPlayer = 100;
    public float PitchOffsetAngle = 0.0f;
    public float LookOffset = 0.0f;

	
	// Update is called once per frame
	void LateUpdate () {
        if (Player != null)
        {
            Vector3 movementDir = Player.GetComponent<MoveToTile>().MovementDirection;
            Debug.Log(movementDir);
            transform.position = Player.transform.position + (DistanceFromPlayer * Player.transform.position.normalized);
            transform.RotateAround(Player.transform.position, movementDir, PitchOffsetAngle);
            transform.LookAt(Player.transform.position + (movementDir * LookOffset));
        }
	}
}
