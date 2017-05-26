using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A Tile is a navigatable object that the playes can
/// travel to.
/// </summary>
public class Tile {

    public List<Tile> neighbors;
    public Vector3 location;
    public int index;
    public int tier;
    
}
