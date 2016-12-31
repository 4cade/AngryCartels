const assert = require('assert');
const Place = require('../backend/location/place');
const Property = require('../backend/location/property');
const HouseProperty = require('../backend/location/houseProperty');
const Utility = require('../backend/location/utility');
const Railroad = require('../backend/location/railroad');
const CabCompany = require('../backend/location/cabCompany');
const PropertyGroup = require('../backend/location/propertyGroup');
const Player = require('../backend/player');

// tests the Location objects
describe('Location', function() {
    describe("#placeTest", function() {
        it("parses a normal location correctly", function() {
            const name = "birthday gift"
            const spot = {
                            "type": "spot",
                            "forward": ["mulholland dr"],
                            "backward": ["ute cab co"],
                            "side": [2],
                            "track": [2],
                            "above": ["park pl"],
                        }
            const place = new Place(name, spot);
            assert.equal(place.name, name);
            assert.equal(place.kind, spot.type);
            assert.deepEqual(place.forward, spot.forward);
            assert.deepEqual(place.backward, spot.backward);
            assert.deepEqual(place.side, spot.side);
            assert.deepEqual(place.above, spot.above);
        })
    });

    describe("#propertyTests", function() {
        const name = "electric company";
        const prop = {
                        "type": "utility",
                        "quality": "utility",
                        "rent": [4, 10, 20, 40, 80, 100, 120, 150],
                        "mortgage": 75,
                        "forward": ["states ave"],
                        "backward": ["st charles pl"],
                        "side": [1],
                        "track": [1],
                        "above": ["bonus"],
                        "below": ["internet service provider"]
                     };
        const property = new Property(name, prop);

        it("initializes a Property correctly", function() {
            assert.equal(property.kind, prop.type);
            assert.equal(property.mortgageValue, prop.mortgage);
            assert.equal(property.forward, prop.forward);
            assert.equal(property.below, prop.below);
            assert.equal(property.rent, prop.rent);
            assert.equal(property.group, prop.quality);
            assert.equal(property.cost, 2*prop.mortgage);
        });

        it("has the cost be the value", function() {
            assert.equal(property.getValue(), property.cost);
        });

        it("gets an owner", function() {
            assert.equal(property.owner, null);
            assert(property.setOwner("Bob"));
            assert.equal(property.owner, "Bob");
        });

        it("gets mortgaged", function() {
            assert(property.mortgage());
            assert(property.isMortgaged);
            assert.equal(property.getValue(), prop.mortgage);
        });

        it("gets unmortgaged", function() {
            assert(property.unmortgage());
            assert(!property.isMortgaged);
            assert.equal(property.getValue(), 2*prop.mortgage);
        });
    });

    describe("#housePropertyTests", function() {
        const name = "newbury st";
        const prop = {
                        "type": "property",
                        "quality": "black",
                        "rent": [40, 185, 550, 1200, 1500, 1700, 2700],
                        "mortgage": 190,
                        "house": 200,
                        "forward": ["pennsylvania railroad"],
                        "backward": ["boylston st"],
                        "side": [1],
                        "track": [0],
                        "below": ["virginia ave"]
                     };

        const property = new HouseProperty(name, prop);

        it("initializes a HouseProperty correctly", function() {
            assert.equal(property.kind, prop.type);
            assert.equal(property.mortgageValue, prop.mortgage);
            assert.equal(property.forward, prop.forward);
            assert.equal(property.below, prop.below);
            assert.equal(property.rent, prop.rent);
            assert.equal(property.group, prop.quality);
            assert.equal(property.cost, 2*prop.mortgage);
            assert.equal(property.housePrice, prop.house);
            assert.equal(property.houses, 0);
            assert.equal(property.getValue(), property.cost);
            assert.equal(property.getRent(false), prop.rent[0]);
            assert.equal(property.getRent(true), 2*prop.rent[0]);
        });

        it("adds houses and increase rent/value", function() {
            assert(property.addHouse());
            assert.equal(property.getRent(false), prop.rent[1]);
            assert.equal(property.getRent(true), prop.rent[1]);
            assert(property.addHouse());
            assert.equal(property.getRent(false), prop.rent[2]);
            assert(property.addHouse());
            assert(property.addHouse());
            assert.equal(property.getValue(), 4*prop.house+2*prop.mortgage);
            assert.equal(property.getRent(false), prop.rent[4]);
            assert(property.addHouse());
            assert(property.addHouse());
            assert.equal(property.getRent(false), prop.rent[6]);
            assert.equal(property.houses, 6)
            assert(!property.addHouse()); // can't go above 6 houses (aka skyscraper)
            assert.equal(property.houses, 6);
            assert.equal(property.getRent(true), prop.rent[6]);
            assert.equal(property.getValue(), 6*prop.house+2*prop.mortgage);
        });

        it("removes houses and decrease rent/value", function() {
            assert(property.removeHouse());
            assert.equal(property.getRent(false), prop.rent[5]);
            assert.equal(property.getValue(), 5*prop.house+2*prop.mortgage);
            assert(property.removeHouse());
            assert.equal(property.getRent(false), prop.rent[4]);
            assert(property.removeHouse());
            assert(property.removeHouse());
            assert.equal(property.getRent(false), prop.rent[2]);
            assert.equal(property.getValue(), 2*prop.house+2*prop.mortgage);
            assert(property.removeHouse());
            assert(property.removeHouse());
            assert.equal(property.getRent(false), prop.rent[0]);
            assert.equal(property.houses, 0)
            assert(!property.removeHouse()); // can't go below 0 houses
            assert.equal(property.houses, 0);
            assert.equal(property.getValue(), 0*prop.house+2*prop.mortgage);
        });

        it("does not charge any rent or let you add houses if mortgaged", function() {
            assert(property.mortgage());
            assert(property.isMortgaged);
            assert.equal(property.getRent(false), 0);
            assert(!property.addHouse());
            assert.equal(property.houses, 0);

            // now unmortgage and see if still works
            assert(property.unmortgage());
            assert(!property.isMortgaged)
            assert(property.addHouse());
            assert.equal(property.getRent(true), prop.rent[1]);
        });
    });

    describe("#utilityTests", function() {
        const name = "electric company";
        const prop = {
                        "type": "utility",
                        "quality": "utility",
                        "rent": [4, 10, 20, 40, 80, 100, 120, 150],
                        "mortgage": 75,
                        "forward": ["states ave"],
                        "backward": ["st charles pl"],
                        "side": [1],
                        "track": [1],
                        "above": ["bonus"],
                        "below": ["internet service provider"]
                     };
        const property = new Utility(name, prop);

        it("initializes a Utility correctly", function() {
            assert.equal(property.name, name);
            assert.equal(property.kind, prop.type);
            assert.equal(property.mortgageValue, prop.mortgage);
            assert.equal(property.forward, prop.forward);
            assert.equal(property.below, prop.below);
            assert.equal(property.rent, prop.rent);
            assert.equal(property.group, prop.quality);
            assert.equal(property.cost, 2*prop.mortgage);
            assert.equal(property.getValue(), property.cost);
        });

        it("charges the correct amount of rent", function() {
            assert.equal(property.getRent(0, 4), prop.rent[0]*4);
            assert.equal(property.getRent(3, 4), prop.rent[2]*4);
            assert.equal(property.getRent(7, 4), prop.rent[6]*4);
            assert.equal(property.getRent(9, 4), prop.rent[7]*4); // just assume that 8 is max

            // handle mortgage cases
            assert(property.mortgage());
            assert.equal(property.getRent(4, 4), 0);
            assert(property.unmortgage());
            assert.equal(property.getRent(5, 4), prop.rent[4]*4);
        });
    });

    describe("#railroadTests", function() {
        const name = "short line";
        const spot = {
                        "type": "transportation",
                        "quality": "railroad",
                        "rent": [25, 50, 100, 200],
                        "mortgage": 100,
                        "forward": ["chance middle east", "reverse"],
                        "backward": ["pennsylvania ave", "biscayne ave"],
                        "side": [3],
                        "track": [1, 0],
                        "below": ["sewage system"]
                    };

        const rr = new Railroad(name, spot);

        it("initializes a Railroad correctly", function() {
            assert.equal(rr.name, name);
            assert.equal(rr.kind, spot.type);
            assert.equal(rr.mortgageValue, spot.mortgage);
            assert.equal(rr.forward, spot.forward);
            assert.equal(rr.below, spot.below);
            assert.equal(rr.rent, spot.rent);
            assert.equal(rr.group, spot.quality);
            assert.equal(rr.cost, 2*spot.mortgage);
            assert.equal(rr.getValue(), rr.cost);
            assert(!rr.hasTrainDepot);
            assert.equal(rr.trainDepotPrice, 100);
        });

        it("charges rent correctly", function() {
            assert.equal(rr.getRent(0), spot.rent[0]); // just in case a typo comes from above
            assert.equal(rr.getRent(1), spot.rent[0]);
            assert.equal(rr.getRent(2), spot.rent[1]);
            assert.equal(rr.getRent(4), spot.rent[3]);
        });

        it("handles mortgages correctly", function() {
            assert(rr.mortgage());
            assert.equal(rr.getRent(3), 0);
            assert.equal(rr.getValue(), spot.mortgage);
            assert(!rr.addTrainDepot());
            assert.equal(rr.getRent(2), 0);
            assert.equal(rr.getValue(), spot.mortgage);
            assert(rr.unmortgage());
            assert.equal(rr.getValue(), 2*spot.mortgage);
        })

        it("handles train depots correctly", function() {
            assert(rr.addTrainDepot());
            assert.equal(rr.getRent(1), 2*spot.rent[0]);
            assert.equal(rr.getRent(4), 2*spot.rent[3]);
            assert.equal(rr.getValue(), 2*spot.mortgage+rr.trainDepotPrice);

            assert(rr.removeTrainDepot());
            assert.equal(rr.getRent(3), spot.rent[2]);
            assert.equal(rr.getValue(), 2*spot.mortgage);
        });

    });

    describe("#cabCompanyTests", function() {
        const name = "ute cab co";
        const spot = {
                        "type": "transportation",
                        "quality": "cab",
                        "rent": [30, 60, 120, 240],
                        "mortgage": 150,
                        "forward": ["birthday gift"],
                        "backward": ["sewage system"],
                        "side": [3],
                        "track": [1],
                        "above": ["chance middle east"]
                     };

        const cc = new CabCompany(name, spot);

        it("initializes a CabCompany correctly", function() {
            assert.equal(cc.name, name);
            assert.equal(cc.kind, spot.type);
            assert.equal(cc.mortgageValue, spot.mortgage);
            assert.equal(cc.forward, spot.forward);
            assert.equal(cc.below, spot.below);
            assert.equal(cc.rent, spot.rent);
            assert.equal(cc.group, spot.quality);
            assert.equal(cc.cost, 2*spot.mortgage);
            assert.equal(cc.getValue(), 2*spot.mortgage);
            assert(!cc.hasCabStand);
            assert.equal(cc.cabStandPrice, 150);
        });

        it("charges rent correctly", function() {
            assert.equal(cc.getRent(0), spot.rent[0]); // just in case a typo comes from above
            assert.equal(cc.getRent(1), spot.rent[0]);
            assert.equal(cc.getRent(2), spot.rent[1]);
            assert.equal(cc.getRent(4), spot.rent[3]);
        });

        it("handles mortgages correctly", function() {
            assert(cc.mortgage());
            assert.equal(cc.getRent(3), 0);
            assert.equal(cc.getValue(), spot.mortgage);
            assert(!cc.addCabStand());
            assert.equal(cc.getRent(2), 0);
            assert.equal(cc.getValue(), spot.mortgage);
            assert(cc.unmortgage());
            assert.equal(cc.getValue(), 2*spot.mortgage);
        })

        it("handles cab stands correctly", function() {
            assert(cc.addCabStand());
            assert.equal(cc.getRent(1), 2*spot.rent[0]);
            assert.equal(cc.getRent(4), 2*spot.rent[3]);
            assert.equal(cc.getValue(), 2*spot.mortgage+cc.cabStandPrice);

            assert(cc.removeCabStand());
            assert.equal(cc.getRent(3), spot.rent[2]);
            assert.equal(cc.getValue(), 2*spot.mortgage);
        });
    });

    describe("#propertyGroupTests", function() {
        const player1 = new Player('Dude', 'go', 2);

        const pgroup1 = new PropertyGroup(0);
        const bisc = new HouseProperty("biscayne ave", {"type": "property","quality": 0,"rent": [11, 55, 160, 475, 650, 800, 1300],"mortgage": 75,"house": 50,"forward": ["short line"],"backward": ["miami ave"],"side": [3],"track": [0],"below": ["pennsylvania ave"]});
        pgroup1.addProperty(bisc);
        pgroup1.addProperty(new HouseProperty("miami ave", {"type": "property","quality": 0,"rent": [9, 45, 120, 350, 500, 700, 1200],"mortgage": 65,"house": 50,"forward": ["biscayne ave"],"backward": ["holland tunnel ne"],"side": [3],"track": [0],"below": ["community chest middle east"]}));
        pgroup1.addProperty(new HouseProperty("florida ave", {"type": "property","quality": 0,"rent": [9, 45, 120, 350, 500, 700, 1200],"mortgage": 65,"house": 50,"forward": ["holland tunnel ne"],"backward": ["chance inner ne"],"side": [2],"track": [0],"below": ["ventnor ave"]}));

        const rrgroup = new PropertyGroup(22);
        rrgroup.addProperty(new Railroad("reading railroad", {"type": "railroad","quality": 22,"rent": [25, 50, 100, 200],"mortgage": 100,"forward": ["oriental ave", "esplanade ave"],"backward": ["income tax", "checker cab co"],"side": [0],"track": [1, 2],"above": ["telephone company"]}));
        rrgroup.addProperty(new Railroad("pennsylvania railroad", {"type": "railroad","quality": 22,"rent": [25, 50, 100, 200],"mortgage": 100,"forward": ["st james pl", "fifth ave"],"backward": ["virginia ave", "newbury st"],"side": [1],"track": [1, 0],"below": ["chance outer west"]}));
        rrgroup.addProperty(new Railroad("b&o railroad", {"type": "railroad","quality": 22,"rent": [25, 50, 100, 200],"mortgage": 100,"forward": ["atlantic ave", "community chest outer north"],"backward": ["illinois ave", "yellow cab co"],"side": [2],"track": [1, 2],"above": ["gas company"]}));
        rrgroup.addProperty(new Railroad("short line", {"type": "railroad","quality": 22,"rent": [25, 50, 100, 200],"mortgage": 100,"forward": ["chance middle east", "reverse"],"backward": ["pennsylvania ave", "biscayne ave"],"side": [3],"track": [1, 0],"below": ["sewage system"]}));
    
        it('sets an owner correctly', function() {
            pgroup1.setOwner(bisc, player1);
            assert.equal(bisc.owner, player1);
        })

        it('evenly adds houses in a monopoly', function() {
            pgroup1.properties.forEach(p => {
                assert.equal(pgroup1.setOwner(p, player1), 0);
            });
            
            pgroup1.upgrade(bisc);
            assert.equal(bisc.houses, 1);
            pgroup1.upgrade(bisc);
            pgroup1.upgrade(bisc);

            pgroup1.properties.forEach(p => {
                assert.equal(p.houses, 1);
            });

            pgroup1.upgrade(bisc);
            assert.equal(bisc.houses, 2);
        });

        it('allows you to go up to hotels in a monopoly', function() {
            for(let i = 0; i < 14; i++) {
                pgroup1.upgrade(bisc);
            }

            assert.equal(pgroup1.upgrade(bisc), 'false');
            assert.equal(bisc.houses, 6)
            pgroup1.properties.forEach(p => {
                assert.equal(p.houses, 6);
            });
        });

        it('loses houses after losing the monopoly', function() {
            assert.equal(pgroup1.setOwner(bisc, null), 10); // loses 10 houses
            pgroup1.properties.forEach(p => {
                if(p !== bisc) {
                    assert.equal(p.houses, 4);
                }
            });
            assert.equal(bisc.houses, 0);
        });

        it('does not add houses to properties not part of monopoly/majority', function() {
            pgroup1.upgrade(bisc);
            assert.equal(bisc.houses, 0);
            pgroup1.properties.forEach(p => {
                if(p !== bisc) {
                    assert.equal(p.houses, 4);
                }
            });
        });

        it('redistributes houses after gaining last property', function() {
            pgroup1.setOwner(bisc, player1);
            assert.equal(bisc.houses, 3);
        });

        it('loses all houses after losing majority', function() {
            assert.equal(pgroup1.setOwner(bisc, new Player('derp', 'go', 2)), 0);
            pgroup1.properties.forEach(p => {
                if(p !== bisc) {
                    assert.equal(p.houses, 4);
                }
            });
            assert.equal(pgroup1.setOwner(pgroup1.properties[1], new Player('hi', 'ad', 1)), 8);
            pgroup1.properties.forEach(p => {
                assert.equal(p.houses, 0);
            });
        });

        it('sets a different priority for rebalancing', function() {
            pgroup1.properties.forEach(p => {
                assert.equal(pgroup1.setOwner(p, player1), 0);
            });
            // index 0 should have been bisc
            let otherOrder = [pgroup1.properties[2], pgroup1.properties[1], bisc];
            assert(pgroup1.setPriority(otherOrder));
            bisc.houses = 4;
            assert.equal(pgroup1.rebalanceHouses(), 0);
            assert.equal(bisc.houses, 1);
        });

        it('transfers all ownership with no loss', function() {
            for(let i = 0; i < 18; i++) {
                pgroup1.upgrade(bisc);
            }
            assert.equal(pgroup1.transferAllOwnership(player1, new Player('baby', 'jail', 3)), 0);
            pgroup1.properties.forEach(p => {
                assert.equal(p.houses, 6);
            });
        });

        it('should add houses according to a legal house map', function() {
            pgroup1.transferAllOwnership(pgroup1.getProperty('biscayne ave').owner, player1);
            let mapper = {'biscayne ave': 3, 'miami ave': 2, 'florida ave': 3}
            let delta = pgroup1.setHouses(player1, mapper);
            let expected = {'biscayne ave': -3, 'miami ave': -4, 'florida ave': -3}
            assert.deepEqual(delta, expected);

            mapper['miami ave'] = 4;
            mapper['something'] = 2;
            delta = pgroup1.setHouses(player1, mapper);
            expected = {'biscayne ave': 0, 'miami ave': 2, 'florida ave': 0}
            assert.deepEqual(delta, expected);

            mapper = {'biscayne ave': 5, 'miami ave': 6, 'florida ave': 6};
            delta = pgroup1.setHouses(player1, mapper);
            expected = {'biscayne ave': 2, 'miami ave': 2, 'florida ave': 3}
            assert.deepEqual(delta, expected);

            // rebalances and only lets max of 4 on miami and florida, no changes possible
            pgroup1.setOwner(pgroup1.getProperty('biscayne ave'), new Player('cat', 'dude', 7));
            mapper = {'biscayne ave': 5, 'miami ave': 6, 'florida ave': 6, 'yo dude': -1, "that thing": 2};
            delta = pgroup1.setHouses(player1, mapper);
            expected = {'biscayne ave': 0, 'miami ave': 0, 'florida ave': 0}
            assert.deepEqual(delta, expected);

            // only actually can change florida to 3
            mapper = {'biscayne ave': 2, 'miami ave': 6, 'florida ave': 3};
            delta = pgroup1.setHouses(player1, mapper);
            expected = {'biscayne ave': 0, 'miami ave': 0, 'florida ave': -1}
            assert.deepEqual(delta, expected);

            // doesn't own any of it, can't change anything
            pgroup1.setOwner(pgroup1.getProperty('florida ave'), new Player('dog', 'wow wow', 7));
            mapper = {'biscayne ave': 0, 'miami ave': 1, 'florida ave': 0};
            delta = pgroup1.setHouses(player1, mapper);
            expected = {'biscayne ave': 0, 'miami ave': 0, 'florida ave': 0}
            assert.deepEqual(delta, expected);
        });

    });
});