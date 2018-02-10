console.log("loaded index.js");

var second = require("./second");
assert(second.thing === "asd", "required export should be correct");

R("./three", function (err, exports) {
    console.log("R callback");
    assert(err === undefined, "err in callback should be undefined");
    assert(exports === "three", "exports in callback should be correct");
});

require("dep/index");

require("./multi-require/index");

require("./comment/index");
