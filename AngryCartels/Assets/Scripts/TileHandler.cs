using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Xml;

public class TileHandler : MonoBehaviour {

    private int tier1TileCount = 56;
    private int tier2TileCount = 40;
    private int tier3TileCount = 24;

    private Tile[] tiles;

    // Use this for initialization
    void Start () {

        tiles = new Tile[tier1TileCount + tier2TileCount + tier3TileCount];

        // Create Arrays
        for (int i = 0; i < tier1TileCount + tier2TileCount + tier3TileCount; ++i)
        {
            tiles[i] = new Tile();
            tiles[i].index = i;
            tiles[i].tier = 1;
            tiles[i].neighbors = new System.Collections.Generic.List<Tile>();
        }

        // Set tile neighbors
        for (int i = 0; i < tier1TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[(i + 1) % tier1TileCount]);
            tiles[i].neighbors.Add(tiles[(tier1TileCount - 1 + i) % tier1TileCount]);
        }
        tiles[7].neighbors.Add(tiles[5 + tier1TileCount]); // link to tier 2
        tiles[35].neighbors.Add(tiles[25 + tier1TileCount]); // link to tier 2

        for (int i = 0; i < tier2TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[((i + 1) % tier2TileCount) + tier1TileCount]);
            tiles[i].neighbors.Add(tiles[((tier2TileCount - 1 + i) % tier2TileCount) + tier1TileCount]);
        }
        tiles[5 + tier1TileCount].neighbors.Add(tiles[7]); // link to tier 1
        tiles[25 + tier1TileCount].neighbors.Add(tiles[35]); // link to tier 1
        tiles[15 + tier1TileCount].neighbors.Add(tiles[9 + tier1TileCount + tier2TileCount]); // link to tier 3
        tiles[35 + tier1TileCount].neighbors.Add(tiles[21 + tier1TileCount + tier2TileCount]); // link to tier 3

        for (int i = 0; i < tier3TileCount; ++i)
        {
            tiles[i].neighbors.Add(tiles[((i + 1) % tier3TileCount) + tier1TileCount + tier2TileCount]);
            tiles[i].neighbors.Add(tiles[((tier3TileCount - 1 + i) % tier3TileCount) + tier1TileCount + tier2TileCount]);
        }
        tiles[9 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[15 + tier1TileCount]); // link to tier 2
        tiles[21 + tier1TileCount + tier2TileCount].neighbors.Add(tiles[35 + tier1TileCount]); // link to tier 2
    }
	
	// Update is called once per frame
	void Update () {
	
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
