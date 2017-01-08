console.log("loaded second");

exports.thing = "asd";

require("./index");
assert(require("./three") === "three", "require should return exports")
