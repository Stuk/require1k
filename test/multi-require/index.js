var a = require("./a"); var b = require("./b");
assert(a === "a", "first require on a line should run");
assert(b === "b", "second require on a line should run");
