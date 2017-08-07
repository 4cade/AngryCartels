using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// Controls the changing of ui and notifies the scene ui that an update to the game 
/// state has been made. This class will call DontDestroyOnLoad for the canvas object.
/// Any canvas objects that are created after attaching this component will be destroyed.
/// </summary>
public class GameCanvas : MonoBehaviour {

    // Current gui being display for the scene
    private SceneGui currentSceneGui;

    // the number of game canvases created
    static int restrictionCounter = 0;

    /// <summary>
    /// Updates the current scene gui based on a newly received gamestate.
    /// </summary>
    public void UpdateCanvasGameState(GameState newState)
    {
        currentSceneGui.GameStateUpdate(newState);
    }

    /// <summary>
    /// Called after object instantiation. Avoid initialization here. Instance will not be 
    /// destroyed until after Awake execution.
    /// </summary>
    private void Awake ()
    {
        // Test if this game canvas is a copy
        // We only want one in the scene
        if (restrictionCounter != 0)
        {
            Destroy(gameObject);
        }
        ++restrictionCounter;
    }

    /// <summary>
    /// Use this for initialization.
    /// </summary>
    private void Start()
    {
        // do not destroy the canvas
        DontDestroyOnLoad(gameObject);
        // Register scene switch so any game object can tell the canvas to switch scenes
        MessageBus.Instance.Register(MessageStrings.SWITCH_SCENE, OnSceneSwitch);
    }

    /// <summary>
    /// Gets called by the message bus when the SceneGui should change to a new instance.
    /// Typically would get called on scene switches.
    /// </summary>
    /// <param name="obj"></param>
    private void OnSceneSwitch(Message obj)
    {
        // TODO: Need to have a map of scene indicies to scene objects
        int sceneIndex = obj.GetData<int>();

        currentSceneGui.OnSceneExit();
        // Instantiate(NextScene)
        // currentSceneGui = NextSceneGui
        currentSceneGui.OnSceneEnter();
    }

}
