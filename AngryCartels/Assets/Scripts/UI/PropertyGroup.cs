using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PropertyGroup : MonoBehaviour {

    public PropertyPanel propertyPanel;

    public KeyValuePair<int, List<string>> propertyGroup;

    /// <summary>
    /// Gets called when a group of cards is selected.
    /// </summary>
    public void GroupSelected()
    {
        Debug.Log("Card Group Selected");

        // set the card panel to active
        propertyPanel.cardPanel.SetActive(true);

        // set the back button to active
        propertyPanel.backButton.gameObject.SetActive(true);

        // Display the given cards.
        // Destroy all previous children
        foreach (Transform child in gameObject.transform)
        {
            Destroy(child.gameObject);
        }

        // Add the new cards to the display
        foreach (var cardName in propertyGroup.Value)
        {
            GameObject instance = Instantiate(propertyPanel.propertyCardPrefab);
            instance.transform.SetParent(propertyPanel.cardPanel.transform);
        }

        // set the parent panel to non-active
        transform.parent.gameObject.SetActive(false);
    }

}
