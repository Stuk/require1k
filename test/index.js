console.log("loaded index.js");

var second = require("./second");
console.log(second.thing);

R("./three", function (err, exports) {
    console.log("R callback", err, exports);
});

require("dep/index");
