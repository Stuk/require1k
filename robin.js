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
    // TODO move into function for better compression?
    Module.p = function (text) {
        var o = {};
        text.replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
            o[id] = true;
        });
        return Object.keys(o);
    };
    Module.prototype = {
        L: function (callback) {
            var self = this;
            var location = self.l;

            var request = new XMLHttpRequest();
            request.onload = function () {
                var text = request.responseText;
                if (request.status === 200 || (request.status === 0 && text)) {
                    self.text = text;
                    return callback();
                }
            };
            request.open("GET", location, true);
            request.send();
        },
        D: function (callback) {
            var self = this;
            if (self.g) {
                return callback();
            }
            self.g = true;

            self.L(function () {
                var deps = Module.p(self.text);
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
            });
        },
        R: function () {
            var self = this;
            return function require (id) {
                return MODULES[resolve(self.l, id)].E();
            };
        },
        E: function () {
            var self = this;
            if (self.exports) {
                return self.exports;
            }

            globalEval("(function(require, exports, module){"+self.text+"\n})")(
                self.R(), // require
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
