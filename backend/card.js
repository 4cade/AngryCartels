const fortuneCards = require('./config/fortune');
const misfortuneCards = require('./config/misfortune');

/**
 * Card object allows the player to draw from the various cards in the game (fortune,
 *      misfortune, bus, roll3, etc.)
 */
class Card {

    /**
     * Chooses a random element from the array.
     * @param arr array of elements
     * @return a random element from the array
     */
    static chooseRandom(arr) {
        var index = Math.floor(Math.random()*arr.length);
        return arr[index];
    }

    /**
     * Simulates drawing a bus pass card.
     * @return a String representing a bus pass
     */
    static drawBusPass() {

        const tickets = [
            "forward transit",
            "forward any", "forward any", "forward any", "forward any",
            "forward any expire",
            "backward 1",
            "backward 2",
            "backward 3",
            "forward 1",
            "forward 2",
            "forward 3"
        ];

        return this.chooseRandom(tickets);
    }

    /**
     * Simulates drawing a draw3 card.
     * @return an array of 3 numbers in [1,6] that the user needs to match with dice rolls
     */
    static drawRoll3 () {
        var rollSet = new Set([1,2,3,4,5,6]);
        var nums = [];

        for(let i = 0; i < 3; i++) {
            let drawn = this.chooseRandom(Array.from(rollSet));
            rollSet.delete(drawn);
            nums.push(drawn);
        }

        nums.sort();
        return nums;
    };

    /**
     * Simulates drawing a fortune card.
     * @return a JSON with fields title (name of card), description,
     *      play (when to use the card), and short (short description used internally)
     */
    static drawFortune() {
        return this.chooseRandom(fortuneCards);
    }

    /**
     * Simulates drawing a misfortune card.
     * @return a JSON with fields title (name of card), description,
     *      play (when to use the card), and short (short description used internally)
     */
    static drawMisfortune() {
        return this.chooseRandom(misfortuneCards)
    }

    /**
     * Simulates rolling a 6-sided die
     * @return random number between 1 and 6.
     */
    static rollDie() {
        return Math.floor(Math.random()*6)+1;
    }
}

module.exports = Card;