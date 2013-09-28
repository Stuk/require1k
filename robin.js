/*jshint node:false */
(function (global) {
    var MODULES = {};

    // By using a named "eval" most browsers will execute in the global scope.
    // http://www.davidflanagan.com/2010/12/global-eval-in.html
    // Unfortunately execScript doesn't always return the value of the evaluated expression (at least in Chrome)
    var globalEval = eval;
    // For Firebug evaled code isn't debuggable otherwise
    // http://code.google.com/p/fbug/issues/detail?id=2198
    if (global.navigator && global.navigator.userAgent.indexOf("Firefox") >= 0) {
        globalEval = new Function("_", "return eval(_)");
    }

    var __FILE__String = "__FILE__",
        DoubleUnderscoreString = "__",
        globalEvalConstantA = "(function ",
        globalEvalConstantB = "(require, exports, module) {",
        globalEvalConstantC = "//*/\n})\n//@ sourceURL=";


    var head = document.querySelector("head"),
        baseElement = document.createElement("base"),
        relativeElement = document.createElement("a");

    baseElement.href = "";

    function resolve(base, relative) {
        var currentBaseElement = head.querySelector("base");
        if (!currentBaseElement) {
            head.appendChild(baseElement);
            currentBaseElement = baseElement;
        }
        base = String(base);
        if (!/^[\w\-]+:/.test(base)) { // isAbsolute(base)
            throw new Error("Can't resolve from a relative location: " + JSON.stringify(base) + " " + JSON.stringify(relative));
        }
        var restore = currentBaseElement.href;
        currentBaseElement.href = base;
        relativeElement.href = relative;
        var resolved = relativeElement.href;
        currentBaseElement.href = restore;
        if (currentBaseElement === baseElement) {
            head.removeChild(currentBaseElement);
        }
        return resolved;
    }

    function getMain(scriptName) {
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
        this.location = location;
    }
    // TODO move into function for better compression?
    Module.parseDependencies = function (text) {
        var o = {};
        String(text).replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
            o[id] = true;
        });
        return Object.keys(o);
    };
    Module.prototype = {
        load: function (callback) {
            var self = this;
            var location = self.location;

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
                throw new Error("Cannnot load " + location);
            };
            request.open("GET", location, true);
            request.send();
        },
        deepLoad: function (callback) {
            var self = this;
            self.load(function () {
                var deps = self.dependencies = Module.parseDependencies(self.text);
                if (deps.length) {
                    getModule(resolve(self.location, deps[0])).deepLoad(function () {
                        callback();
                    });
                } else {
                    callback();
                }
            });
        },
        makeRequire: function () {
            var self = this;
            return function require (id) {
                var topId = resolve(self.location, id);
                var module = MODULES[topId];
                if (!module) {
                    throw new Error("Cannot find module '" + id + "'");
                }
                return module.getExports();
            };
        },
        getExports: function () {
            if (this.exports) {
                return this.exports;
            }

            var factory;
            // Here we use a couple tricks to make debugging better in various browsers:
            // TODO: determine if these are all necessary / the best options
            // 1. name the function with something inteligible since some debuggers display the first part of each eval (Firebug)
            // 2. append the "//@ sourceURL=location" hack (Safari, Chrome, Firebug)
            //  * http://pmuellr.blogspot.com/2009/06/debugger-friendly.html
            //  * http://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/
            //      TODO: investigate why this isn't working in Firebug.
            // 3. set displayName property on the factory function (Safari, Chrome)
            var displayName = __FILE__String+this.location.replace(/\.\w+$|\W/g, DoubleUnderscoreString);

            try {
                factory = globalEval(globalEvalConstantA+displayName+globalEvalConstantB+this.text+globalEvalConstantC+this.location);
            } catch (exception) {
                exception.message = exception.message + " in " + this.location;
                throw exception;
            }

            factory.displayName = displayName;

            this.require = this.makeRequire();
            this.exports = {};

            factory.call(
                void 0, // this (defaults to global)
                this.require, // require
                this.exports, // exports
                this // module
            );

            return this.exports;
        }
    };

    var main = getMain();
    if (!main) {
        throw new Error("No data-main attribute found on any script elements");
    }
    var mainModule = getModule(main);
    mainModule.deepLoad(function () {
        mainModule.getExports();
    });

}(window));
