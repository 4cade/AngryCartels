using UnityEngine;
using System.Collections;

public class TileHandler : MonoBehaviour {

    public int tier1TileCount;
    public int tier2TileCount;
    public int tier3TileCount;

    private Tile[] t1Head;
    private Tile[] t2Head; // could probably be just one 
    private Tile[] t3Head; // array but this is fine for now

    // Use this for initialization
    void Start () {

        // Create Arrays
        t1Head = new Tile[tier1TileCount];
        for (int i = 0; i < tier1TileCount; ++i)
        {
            t1Head[i] = new Tile();
            t1Head[i].index = i;
            t1Head[i].tier = 1;
            t1Head[i].neighbors = new System.Collections.Generic.List<Tile>();
        }

        t2Head = new Tile[tier2TileCount];
        for (int i = 0; i < tier2TileCount; ++i)
        {
            t2Head[i] = new Tile();
            t2Head[i].index = tier1TileCount + i;
            t2Head[i].tier = 2;
            t2Head[i].neighbors = new System.Collections.Generic.List<Tile>();
        }

        t3Head = new Tile[tier3TileCount];
        for (int i = 0; i < tier3TileCount; ++i)
        {
            t3Head[i] = new Tile();
            t3Head[i].index = tier1TileCount + tier2TileCount + i;
            t3Head[i].tier = 2;
            t3Head[i].neighbors = new System.Collections.Generic.List<Tile>();
        }

        // Set tile neighbors
        for (int i = 0; i < tier1TileCount; ++i)
        {
            t1Head[i].neighbors.Add(t1Head[(i + 1) % tier1TileCount]);
            t1Head[i].neighbors.Add(t1Head[(tier1TileCount - 1 + i) % tier1TileCount]);
        }
        t1Head[7].neighbors.Add(t2Head[5]); // link to tier 2
        t1Head[35].neighbors.Add(t2Head[25]); // link to tier 2

        for (int i = 0; i < tier2TileCount; ++i)
        {
            t2Head[i].neighbors.Add(t2Head[(i + 1) % tier2TileCount]);
            t2Head[i].neighbors.Add(t2Head[(tier2TileCount - 1 + i) % tier2TileCount]);
        }
        t2Head[5].neighbors.Add(t1Head[7]); // link to tier 1
        t2Head[25].neighbors.Add(t1Head[35]); // link to tier 1
        t2Head[15].neighbors.Add(t3Head[9]); // link to tier 3
        t2Head[35].neighbors.Add(t3Head[21]); // link to tier 3

        for (int i = 0; i < tier3TileCount; ++i)
        {
            t3Head[i].neighbors.Add(t3Head[(i + 1) % tier3TileCount]);
            t3Head[i].neighbors.Add(t3Head[(tier3TileCount - 1 + i) % tier3TileCount]);
        }
        t3Head[9].neighbors.Add(t2Head[15]); // link to tier 2
        t3Head[21].neighbors.Add(t2Head[35]); // link to tier 2
    }
	
	// Update is called once per frame
	void Update () {
	
	}
}
