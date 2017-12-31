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
    //public SceneGuiEntry[] sceneGuis;

    // Current gui being display for the scene
    public static SceneGui currentSceneGui = null;

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

        // We should always have a gui attached when the game starts
        if (currentSceneGui == null)
        {
            //currentSceneGui = transform.GetChild(0).GetComponent<SceneGui>();
        }

        // Register scene switch so any game object can tell the canvas to switch scenes
        //MessageBus.Instance.Register(MessageStrings.SWITCH_SCENE, SwitchSceneGui);
    }


    public void SwitchSceneGui(GameObject guiPrefab)
    {
        // destroy and replace
        // transition out of the scene
        if (currentSceneGui != null)
        {
            currentSceneGui.OnGuiExit();
            Destroy(currentSceneGui.gameObject);
        }

        GameObject guiObj = Instantiate(guiPrefab);
        currentSceneGui = guiObj.GetComponent<SceneGui>();

        // Add all the controls that have been created in the editor to the SceneGui for reference
        int childCount = currentSceneGui.transform.childCount;
        for (int i = 0; i < childCount; ++i)
        {
            currentSceneGui.controls.Add(currentSceneGui.transform.GetChild(i).gameObject);
        }

        // make canvas parent
        //currentSceneGui.transform.parent = transform;
        currentSceneGui.transform.SetParent(transform, false);

        // transition into the scene
        currentSceneGui.OnGuiEnter();
    }

}
