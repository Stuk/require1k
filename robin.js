/*jshint node:false, -W082, -W017 */
R = (function (global, document, undefined) {
    var MODULES = {};

    // By using a named "eval" most browsers will execute in the global scope.
    // http://www.davidflanagan.com/2010/12/global-eval-in.html
    var globalEval = eval;

    var head = document.head,
        baseElement = document.createElement("base"),
        relativeElement = document.createElement("a");
    head.appendChild(baseElement);


    baseElement.href = "";

    function resolve(base, relative, resolved) {
        if (/^\./.test(relative)) {
            baseElement.href = base;
            relativeElement.href = relative;
            resolved = relativeElement.href;
            baseElement.href = "";
        } else {
            resolved = resolve(base, "./node_modules/" + relative);
        }
        return resolved;

    }

    // A module has the following properties (shorted to one letter to aid compression)
    // - g: boolean, loadinG, true if this module has been requested for loading
    //      before. Used to prevent the same module being loaded twice
    // - l: string, Location, the url location of this module
    // - t: string, Text, the text content of the module
    // - e: boolean, Error, true if there was an error (probably a 404) loading the module
    // - n: module object, Next, instead of using this module, use the object
    //      pointed to by this property. Used for dependencies in other packages
    // - exports, object, the exports of the module!
    function getModule(location) {
        return MODULES[location] || (MODULES[location] = {l: location});
    }

    function deepLoad(module, callback) {
        if (module.g) {
            return callback(module.e, module);
        }
        module.g = true;

        var location = module.l;

        var request = new XMLHttpRequest();
        request.onload = function (text, o) {
            if (request.status == 200) {
                text = module.t = request.response;
                o = {};
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
                        callback(undefined, module);
                    }
                }
                deps.forEach(function (dep) {
                    o = loaded;
                    if (!/^\./.test(dep)) {
                        // Recurse up the tree trying to find the dependency
                        // (generating 404s on the way)
                        text = "/../";
                        o = function (err, m) {
                            if (err) {
                                deepLoad(m.n = getModule(resolve(module.l + (text += "../"), dep)), o);
                            } else {
                                loaded();
                            }
                        };
                    }
                    deepLoad(getModule(resolve(module.l, dep)), o);
                });
                loaded();
            } else {
                callback(module.e = true, module);
            }
        };
        request.open("GET", location + ".js", true);
        request.send();
    }

    function getExports(module) {
        if (module.n) {
            return getExports(module.n);
        }
        if (module.exports) {
            return module.exports;
        }

        globalEval("(function(require, exports, module){"+module.t+"\n})")(
            function require (id) {
                return getExports(MODULES[resolve(module.l, id)]);
            }, // require
            module.exports = {}, // exports
            module // module
        );

        return module.exports;
    }

    function R(id, callback) {
        deepLoad(getModule(resolve(location, id)), function (_, module) {
            id = getExports(module);
            if (callback) {
                callback(id);
            }
        });
    }

    var script = document.querySelector("script[data-main]");
    if (script) {
        R(script.getAttribute("data-main"));
    }

    return R;

}(window, document));
