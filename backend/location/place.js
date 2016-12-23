/* Place object stores the information about a location.
 * @param name String name of the player
 * @param startingSpace String name of the starting location of the player (usually Go)
 * @param startingTrack index of the starting track of the player (usually Go's track)
 */
class Place {

    // set up initial state
    constructor(name, boardPreset) {
        this.name = name;
        this.kind = boardPreset['type'];
        this.forward = boardPreset['forward'];
        this.backward = boardPreset['backward'];
        this.side = boardPreset['side'];
        this.track = boardPreset['track'];
        this.above = boardPreset['above'];
        this.below = boardPreset['below'];
    }


}


module.exports = Place;