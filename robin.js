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
            MODULES[location] = {l: location};
        }
        return MODULES[location];
    }

    function deepLoad(module, callback) {
        if (module.g) {
            return callback();
        }
        module.g = true;

        var location = module.l;

        var request = new XMLHttpRequest();
        request.onload = function () {
            if (request.status == 200) {
                var text = module.text = request.responseText;
                var o = {};
                text.replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
                    o[id] = true;
                });
                var deps = Object.keys(o);
                var count = deps.length;
                function loaded() {
                    // We call loaded straight away below in case there
                    // are no dependencies. Putting this check first
                    // and the decrement after saves us an `if` for that
                    // special case
                    if (!count--) {
                        callback();
                    }
                }
                for (var i = 0; i < deps.length; i++) {
                    deepLoad(getModule(resolve(module.l, deps[i])), loaded);
                }
                loaded();
            }
        };
        request.open("GET", location + ".js", true);
        request.send();
    }

    function getExports(module) {
        if (module.exports) {
            return module.exports;
        }

        globalEval("(function(require, exports, module){"+module.text+"\n})")(
            function require (id) {
                return getExports(MODULES[resolve(module.l, id)]);
            }, // require
            module.exports = {}, // exports
            module // module
        );

        return module.exports;
    }

    function R(id, callback) {
        var mainModule = getModule(resolve(location, id));
        deepLoad(mainModule, function () {
            callback(getExports(mainModule));
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
