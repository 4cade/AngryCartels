using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Astract class that controls what should be displayed
/// on the canvas. Ideally there should be one inherited SceneGui per scene.
/// </summary>
public abstract class SceneGui {

    /// <summary>
    /// Updates the this canvas gui based on new game state information.
    /// </summary>
    /// <param name="gs"></param>
    public abstract void GameStateUpdate(GameState gs);

    /// <summary>
    /// Method executes when this scene is exitting. Override this method 
    /// if you want some fancy effect for your SceneGui to transition out of.
    /// </summary>
    public virtual void OnSceneExit() { }
    
    /// <summary>
    /// Method executes when this scene is being entered. Override this method 
    /// if you want some fancy effect for your SceneGui to transition into.
    /// </summary>
    public virtual void OnSceneEnter() { }
}
