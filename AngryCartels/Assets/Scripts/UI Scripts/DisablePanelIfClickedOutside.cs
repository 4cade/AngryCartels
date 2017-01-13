using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class DisablePanelIfClickedOutside : MonoBehaviour {

    public GameObject panelToHide;

    // Update is called once per frame
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
