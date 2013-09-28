console.log("loaded index.js");

var second = require("./second");
console.log(second.thing);

R("./three", function (exports) {
    console.log("R callback", exports);
});

require("dep/index");
