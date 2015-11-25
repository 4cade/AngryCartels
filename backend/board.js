var board = {
	"biscayne ave": {
		"type": "property",
		"quality": "fake red",
		"rent": [11, 55, 160, 475, 650, 800, 1300],
		"mortgage": 75,
		"house": 50,
		"forward": ["short line"],
		"backward": ["miami ave"]
	},
	"miami ave": {
		"type": "property",
		"quality": "fake red",
		"rent": [9, 45, 120, 350, 500, 700, 1200],
		"mortgage": 65,
		"house": 50,
		"forward": ["biscayne ave"],
		"backward": ["holland tunnel ne"],
	},
	"florida ave": {
		"type": "property",
		"quality": "fake red",
		"rent": [9, 45, 120, 350, 500, 700, 1200],
		"mortgage": 65,
		"house": 50,
		"forward": ["holland tunnel ne"],
		"backward": ["chance inner ne"]
	},
	"lombard st": {
		"type": "property",
		"quality": "white",
		"rent": [17, 85, 240, 475, 670, 1025, 1525],
		"mortgage": 105,
		"house": 100,
		"forward": ["squeeze play"],
		"backward": ["reverse"]
	},
	"the embarcadero": {
		"type": "property",
		"quality": "white",
		"rent": [17, 85, 240, 475, 670, 1025, 1525],
		"mortgage": 105,
		"house": 100,
		"forward": ["fisherman's wharf"],
		"backward": ["squeeze play"]
	},
	"fisherman's wharf": {
		"type": "property",
		"quality": "white",
		"rent": [21, 105, 320, 780, 950, 1125, 1625],
		"mortgage": 125,
		"house": 100,
		"forward": ["telephone company"],
		"backward": ["the embarcadero"]
	},
	"beacon st": {
		"type": "property",
		"quality": "black",
		"rent": [30, 160, 470, 1050, 1250, 1500, 2500],
		"mortgage": 165,
		"house": 200,
		"forward": ["bonus"],
		"backward": ["community chest inner sw"]
	},
	"boylston st": {
		"type": "property",
		"quality": "black",
		"rent": [30, 160, 470, 1050, 1250, 1500, 2500],
		"mortgage": 165,
		"house": 200,
		"forward": ["newbury st"],
		"backward": ["bonus"]
	},
	"newbury st": {
		"type": "property",
		"quality": "black",
		"rent": [40, 185, 550, 1200, 1500, 1700, 2700],
		"mortgage": 190,
		"house": 200,
		"forward": ["pennsylvania railroad"],
		"backward": ["boylston st"]
	},
	"fifth ave": {
		"type": "property",
		"quality": "gray",
		"rent": [60, 220, 650, 1500, 1800, 2100, 3600],
		"mortgage": 215,
		"house": 300,
		"forward": ["madison ave"],
		"backward": ["pennsylvania railroad"]
	},
	"madison ave": {
		"type": "property",
		"quality": "gray",
		"rent": [60, 220, 650, 1500, 1800, 2100, 3600],
		"mortgage": 215,
		"house": 300,
		"forward": ["stock exchange"],
		"backward": ["fifth ave"]
	},
	"wall st": {
		"type": "property",
		"quality": "gray",
		"rent": [80, 300, 800, 1800, 2200, 2700, 4200],
		"mortgage": 250,
		"house": 300,
		"forward": ["tax refund"],
		"backward": ["stock exchange"]
	},
	"lake st": {
		"type": "property",
		"quality": "light pink",
		"rent": [1, 5, 15, 45, 80, 125, 625],
		"mortgage": 15,
		"house": 50,
		"forward": ["community chest outer se"],
		"backward": ["subway"]
	},
	"nicollet ave": {
		"type": "property",
		"quality": "light pink",
		"rent": [1, 5, 15, 45, 80, 125, 625],
		"mortgage": 15,
		"house": 50,
		"forward": ["hennepin ave"],
		"backward": ["community chest outer se"]
	},
	"hennepin ave": {
		"type": "property",
		"quality": "light pink",
		"rent": [3, 15, 45, 130, 240, 350, 850],
		"mortgage": 30,
		"house": 50,
		"forward": ["bus ticket south"],
		"backward": ["nicollet ave"]
	},
	"esplanade ave": {
		"type": "property",
		"quality": "light green",
		"rent": [5, 25, 80, 225, 360, 600, 1000],
		"mortgage": 50,
		"house": 50,
		"forward": ["canal st"],
		"backward": ["reading railroad"]
	},
	"katy freeway": {
		"type": "property",
		"quality": "light yellow",
		"rent": [11, 55, 160, 475, 650, 800, 1300],
		"mortgage": 70,
		"house": 100,
		"forward": ["westheimer rd"],
		"backward": ["auction"]
	},
	"westheimer rd": {
		"type": "property",
		"quality": "light yellow",
		"rent": [11, 55, 160, 475, 650, 800, 1300],
		"mortgage": 70,
		"house": 100,
		"forward": ["internet service provider"],
		"backward": ["katy freeway"]
	},
	"kirby dr": {
		"type": "property",
		"quality": "light yellow",
		"rent": [14, 70, 200, 550, 750, 950, 1450],
		"mortgage": 80,
		"house": 100,
		"forward": ["cullen blvd"],
		"backward": ["internet service provider"]
	},
	"cullen blvd": {
		"type": "property",
		"quality": "light yellow",
		"rent": [14, 70, 200, 550, 750, 950, 1450],
		"mortgage": 80,
		"house": 100,
		"forward": ["chance outer west"],
		"backward": ["kirby dr"]
	},
	"canal st": {
		"type": "property",
		"quality": "light green",
		"rent": [5, 25, 80, 225, 360, 600, 1000],
		"mortgage": 50,
		"house": 50,
		"forward": ["chance outer south"],
		"backward": ["esplanade ave"]
	},
	"magazine st": {
		"type": "property",
		"quality": "light green",
		"rent": [8, 40, 100, 300, 450, 600, 1100],
		"mortgage": 60,
		"house": 50,
		"forward": ["bourbon st"],
		"backward": ["cable company"]
	},
	"bourbon st": {
		"type": "property",
		"quality": "light green",
		"rent": [8, 40, 100, 300, 450, 600, 1100],
		"mortgage": 60,
		"house": 50,
		"forward": ["holland tunnel sw"],
		"backward": ["magazine st"]
	},
	"dekalb ave": {
		"type": "property",
		"quality": "sea green",
		"rent": [17, 85, 240, 670, 840, 1025, 1525],
		"mortgage": 90,
		"house": 100,
		"forward": ["community chest outer nw"],
		"backward": ["black & white cab co"]
	},
	"young int'l blvd": {
		"type": "property",
		"quality": "sea green",
		"rent": [17, 85, 240, 670, 840, 1025, 1525],
		"mortgage": 90,
		"house": 100,
		"forward": ["decatur st"],
		"backward": ["community chest outer nw"]
	},
	"decatur st": {
		"type": "property",
		"quality": "sea green",
		"rent": [20, 100, 300, 750, 925, 1100, 1600],
		"mortgage": 100,
		"house": 100,
		"forward": ["peachtree st"],
		"backward": ["young int'l blvd"]
	},
	"peachtree st": {
		"type": "property",
		"quality": "sea green",
		"rent": [20, 100, 300, 750, 925, 1100, 1600],
		"mortgage": 100,
		"house": 100,
		"forward": ["pay day"],
		"backward": ["decatur st"]
	},
	"randolph st": {
		"type": "property",
		"quality": "dark maroon",
		"rent": [23, 115, 345, 825, 1010, 1180, 2180],
		"mortgage": 110,
		"house": 150,
		"forward": ["chance outer nw"],
		"backward": ["pay day"]
	},
	"lake shore dr": {
		"type": "property",
		"quality": "dark maroon",
		"rent": [23, 115, 345, 825, 1010, 1180, 2180],
		"mortgage": 110,
		"house": 150,
		"forward": ["wacker dr"],
		"backward": ["chance outer nw"]
	},
	"wacker dr": {
		"type": "property",
		"quality": "dark maroon",
		"rent": [26, 130, 390, 900, 1100, 1275, 2275],
		"mortgage": 120,
		"house": 150,
		"forward": ["michigan ave"],
		"backward": ["wacker dr"]
	},
	"michigan ave": {
		"type": "property",
		"quality": "dark maroon",
		"rent": [26, 130, 390, 900, 1100, 1275, 2275],
		"mortgage": 120,
		"house": 150,
		"forward": ["yellow cab co"],
		"backward": ["wacker dr"]
	},
	"south temple": {
		"type": "property",
		"quality": "gold",
		"rent": [32, 160, 470, 1050, 1250, 1500, 2500],
		"mortgage": 130,
		"house": 200,
		"forward": ["west temple"],
		"backward": ["community chest outer north"]
	},
	"west temple": {
		"type": "property",
		"quality": "gold",
		"rent": [32, 160, 470, 1050, 1250, 1500, 2500],
		"mortgage": 130,
		"house": 200,
		"forward": ["trash collector"],
		"backward": ["south temple"]
	},
	"north temple": {
		"type": "property",
		"quality": "gold",
		"rent": [38, 170, 520, 1125, 1275, 1425, 1650],
		"mortgage": 140,
		"house": 200,
		"forward": ["temple square"],
		"backward": ["trash collector"]
	},
	"temple square": {
		"type": "property",
		"quality": "gold",
		"rent": [38, 170, 520, 1125, 1275, 1425, 1650],
		"mortgage": 140,
		"house": 200,
		"forward": ["jail"],
		"backward": ["north temple"]
	},
	"south st": {
		"type": "property",
		"quality": "light orange",
		"rent": [45, 210, 575, 1300, 1600, 1800, 3300],
		"mortgage": 150,
		"house": 250,
		"forward": ["broad st"],
		"backward": ["jail"]
	},
	"broad st": {
		"type": "property",
		"quality": "light orange",
		"rent": [45, 210, 575, 1300, 1600, 1800, 3300],
		"mortgage": 150,
		"house": 250,
		"forward": ["walnut st"],
		"backward": ["south st"]
	},
	"walnut st": {
		"type": "property",
		"quality": "light orange",
		"rent": [55, 225, 630, 1450, 1750, 2050, 3350],
		"mortgage": 160,
		"house": 250,
		"forward": ["community chest outer east"],
		"backward": ["broad st"]
	},
	"market st": {
		"type": "property",
		"quality": "light orange",
		"rent": [55, 225, 630, 1450, 1750, 2050, 3350],
		"mortgage": 160,
		"house": 250,
		"forward": ["bus ticket east"],
		"backward": ["community chest outer east"]
	},
	"mulholland dr": {
		"type": "property",
		"quality": "maroon",
		"rent": [70, 350, 750, 1600, 1850, 2100, 3600],
		"mortgage": 175,
		"house": 300,
		"forward": ["ventura blvd"],
		"backward": ["birthday gift"]
	},
	"ventura blvd": {
		"type": "property",
		"quality": "maroon",
		"rent": [80, 400, 825, 1800, 2175, 2550, 4050],
		"mortgage": 200,
		"house": 300,
		"forward": ["chance outer se"],
		"backward": ["mulholland dr"]
	},
	"rodeo dr": {
		"type": "property",
		"quality": "maroon",
		"rent": [90, 450, 900, 2000, 2500, 3000, 4500],
		"mortgage": 250,
		"house": 300,
		"forward": ["subway"],
		"backward": ["chance outer se"]
	},
	"mediterranean ave": {
		"type": "property",
		"quality": "brown",
		"rent": [2, 10, 30, 90, 160, 250, 400],
		"mortgage": 30,
		"house": 50,
		"forward": ["community chest middle south"],
		"backward": ["go"]
	},
	"baltic ave": {
		"type": "property",
		"quality": "brown",
		"rent": [4, 20, 60, 180, 320, 450, 750],
		"mortgage": 30,
		"house": 50,
		"forward": ["income tax"],
		"backward": ["community chest middle south"]
	},
	"oriental ave": {
		"type": "property",
		"quality": "light blue",
		"rent": [6, 30, 90, 270, 400, 550, 900],
		"mortgage": 50,
		"house": 50,
		"forward": ["chance middle south"],
		"backward": ["reading railroad"]
	},
	"vermont ave": {
		"type": "property",
		"quality": "light blue",
		"rent": [6, 30, 90, 270, 400, 550, 900],
		"mortgage": 50,
		"house": 50,
		"forward": ["chance middle south"],
		"backward": ["reading railroad"]
	},
	"connecticut ave": {
		"type": "property",
		"quality": "light blue",
		"rent": [8, 40, 100, 300, 450, 600, 1000],
		"mortgage": 60,
		"house": 50,
		"forward": ["in jail"],
		"backward": ["vermont ave"]
	},
	"st charles pl": {
		"type": "property",
		"quality": "pink",
		"rent": [10, 50, 150, 450, 625, 750, 1200],
		"mortgage": 70,
		"house": 100,
		"forward": ["electric company"],
		"backward": ["in jail"]
	},
	"states ave": {
		"type": "property",
		"quality": "pink",
		"rent": [10, 50, 150, 450, 625, 750, 1200],
		"mortgage": 70,
		"house": 100,
		"forward": ["virginia ave"],
		"backward": ["electric company"]
	},
	"virginia ave": {
		"type": "property",
		"quality": "pink",
		"rent": [12, 60, 180, 500, 700, 900, 1450],
		"mortgage": 80,
		"house": 100,
		"forward": ["pennsylvania railroad"],
		"backward": ["states ave"]
	},
	"st james pl": {
		"type": "property",
		"quality": "orange",
		"rent": [14, 70, 200, 550, 750, 950, 1500],
		"mortgage": 90,
		"house": 100,
		"forward": ["community chest middle west"],
		"backward": ["pennsylvania railroad"]
	},
	"tennessee ave": {
		"type": "property",
		"quality": "orange",
		"rent": [14, 70, 200, 550, 750, 950, 1500],
		"mortgage": 90,
		"house": 100,
		"forward": ["new york ave"],
		"backward": ["community chest middle west"]
	},
	"new york ave": {
		"type": "property",
		"quality": "orange",
		"rent": [16, 80, 220, 600, 800, 1000, 1600],
		"mortgage": 100,
		"house": 100,
		"forward": ["free parking"],
		"backward": ["tennessee ave"]
	},
	"kentucky ave": {
		"type": "property",
		"quality": "red",
		"rent": [18, 90, 250, 700, 875, 1050, 1700],
		"mortgage": 110,
		"house": 150,
		"forward": ["chance middle north"],
		"backward": ["free parking"]
	},
	"indiana ave": {
		"type": "property",
		"quality": "red",
		"rent": [18, 90, 250, 700, 875, 1050, 1700],
		"mortgage": 110,
		"house": 150,
		"forward": ["illinois ave"],
		"backward": ["chance middle north"]
	},
	"illinois ave": {
		"type": "property",
		"quality": "red",
		"rent": [20, 100, 300, 750, 925, 1100, 1750],
		"mortgage": 120,
		"house": 150,
		"forward": ["b&o railroad"],
		"backward": ["indiana ave"]
	},
	"atlantic ave": {
		"type": "property",
		"quality": "yellow",
		"rent": [22, 110, 330, 800, 975, 1150, 1850],
		"mortgage": 130,
		"house": 150,
		"forward": ["ventnor ave"],
		"backward": ["b&o railroad"]
	},
	"ventnor ave": {
		"type": "property",
		"quality": "yellow",
		"rent": [22, 110, 330, 800, 975, 1150, 1850],
		"mortgage": 130,
		"house": 150,
		"forward": ["water works"],
		"backward": ["atlantic ave"]
	},
	"marvin gardens": {
		"type": "property",
		"quality": "yellow",
		"rent": [24, 120, 360, 850, 1025, 1200, 1900],
		"mortgage": 140,
		"house": 150,
		"forward": ["roll3"],
		"backward": ["water works"]
	},
	"pacific ave": {
		"type": "property",
		"quality": "green",
		"rent": [26, 120, 390, 900, 1100, 1275, 2050],
		"mortgage": 150,
		"house": 200,
		"forward": ["north carolina ave"],
		"backward": ["roll3"]
	},
	"north carolina ave": {
		"type": "property",
		"quality": "green",
		"rent": [26, 120, 390, 900, 1100, 1275, 2050],
		"mortgage": 150,
		"house": 200,
		"forward": ["community chest middle east"],
		"backward": ["pacific ave"]
	},
	"pennsylvania ave": {
		"type": "property",
		"quality": "green",
		"rent": [28, 150, 450, 1000, 1200, 1400, 2200],
		"mortgage": 160,
		"house": 200,
		"forward": ["short line"],
		"backward": ["community chest middle east"]
	},
	"park pl": {
		"type": "property",
		"quality": "blue",
		"rent": [35, 175, 500, 1100, 1300, 1500, 2400],
		"mortgage": 175,
		"house": 200,
		"forward": ["luxury tax"],
		"backward": ["chance middle east"]
	},
	"boardwalk": {
		"type": "property",
		"quality": "blue",
		"rent": [50, 200, 600, 1400, 1700, 2000, 3200],
		"mortgage": 200,
		"house": 200,
		"forward": ["go"],
		"backward": ["luxury tax"]
	},
	"checker cab co": {
		"type": "transportation",
		"quality": "cab",
		"rent": [30, 60, 120, 240],
		"mortgage": 150,
		"forward": ["reading railroad"],
		"backward": ["bus ticket south"]
	},
	"black & white cab co": {
		"type": "transportation",
		"quality": "cab",
		"rent": [30, 60, 120, 240],
		"mortgage": 150,
		"forward": ["dekalb ave"],
		"backward": ["chance outer west"]
	},
	"yellow cab co": {
		"type": "transportation",
		"quality": "cab",
		"rent": [30, 60, 120, 240],
		"mortgage": 150,
		"forward": ["b&o railroad"],
		"backward": ["michigan ave"]
	},
	"ute cab co": {
		"type": "transportation",
		"quality": "cab",
		"rent": [30, 60, 120, 240],
		"mortgage": 150,
		"forward": ["birthday gift"],
		"backward": ["sewage system"]
	},
	"water works": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["marvin gardens"],
		"backward": ["ventnor ave"]
	},
	"cable company": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["magazine st"],
		"backward": ["chance outer south"]
	},
	"electric company": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["states ave"],
		"backward": ["st charles pl"]
	},
	"internet service provider": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["westheimer rd"],
		"backward": ["kirby dr"]
	},
	"gas company": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["chance inner ne"],
		"backward": ["tax refund"]
	},
	"telephone company": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["community chest inner sw"],
		"backward": ["fisherman's wharf"]
	},
	"trash collector": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["north temple"],
		"backward": ["west temple"]
	},
	"sewage system": {
		"type": "utility",
		"quality": "utility",
		"multiplier": [10, 20, 40, 80, 100, 120, 150],
		"mortgage": 75,
		"forward": ["ute cab co"],
		"backward": ["bus ticket east"]
	},
	"reading railroad": {
		"type": "transportation",
		"quality": "railroad",
		"rent": [25, 50, 100, 200],
		"mortgage": 100,
		"forward": ["oriental ave", "esplanade ave"],
		"backward": ["income tax", "checker cab co"]
	},
	"pennsylvania railroad": {
		"type": "transportation",
		"quality": "railroad",
		"rent": [25, 50, 100, 200],
		"mortgage": 100,
		"forward": ["fifth ave", "st james pl"],
		"backward": ["newbury st", "virginia ave"]
	},
	"b&o railroad": {
		"type": "transportation",
		"quality": "railroad",
		"rent": [25, 50, 100, 200],
		"mortgage": 100,
		"forward": ["atlantic ave", "community chest outer north"],
		"backward": ["illinois ave", "yellow cab co"]
	},
	"short line": {
		"type": "transportation",
		"quality": "railroad",
		"rent": [25, 50, 100, 200],
		"mortgage": 100,
		"forward": ["reverse", "chance middle east"],
		"backward": ["biscayne ave", "pennsylvania ave"]
	},
	"holland tunnel ne": {
		"type": "spot",
		"forward": ["miami ave"],
		"backward": ["florida ave"]
	},
	"holland tunnel sw": {
		"type": "spot",
		"forward": ["auction"],
		"backward": ["bourbon st"]
	},
	"chance inner ne": {
		"type": "chance",
		"forward": ["florida ave"],
		"backward": ["gas company"]
	},
	"chance outer west": {
		"type": "chance",
		"forward": ["black & white cab co"],
		"backward": ["cullen blvd"]
	},
	"chance outer nw": {
		"type": "chance",
		"forward": ["lake shore dr"],
		"backward": ["randolph st"]
	},
	"chance outer south": {
		"type": "chance",
		"forward": ["cable company"],
		"backward": ["canal st"]
	},
	"chance outer se": {
		"type": "chance",
		"forward": ["rodeo dr"],
		"backward": ["ventura blvd"]
	},
	"chance middle east": {
		"type": "chance",
		"forward": ["park pl"],
		"backward": ["short line"]
	},
	"chance middle south": {
		"type": "chance",
		"forward": ["vermont ave"],
		"backward": ["oriental ave"]
	},
	"chance middle north": {
		"type": "chance",
		"forward": ["indiana ave"],
		"backward": ["kentucky ave"]
	},
	"squeeze play": {
		"type": "spot",
		"forward": ["the embarcadero"],
		"backward": ["lombard st"]
	},
	"reverse": {
		"type": "spot",
		"forward": ["lombard st"],
		"backward": ["short line"]
	},
	"bonus": {
		"type": "spot",
		"forward": ["boylston st"],
		"backward": ["beacon st"]
	},
	"pay day": {
		"type": "spot",
		"forward": ["randolph st"],
		"backward": ["peachtree st"]
	},
	"community chest inner sw": {
		"type": "spot",
		"forward": ["beacon st"],
		"backward": ["telephone company"]
	},
	"community chest outer se": {
		"type": "spot",
		"forward": ["nicollet ave"],
		"backward": ["lake st"]
	},
	"community chest outer nw": {
		"type": "spot",
		"forward": ["young int'l blvd"],
		"backward": ["dekalb ave"]
	},
	"community chest outer north": {
		"type": "spot",
		"forward": ["south temple"],
		"backward": ["b&o railroad"]
	},
	"community chest outer east": {
		"type": "spot",
		"forward": ["market st"],
		"backward": ["walnut st"]
	},
	"community chest middle south": {
		"type": "spot",
		"forward": ["baltic ave"],
		"backward": ["mediterranean ave"]
	},
	"community chest middle west": {
		"type": "spot",
		"forward": ["tennessee ave"],
		"backward": ["st james pl"]
	},
	"community chest middle east": {
		"type": "spot",
		"forward": ["pennsylvania ave"],
		"backward": ["north carolina ave"]
	},
	"stock exchange": {
		"type": "spot",
		"forward": ["wall st"],
		"backward": ["madison ave"]
	},
	"tax refund": {
		"type": "spot",
		"forward": ["gas company"],
		"backward": ["wall st"]
	},
	"subway": {
		"type": "spot",
		"forward": ["lake st"],
		"backward": ["rodeo dr"]
	},
	"bus ticket south": {
		"type": "spot",
		"forward": ["checker cab co"],
		"backward": ["hennepin ave"]	
	},
	"bus ticket east": {
		"type": "spot",
		"forward": ["sewage system"],
		"backward": ["ute cab co"]	
	},
	"auction": {
		"type": "spot",
		"forward": ["katy freeway"],
		"backward": ["holland tunnel sw"]	
	},
	"jail": {
		"type": "spot",
		"forward": ["south st"],
		"backward": ["temple square"]	
	},
	"in jail": {
		"type": "spot",
		"forward": ["st charles pl"],
		"backward": ["connecticut ave"]	
	},
	"birthday gift": {
		"type": "spot",
		"forward": ["mulholland dr"],
		"backward": ["ute cab co"]	
	},
	"income tax": {
		"type": "spot",
		"forward": ["reading railroad"],
		"backward": ["baltic ave"]	
	},
	"go": {
		"type": "spot",
		"forward": ["mediterranean ave"],
		"backward": ["boardwalk"]	
	},
	"free parking": {
		"type": "spot",
		"forward": ["kentucky ave"],
		"backward": ["new york ave"]	
	},
	"roll3": {
		"type": "spot",
		"forward": ["pacific ave"],
		"backward": ["marvin gardens"]	
	},
	"luxury tax": {
		"type": "spot",
		"forward": ["boardwalk"],
		"backward": ["park pl"]	
	}
}