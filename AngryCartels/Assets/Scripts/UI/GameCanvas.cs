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

    // Used to spoof the inspector so SceneGuis can be configured like a dictionary.
    [System.Serializable]
    public class SceneGuiEntry
    {
        public int sceneIndex;
        public GameObject sceneGuiPrefab;
    }

    // List of gui items mapped to scene indicies in the unity editor.
    // Find scene indicies in build settings.
    public SceneGuiEntry[] sceneGuis;

    // Current gui being display for the scene
    public SceneGui currentSceneGui = null;

    // the number of game canvases created
    private static int restrictionCounter = 0;

    /// <summary>
    /// Updates the current scene gui based on a newly received gamestate.
    /// </summary>
    public void UpdateCanvasGameState(GameInfo newState)
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
        int sceneIndex = obj.GetData<int>();

        // transition out of the scene
        if (currentSceneGui != null)
        {
            currentSceneGui.OnSceneExit();
        }

        // Find the next scene to start up
        SceneGui nextScene = null;
        foreach (SceneGuiEntry entry in sceneGuis)
        {
            if (entry.sceneIndex == sceneIndex)
            {
                GameObject gameObj = Instantiate(entry.sceneGuiPrefab);
                nextScene = gameObj.GetComponent<SceneGui>();
                break;
            }
        }

        // destroy and replace
        Destroy(currentSceneGui.gameObject);
        currentSceneGui = nextScene;

        // Add all the controls that have been created in the editor to the SceneGui for reference
        int childCount = currentSceneGui.transform.childCount;
        for (int i = 0; i < childCount; ++i)
        {
            currentSceneGui.controls.Add(currentSceneGui.transform.GetChild(i).gameObject);
        }

        // transition into the scene
        currentSceneGui.OnSceneEnter();

        // make canvas parent
        currentSceneGui.transform.parent = transform;
    }

}
