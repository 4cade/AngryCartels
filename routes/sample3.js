// commented out parts illustrate another valid way to define object

var Student = function(numClasses) {
    //var student = {classes: numClasses};
    this.classes = numClasses;

    // should not be testable
    var calcDiff = function(m, n) {
        return m - n;
    }

    // should be testable
    this.addClass = function() {
        //return student.classes + 1;
        return this.classes + 1;
    }

    // should be testable
    this.getNumClasses = function() {
        //return student.classes;
        return this.classes;
    }

}