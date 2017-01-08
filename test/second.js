console.log("loaded second");

exports.thing = "asd";

require("./index");
console.log(require("./three"));
