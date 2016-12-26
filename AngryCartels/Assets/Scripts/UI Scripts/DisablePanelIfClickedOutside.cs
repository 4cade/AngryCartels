using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class DisablePanelIfClickedOutside : MonoBehaviour {

    public GameObject panel;

    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButton(1) && gameObject.activeSelf)
        {
            Debug.Log("TODO: close when click outside of panel");
            //RectTransform rt = panel.GetComponent<RectTransform>();
            //bool value = RectTransformUtility.RectangleContainsScreenPoint(
            //     panel.GetComponent<RectTransform>(),
            //     Input.mousePosition,
            //     Camera.main);

            gameObject.SetActive(false);
        }
    }
}
