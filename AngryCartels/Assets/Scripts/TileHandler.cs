using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Xml;
using System;

public class TileHandler : MonoBehaviour {

    public GameObject moveLocationsContainerObject;

    private int tier1TileCount = 56;
    private int tier2TileCount = 40;
    private int tier3TileCount = 24;

    private Tile[] tiles;

    private MoveToTile objectToMove = null;

    // Use this for initialization
    void Start () {

        tiles = new Tile[tier1TileCount + tier2TileCount + tier3TileCount];
        Transform[] locTrans = moveLocationsContainerObject.GetComponentsInChildren<Transform>();

        // Create Arrays
        for (int i = 0; i < tier1TileCount + tier2TileCount + tier3TileCount; ++i)
        {
            tiles[i] = new Tile();
            tiles[i].index = i;
            tiles[i].tier = 1;
            tiles[i].neighbors = new System.Collections.Generic.List<Tile>();
            tiles[i].location = locTrans[i].position;
        }

        // Destroy tile location container
        foreach (Transform t in locTrans)
        {
            Destroy(t.gameObject);
        }
        Destroy(moveLocationsContainerObject);

        // Set tile neighbors
        for (int i = 0; i < tier1TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[(i + 1) % tier1TileCount]); // forward
            tiles[i].neighbors.Add(tiles[(tier1TileCount - 1 + i) % tier1TileCount]); // backward
        }
        tiles[7].neighbors.Add(tiles[5 + tier1TileCount]); // link to tier 2
        tiles[35].neighbors.Add(tiles[25 + tier1TileCount]); // link to tier 2

        for (int i = 0; i < tier2TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[((i + 1) % tier2TileCount) + tier1TileCount]); // forward
            tiles[i].neighbors.Add(tiles[((tier2TileCount - 1 + i) % tier2TileCount) + tier1TileCount]); // backward
        }
        tiles[5 + tier1TileCount].neighbors.Add(tiles[7]); // link to tier 1
        tiles[25 + tier1TileCount].neighbors.Add(tiles[35]); // link to tier 1
        tiles[15 + tier1TileCount].neighbors.Add(tiles[9 + tier1TileCount + tier2TileCount]); // link to tier 3
        tiles[35 + tier1TileCount].neighbors.Add(tiles[21 + tier1TileCount + tier2TileCount]); // link to tier 3

        for (int i = 0; i < tier3TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[((i + 1) % tier3TileCount) + tier1TileCount + tier2TileCount]); // forward
            tiles[i].neighbors.Add(tiles[((tier3TileCount - 1 + i) % tier3TileCount) + tier1TileCount + tier2TileCount]); // backward
        }
        tiles[9 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[15 + tier1TileCount]); // link to tier 2
        tiles[21 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[35 + tier1TileCount]); // link to tier 2

        // Subscribe to the changed goal/start event
        MessageBus.Instance.Register("goalChange", PlayerChangedGoal);
    }

    private void PlayerChangedGoal(Message obj)
    {
        // reset the player to start
        MoveToTile moveTo = obj.GetData<MoveToTile>();
        moveTo.gameObject.transform.position = tiles[moveTo.startIndex].location;

        // Find the path between the two tiles
        List<Vector3> path = new List<Vector3>();
        FindPath(ref path, moveTo.startIndex, moveTo.goalIndex);

        // Prepare to LERP!
        objectToMove = moveTo;
    }

    private void FindPath(ref List<Vector3> path, int startIndex, int goalIndex)
    {
        // TODO: find path between start and end
        throw new NotImplementedException();
    }

    // Update is called once per frame
    void Update () {
	    if (objectToMove != null)
        {
            // TODO perform lerp bs here
        }
	}

    void CreateTileDictionary()
    {
        Dictionary<string, int> tileMap = new Dictionary<string, int>();

        TextAsset asset = Resources.Load<TextAsset>("tile_mapping.xml");
        XmlDocument doc = new XmlDocument();
        doc.LoadXml(asset.text);

        // TODO: load mapping here
    }
}
