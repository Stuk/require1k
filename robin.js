/*jshint node:false */
(function (global) {
    var MODULES = {};
    var document = global.document;

    // By using a named "eval" most browsers will execute in the global scope.
    // http://www.davidflanagan.com/2010/12/global-eval-in.html
    var globalEval = eval;

    var head = document.head,
        baseElement = document.createElement("base"),
        relativeElement = document.createElement("a");
    head.appendChild(baseElement);


    baseElement.href = "";

    function resolve(base, relative) {
        baseElement.href = base;
        relativeElement.href = relative;
        var resolved = relativeElement.href;
        baseElement.href = "";
        return resolved;
    }

    function getModule(location) {
        if (!MODULES[location]) {
            MODULES[location] = new Module(location);
        }

        return MODULES[location];
    }

    function Module(location) {
        this.l = location;
    }
    Module.prototype = {
        D: function (callback) {
            var self = this;
            if (self.g) {
                return callback();
            }
            self.g = true;

            var location = self.l;

            var request = new XMLHttpRequest();
            request.onload = function () {
                if (request.status === 200) {
                    var text = self.text = request.responseText;
                    var o = {};
                    text.replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
                        o[id] = true;
                    });
                    var deps = Object.keys(o);
                    var count = deps.length;
                    function loaded() {
                        if (!count) {
                            callback();
                        }
                        count--;
                    }
                    for (var i = 0; i < deps.length; i++) {
                        getModule(resolve(self.l, deps[0])).D(loaded);
                    }
                    loaded();
                }
            };
            request.open("GET", location + ".js", true);
            request.send();
        },
        E: function () {
            var self = this;
            if (self.exports) {
                return self.exports;
            }

            globalEval("(function(require, exports, module){"+self.text+"\n})")(
                function require (id) {
                    return MODULES[resolve(self.l, id)].E();
                }, // require
                self.exports = {}, // exports
                self // module
            );

            return self.exports;
        }
    };

    var main;
    var scripts = document.scripts;
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        main = script.getAttribute("data-main");
        if (main) {
            main = resolve(location.href, main);
            break;
        }
    }
    // if (!main) {
    //     throw new Error("No data-main found");
    // }
    var mainModule = getModule(main);
    mainModule.D(function () {
        mainModule.E();
    });

}(window));
