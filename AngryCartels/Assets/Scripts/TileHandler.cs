using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Xml;
using System;

/// <summary>
/// The TileHandler class links game tiles together based on the 
/// moveLocationsContainerObject and stores those tiles in the 
/// tiles array. The hardcoded tile count values are the tile
/// ammount on each tier on the game board. This class also 
/// performs an A* search of the tiles in the array.
/// </summary>
public class TileHandler : MonoBehaviour {

    // The container that holds all the tiles in the editor
    public GameObject moveLocationsContainerObject;

    // Tile count of tier 1
    private int tier1TileCount = 56;

    // Tile count of tier 2
    private int tier2TileCount = 40;

    // Tile count of tier 3
    private int tier3TileCount = 24;

    // Stores created tiles when the game starts.
    // TODO: if we know this at game start we should create the entire array.
    public Tile[] tiles;

    // Use this for initialization
    void Start () {

        tiles = new Tile[tier1TileCount + tier2TileCount + tier3TileCount];
        Transform[] locTrans = moveLocationsContainerObject.GetComponentsInChildren<Transform>();

        // Create Arrays
        for (int i = 0; i < tier1TileCount + tier2TileCount + tier3TileCount; ++i)
        {
            tiles[i] = new Tile();
            tiles[i].index = i;
            if (i < tier1TileCount)
            {
                tiles[i].tier = 1;
            }
            else if (i < tier1TileCount + tier2TileCount)
            {
                tiles[i].tier = 2;
            }
            else if (i < tier1TileCount + tier2TileCount + tier3TileCount)
            {
                tiles[i].tier = 3;
            }
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
            tiles[i + tier1TileCount].neighbors.Add(tiles[((i + 1) % tier2TileCount) + tier1TileCount]); // forward
            tiles[i + tier1TileCount].neighbors.Add(tiles[((tier2TileCount - 1 + i) % tier2TileCount) + tier1TileCount]); // backward
        }
        tiles[5 + tier1TileCount].neighbors.Add(tiles[7]); // link to tier 1
        tiles[25 + tier1TileCount].neighbors.Add(tiles[35]); // link to tier 1
        tiles[15 + tier1TileCount].neighbors.Add(tiles[9 + tier1TileCount + tier2TileCount]); // link to tier 3
        tiles[35 + tier1TileCount].neighbors.Add(tiles[21 + tier1TileCount + tier2TileCount]); // link to tier 3

        for (int i = 0; i < tier3TileCount; ++i)
        {
            tiles[i + tier1TileCount + tier2TileCount].neighbors.Add(tiles[((i + 1) % tier3TileCount) + tier1TileCount + tier2TileCount]); // forward
            tiles[i + tier1TileCount + tier2TileCount].neighbors.Add(tiles[((tier3TileCount - 1 + i) % tier3TileCount) + tier1TileCount + tier2TileCount]); // backward
        }
        tiles[9 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[15 + tier1TileCount]); // link to tier 2
        tiles[21 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[35 + tier1TileCount]); // link to tier 2

        // Subscribe to the changed goal/start event
        MessageBus.Instance.Register("goalChange", PlayerChangedGoal);
    }

    /// <summary>
    /// Called whenever the 'goalChange' message is raised is the moveToTile script.
    /// </summary>
    /// <param name="obj">The moveToTileComponent</param>
    private void PlayerChangedGoal(Message obj)
    {
        // reset the player to start
        MoveToTile moveTo = obj.GetData<MoveToTile>();
        moveTo.gameObject.transform.position = tiles[moveTo.startIndex].location;

        // Find the path between the two tiles
        LinkedList<Vector3> path = new LinkedList<Vector3>();
        path = FindPath(moveTo.startIndex, moveTo.goalIndex, moveTo);

        Message message = new Message("pathCreated", path);
        MessageBus.Instance.Broadcast(message);
    }

