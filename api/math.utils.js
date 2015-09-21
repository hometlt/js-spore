
// Returns a random number between min (inclusive) and max (exclusive)
Math.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
}

Math.distance = function(x1,y1,x2,y2){

    return Math.pow(Math.pow(x1-  x2,2) + Math.pow(y1 - y2,2),0.5);
}

Math.generateUUID = function() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
};

Math.generateEmptyUUID = function() {
    return '00000000-0000-0000-0000-000000000000';
};

Math.gaussRand = function() {
    var s = 2*Math.random()-1;
    var m = 2*Math.random()-1;
    var u = s*s + m*m;
    if(u == 0 || u > 1) return Math.gaussRand();
    var k = Math.sqrt(-2*Math.log(u)/u);
    return s*m;
};

