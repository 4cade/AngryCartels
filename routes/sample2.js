var Person = function(startAge) {
    var that = Object.create(Person.prototype);
    var person = {age: startAge};

    // should not be testable
    var calcMult = function(a, b) {
        return a*b;
    }

    // should be testable
    that.birthday = function() {
        return person.age + 1;
    }

    // should be testable
    that.getAge = function() {
        return person.age;
    }

    Object.freeze(that);
    return that;
}