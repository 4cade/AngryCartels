using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// Controls the changing of ui and notifies the scene ui that an update to the game state has been made
public class GameCanvas : MonoBehaviour {
	GameState state;

	SceneGui sceneUI;


	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
		sceneUI.Update();
	}

	void OnGameStateChange()
	{
		// other logic here about controlling which scenegui should be shown
		sceneUI.StateUpdate(state);
	}

	void SwitchSceneGui(SceneGui newScene)
	{
		sceneUI.Exit();
		sceneUI = newScene;
		Instantiate(sceneUI);
		newScene.Enter();
	}
}
