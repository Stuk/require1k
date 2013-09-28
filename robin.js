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

    function getMain() {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var main = script.getAttribute("data-main");
            if (main) {
                return resolve(location.href, main);
            }
        }
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
        String(text).replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
            o[id] = true;
        });
        return Object.keys(o);
    };
    Module.prototype = {
        L: function (callback) {
            var self = this;
            var location = self.l;

            if (self.loading || self.loaded) {
                callback();
            }
            self.loading = true;

            var request = new XMLHttpRequest();
            request.onload = function () {
                delete self.loading;
                self.loaded = true;
                if (request.status === 200 || (request.status === 0 && request.responseText)) {
                    self.text = request.responseText;
                    return callback();
                }
            };
            request.open("GET", location, true);
            request.send();
        },
        D: function (callback) {
            var self = this;
            self.L(function () {
                var deps = self.dependencies = Module.p(self.text);
                if (deps.length) {
                    getModule(resolve(self.l, deps[0])).D(function () {
                        callback();
                    });
                } else {
                    callback();
                }
            });
        },
        R: function () {
            var self = this;
            return function require (id) {
                var topId = resolve(self.l, id);
                var module = MODULES[topId];
                // if (!module) {
                //     throw new Error("Can't find " + id);
                // }
                return module.E();
            };
        },
        E: function () {
            var self = this;
            if (self.exports) {
                return self.exports;
            }

            var factory;
            try {
                factory = globalEval("(function(require, exports, module){"+self.text+"\n})");
            } catch (exception) {
                exception.message += " in " + self.l;
                throw exception;
            }

            self.r = self.R();
            self.exports = {};

            factory.call(
                void 0, // this (defaults to global)
                self.r, // require
                self.exports, // exports
                self // module
            );

            return self.exports;
        }
    };

    var main = getMain();
    // if (!main) {
    //     throw new Error("No data-main found");
    // }
    var mainModule = getModule(main);
    mainModule.D(function () {
        mainModule.E();
    });

}(window));
