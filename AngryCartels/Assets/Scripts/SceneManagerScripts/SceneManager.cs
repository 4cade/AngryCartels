using System.Collections;
using System.Collections.Generic;
using UnityEngine;

abstract public class GameSceneManager : MonoBehaviour {

    public virtual void OnSceneExit() { }
    public virtual void OnSceneEnter() { }
	
}
