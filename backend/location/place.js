/**
 * Place object stores the information about a location.
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
        this.isProperty = false;
    }

    /**
     * Turns the Place into a reloadable JSON representation
     * @return JSON version of this object
     */
    toJSON() {
        return {
            "name": this.name,
            "type": this.kind,
            "forward": this.forward,
            "backward": this.backward,
            "side": this.side,
            "track": this.track,
            "above": this.above,
            "below": this.below
        }
        // TODO decide if needs isProperty
    }

}


module.exports = Place;