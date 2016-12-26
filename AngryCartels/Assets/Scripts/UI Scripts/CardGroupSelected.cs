using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class CardGroupSelected : MonoBehaviour {

    private GameObject cardPanel;

    void Start()
    {
        // Get the Card Panel From the ALPHA PARENT
        cardPanel = transform.parent.parent.Find("CardPanel").gameObject;

        Button button = GetComponent<Button>();
        button.onClick.AddListener(GroupSelected);
    }

    void GroupSelected()
    {
        Debug.Log("Card Group Selected");

        // set the card panel to active
        cardPanel.SetActive(true);

        // set the parent panel to non-active
        transform.parent.gameObject.SetActive(false);
    }
}
