console.log("comments");

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

// this is still problematic if uncommented:
// console.log('require("./should-not-load")')

assert(
    (require)("./should-not-load") !== 4,
    "Should not load modules from commented out code and lookalikes"
);
