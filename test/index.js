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

console.log("should not load");
/*
  foo
  require("./should-not-load");
  bar
*/

// require("./should-not-load");
function $require() {}
function _require() {}
function irequire() {}
var o = {require: function(){}};

$require("./should-not-load");
_require("./should-not-load");
irequire("./should-not-load");
o.require("./should-not-load");

assert(
    eval('requ' + 'ire("./should-not-load")') !== 4,
    "Should not load modules from commented out code and lookalikes"
);
