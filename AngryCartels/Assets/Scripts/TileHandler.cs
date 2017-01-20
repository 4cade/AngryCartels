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
            tiles[i].location = locTrans[i + 1].position; // +1 for parent object
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
        Stack<Vector3> path = new Stack<Vector3>();
        path = FindPath(moveTo.startIndex, moveTo.goalIndex, moveTo);

        // Prepare to LERP!
        objectToMove = moveTo;

        Vector3 v = path.Pop();
        while (path.Count > 0)
        {
            v = path.Pop();
        }
        objectToMove.gameObject.transform.position = v;
    }

    private int HeuristicCostEstimate(int startIndex, int goalIndex, MoveToTile moveInfo)
    {
        int isDirF = moveInfo.isForwardDirection ? -1 : 1;
        return 100 * Math.Abs(tiles[goalIndex].tier - tiles[startIndex].tier) + 
                isDirF * Math.Abs(goalIndex - startIndex);
    }

    private Stack<Vector3> BuildPath(Dictionary<int, int> history, int current)
    {
        Stack<Vector3> path = new Stack<Vector3>();
        path.Push(tiles[current].location);
        while (history.ContainsKey(current))
        {
            current = history[current];
            path.Push(tiles[current].location);
        }
        return path;
    }

    private Stack<Vector3> FindPath(int startIndex, int goalIndex, MoveToTile moveTo)
    {
        // TODO: probably should make this a coroutine
        // find path between start and end
        SetList<int> closed = new SetList<int>();
        SetList<int> open = new SetList<int>();
        open.Add(startIndex);
        Dictionary<int, int> history = new Dictionary<int, int>();
        //DictionaryWithDefault<int, int> gScore = new DictionaryWithDefault<int, int>(int.MaxValue);
        //gScore[startIndex] = 0;
        DictionaryWithDefault<int, int> score = new DictionaryWithDefault<int, int>(int.MaxValue);
        score[startIndex] = HeuristicCostEstimate(startIndex, goalIndex, moveTo);

        while (open.Count > 0)
        {
            int current = open[open.Count - 1]; // TODO: should be the lower cost f value
            if (current == goalIndex)
            {
                return BuildPath(history, current);
            }

            open.RemoveAt(open.Count - 1);
            closed.Add(current);
            foreach (Tile tile in tiles[current].neighbors)
            {
                if (closed.Contains(tile.index)) continue;

                int gCost = score[current] + HeuristicCostEstimate(current, goalIndex, objectToMove);
                if (!open.Contains(tile.index))
                    open.Add(tile.index);
                else if (gCost <= score[tile.index])
                    continue;

                history[tile.index] = current;
                score[tile.index] = gCost;
            }
        }

        return null;
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
