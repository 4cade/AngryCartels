// Here are the calculated X and Y coordinates of the center for each location on the game board
// A location can be a property, railroad, utility, etc.
// Using a board of size 1000 x 1000 (width x height):
//     Outer track:
//         The corner locations have dimension 116 x 116
//         All remaining locations have dimension 58 x 116
//     Middle Track:
//         The corner locations have dimension 112 x 112
//         All remaining locations have dimension 57 x 112
//     Inner Track:
//         The corner locations have dimension 110 x 110
//         All remaining locations have dimension 56 x 110
locations = [
    {
        "name": "go",
        "track": "middle",
        "midX": 812,
        "midY": 812
    },
    {
        "name": "mediterranean avenue",
        "track": "middle",
        "midX": 726,
        "midY": 812
    },
    {
        "name": "community chest bottom",
        "track": "middle",
        "midX": 669,
        "midY": 812
    },
    {
        "name": "baltic avenue",
        "track": "middle",
        "midX": 613,
        "midY": 812
    },
    {
        "name": "income tax",
        "track": "middle",
        "midX": 556,
        "midY": 812
    },
    {
        "name": "transit station bottom",
        "track": "middle",
        "midX": 500,
        "midY": 812
    },
    {
        "name": "oriental avenue",
        "track": "middle",
        "midX": 443,
        "midY": 812
    },
    {
        "name": "chance bottom",
        "track": "middle",
        "midX": 385,
        "midY": 812
    },
    {
        "name": "vermont avenue",
        "track": "middle",
        "midX": 328,
        "midY": 812
    },
    {
        "name": "connecticut avenue",
        "track": "middle",
        "midX": 272,
        "midY": 812
    },
    {
        "name": "jail",
        "track": "middle",
        "midX": 188,
        "midY": 812
    },
    {
        "name": "st. charles place",
        "track": "middle",
        "midX": 188,
        "midY": 726
    },
    {
        "name": "electric company",
        "track": "middle",
        "midX": 188,
        "midY": 669
    },
    {
        "name": "states avenue",
        "track": "middle",
        "midX": 188,
        "midY": 613
    },
    {
        "name": "virginia avenue",
        "track": "middle",
        "midX": 188,
        "midY": 556
    },
    {
        "name": "pennsylvania railroad",
        "track": "middle",
        "midX": 188,
        "midY": 500
    },
    {
        "name": "st. james place",
        "track": "middle",
        "midX": 188,
        "midY": 443
    },
    {
        "name": "community chest left",
        "track": "middle",
        "midX": 188,
        "midY": 385
    },
    {
        "name": "tennessee avenue",
        "track": "middle",
        "midX": 188,
        "midY": 328
    },
    {
        "name": "new york avenue",
        "track": "middle",
        "midX": 188,
        "midY": 272
    },
    {
        "name": "free parking",
        "track": "middle",
        "midX": 188,
        "midY": 188
    },
    {
        "name": "kentucky avenue",
        "track": "middle",
        "midX": 272,
        "midY": 188
    },
    {
        "name": "chance top",
        "track": "middle",
        "midX": 328,
        "midY": 188
    },
    {
        "name": "indiana avenue",
        "track": "middle",
        "midX": 385,
        "midY": 188
    },
    {
        "name": "illinois avenue",
        "track": "middle",
        "midX": 443,
        "midY": 188
    },
    {
        "name": "transit station top",
        "track": "middle",
        "midX": 500,
        "midY": 188
    },
    {
        "name": "atlantic avenue",
        "track": "middle",
        "midX": 556,
        "midY": 188
    },
    {
        "name": "ventnor avenue",
        "track": "middle",
        "midX": 613,
        "midY": 188
    },
    {
        "name": "water works",
        "track": "middle",
        "midX": 669,
        "midY": 188
    },
    {
        "name": "marvin gardens",
        "track": "middle",
        "midX": 726,
        "midY": 188
    },
    {
        "name": "roll three",
        "track": "middle",
        "midX": 812,
        "midY": 188
    },
    {
        "name": "pacific avenue",
        "track": "middle",
        "midX": 812,
        "midY": 272
    },
    {
        "name": "north carolina avenue",
        "track": "middle",
        "midX": 812,
        "midY": 328
    },
    {
        "name": "community chest right",
        "track": "middle",
        "midX": 812,
        "midY": 385
    },
    {
        "name": "pennsylvania avenue",
        "track": "middle",
        "midX": 812,
        "midY": 443
    },
    {
        "name": "short line railroad",
        "track": "middle",
        "midX": 812,
        "midY": 500
    },
    {
        "name": "chance right",
        "track": "middle",
        "midX": 812,
        "midY": 556
    },
    {
        "name": "park place",
        "track": "middle",
        "midX": 812,
        "midY": 613
    },
    {
        "name": "luxury tax",
        "track": "middle",
        "midX": 812,
        "midY": 669
    },
    {
        "name": "boardwalk",
        "track": "middle",
        "midX": 812,
        "midY": 726
    },
    {
        "name": "squeeze play",
        "track": "inner",
        "midX": 693,
        "midY": 690
    },
    {
        "name": "the embarcadero",
        "track": "inner",
        "midX": 612,
        "midY": 690
    },
    {
        "name": "fisherman's wharf",
        "track": "inner",
        "midX": 556,
        "midY": 690
    },
    {
        "name": "telephone company",
        "track": "inner",
        "midX": 500,
        "midY": 690
    },
    {
        "name": "community chest bottom",
        "track": "inner",
        "midX": 444,
        "midY": 690
    },
    {
        "name": "beacon street",
        "track": "inner",
        "midX": 388,
        "midY": 690
    },
    {
        "name": "bonus",
        "track": "inner",
        "midX": 306,
        "midY": 690
    },
    {
        "name": "boylston street",
        "track": "inner",
        "midX": 306,
        "midY": 608
    },
    {
        "name": "newbury street",
        "track": "inner",
        "midX": 306,
        "midY": 554
    },
    {
        "name": "transit station left",
        "track": "inner",
        "midX": 306,
        "midY": 500
    },
    {
        "name": "fifth avenue",
        "track": "inner",
        "midX": 306,
        "midY": 444
    },
    {
        "name": "madison avenue",
        "track": "inner",
        "midX": 306,
        "midY": 389
    },
    {
        "name": "stock exchange",
        "track": "inner",
        "midX": 306,
        "midY": 306
    },
    {
        "name": "wall street",
        "track": "inner",
        "midX": 388,
        "midY": 306
    },
    {
        "name": "tax refund",
        "track": "inner",
        "midX": 444,
        "midY": 306
    },
    {
        "name": "gas company",
        "track": "inner",
        "midX": 500,
        "midY": 306
    },
    {
        "name": "chance top",
        "track": "inner",
        "midX": 556,
        "midY": 306
    },
    {
        "name": "florida avenue",
        "track": "inner",
        "midX": 612,
        "midY": 306
    },
    {
        "name": "holland tunnel",
        "track": "inner",
        "midX": 693,
        "midY": 306
    },
    {
        "name": "miami avenue",
        "track": "inner",
        "midX": 693,
        "midY": 389
    },
    {
        "name": "biscayne avenue",
        "track": "inner",
        "midX": 693,
        "midY": 444
    },
    {
        "name": "transit station right",
        "track": "inner",
        "midX": 693,
        "midY": 500
    },
    {
        "name": "reverse direction",
        "track": "inner",
        "midX": 693,
        "midY": 554
    },
    {
        "name": "lombard street",
        "track": "inner",
        "midX": 693,
        "midY": 608
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
    {
        "name":
        "midX":
        "midY":
    },
];

var locations = {};

module.exports = locations;