    /// <summary>
    /// Estimates the cost of a move based on the current tile, the goal and magic numbers.
    /// </summary>
    /// <param name="nextIndex">The index that is being estimated for movement.</param>
    /// <param name="goalIndex">The goal index for movement.</param>
    /// <param name="moveInfo">Information relating to direction and tier.</param>
    /// <param name="currentTile">The current location of the moving object.</param>
    /// <returns>Heuristic value of the move from the current tile to the nextIndex.</returns>
    private int HeuristicCostEstimate(int nextIndex, int goalIndex, MoveToTile moveInfo, Tile currentTile)
    {
        int isDirF = moveInfo.isForwardDirection ? -1 : 1;
        int currentMaxTier = 0;
        int currentStartTier = 0;

        // check what tier we at
        switch (currentTile.tier)
        {
            case 1:
                currentStartTier = 0;
                currentMaxTier = tier1TileCount;
                break;
            case 2:
                currentStartTier = tier1TileCount;
                currentMaxTier = tier2TileCount + tier1TileCount;
                break;
            case 3:
                currentStartTier = tier2TileCount + tier1TileCount;
                currentMaxTier = tier3TileCount + tier2TileCount + tier1TileCount; ;
                break;
        }
        // check to see if we will be heading in the wrong direction.
        // If we are then penalize the movement.
        // If statement adds the tier count to compensate for looping indices
        int distance = currentMaxTier - nextIndex;
        if (moveInfo.isForwardDirection)
        {
            if ((nextIndex + distance + 2) % currentMaxTier < 
                (currentTile.index + distance + 2) % currentMaxTier)
            {
                return int.MinValue / 10;
            }
        }
        else
        {
            if ((nextIndex + distance + 2) % currentMaxTier >
                (currentTile.index + distance + 2) % currentMaxTier)
            {
                return int.MinValue / 10;
            }
        }

        int s = -100 * Math.Abs(tiles[goalIndex].tier - tiles[nextIndex].tier) +
                isDirF * Math.Abs(goalIndex - nextIndex);
        int s2 = -100 * Math.Abs(tiles[goalIndex].tier - currentTile.tier) +
                isDirF * Math.Abs(goalIndex - nextIndex);
        
        return -100 * Math.Abs(tiles[goalIndex].tier - tiles[nextIndex].tier) +
                isDirF * Math.Abs(goalIndex - nextIndex);
    }

    /// <summary>
    /// Constructs a path after a goal node has been reached.
    /// </summary>
    /// <param name="history">A dictionary that contains movement in reverse order.</param>
    /// <param name="current">The current tile location.</param>
    /// <returns>A linked List of Nodes containing a path from the current location
    /// to the goal location.</returns>
    private LinkedList<Vector3> BuildPath(Dictionary<int, int> history, int current)
    {
        LinkedList<int> debugPath = new LinkedList<int>();
        debugPath.AddFirst(tiles[current].index);
        LinkedList<Vector3> path = new LinkedList<Vector3>();
        path.AddFirst(tiles[current].location);
        while (history.ContainsKey(current))
        {
            current = history[current];
            path.AddFirst(tiles[current].location);
            debugPath.AddFirst(tiles[current].index);
        }

        // debug
        while (debugPath.Count > 0)
        {
            //Debug.Log(debugPath.First.Value);
            debugPath.RemoveFirst();
        }

        return path;
    }

    /// <summary>
    /// Pops the highest scoring tile index from the open set.
    /// </summary>
    /// <param name="open">Open set containing unexplored tiles.</param>
    /// <param name="score">Dictionary containing scores of all tiles.</param>
    /// <returns>The tile index to explore next.</returns>
    private int PopIndexFromOpenSet(SetList<int> open, DictionaryWithDefault<int, int> score)
    {
        int savedIndex = -1;
        int savedScore = int.MinValue;

        for (int i = 0; i < open.Count; ++i)
        {
            if (score[open[i]] > savedScore)
            {
                savedScore = score[open[i]];
                savedIndex = i;
            }
        }

        int value = open[savedIndex];
        open.RemoveAt(savedIndex);

        return value;
    }

    /// <summary>
    /// Performs A* search from startIndex tile to the goalIndex tile.
    /// </summary>
    /// <param name="startIndex">The starting index.</param>
    /// <param name="goalIndex">The goal Index.</param>
    /// <param name="moveTo">The MoveToTile component of the moving object.</param>
    /// <returns>A path from startIndex to GoalIndex or null if a path cannot be found.</returns>
    private LinkedList<Vector3> FindPath(int startIndex, int goalIndex, MoveToTile moveTo)
    {
        // TODO: probably should make this a coroutine
        // find path between start and end
        SetList<int> closed = new SetList<int>();
        SetList<int> open = new SetList<int>();

        open.Add(startIndex);

        Dictionary<int, int> history = new Dictionary<int, int>();
        DictionaryWithDefault<int, int> score = new DictionaryWithDefault<int, int>(0);

        while (open.Count > 0)
        {
            int current = PopIndexFromOpenSet(open, score);
            if (current == goalIndex)
            {
                return BuildPath(history, current);
            }

            closed.Add(current);
            foreach (Tile tile in tiles[current].neighbors)
            {
                if (closed.Contains(tile.index))
                {
                    continue;
                }

                int gCost = score[current] + HeuristicCostEstimate(tile.index, goalIndex, moveTo, tiles[current]);
                if (!open.Contains(tile.index))
                {
                    open.Add(tile.index);
                }
                else if (gCost <= score[tile.index])
                {
                    continue;
                }

                history[tile.index] = current;
                score[tile.index] = gCost;
            }
        }

        // a path was not found, you should panic
        return null;
    }
    
    /// <summary>
    /// Links tile string names to tile indexeseses.
    /// </summary>
    void CreateTileDictionary()
    {
        Dictionary<string, int> tileMap = new Dictionary<string, int>();

        TextAsset asset = Resources.Load<TextAsset>("tile_mapping.xml");
        XmlDocument doc = new XmlDocument();
        doc.LoadXml(asset.text);

        // TODO: load mapping here
    }
}
