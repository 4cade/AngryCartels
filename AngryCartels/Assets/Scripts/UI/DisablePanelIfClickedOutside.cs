using UnityEngine;
using System.Collections;
using UnityEngine.UI;

/// <summary>
/// Disables a panel if the mouse is clicked outside said panel.
/// </summary>
public class DisablePanelIfClickedOutside : MonoBehaviour {

    /// <summary>
    ///  The panel that should be hidden when clicked outside of
    /// </summary>
    public GameObject panelToHide;

    /// <summary>
    /// Checks if we should hide the panel.
    /// </summary>
    void Update()
    {
        if (Input.GetMouseButton(0) && gameObject.activeSelf)
        {
            RectTransform rectTransform = panelToHide.GetComponent<RectTransform>();
            Canvas canvas = GetComponent<Canvas>();
            //Camera camera = canvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : Camera.main;
            // NOTE: Render mode is set to screen space overlay by default
            // therefore the camera should be null
            if (!RectTransformUtility.RectangleContainsScreenPoint(rectTransform, Input.mousePosition, null))
            {
                gameObject.SetActive(false);
            }
        }
    }
}
