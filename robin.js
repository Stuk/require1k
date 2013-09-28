/*jshint node:false */
R = (function (global, document) {
    var MODULES = {};

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

    function R(id, callback) {
        var mainModule = getModule(resolve(location, id));
        mainModule.D(function () {
            callback(mainModule.E());
        });
    }

    var script = document.querySelector("script[data-main]");
    if (script) {
        // we don't care about calling the callback, but need one to avoid
        // an error. `btoa` is the shortest global function we can call
        // that won't throw an error and has no side effects
        R(script.getAttribute("data-main"), btoa);
    }

    return R;

}(window, document));
