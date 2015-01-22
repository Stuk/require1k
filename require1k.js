/*jshint node:false, -W082, -W017 */
R = (function (global, document, undefined) {
    // Each module has the following properties (shorted to one letter to aid compression)
    // - g: booleany, loadinG, truthy if this module has been requested for loading
    //      before. Used to prevent the same module being loaded twice
    // - l: string, Location, the url location of this module
    // - t: string, Text, the text content of the module
    // - e: booleany, Error, truthy if there was an error (probably a 404) loading the module
    // - n: module object, Next, instead of using this module, use the object
    //      pointed to by this property. Used for dependencies in other packages
    // - f: factory, a function to use instead of eval'ing module.t
    // - exports, object, the exports of the module!
    var MODULES = {};

    // By using a named "eval" most browsers will execute in the global scope.
    // http://www.davidflanagan.com/2010/12/global-eval-in.html
    var globalEval = eval;

    // this variable is reused for a number of things to reduce the repetition
    // of strings. In the end is becomes "exports"
    var tmp = "createElement",
        baseElement = document[tmp]("base"),
        relativeElement = document[tmp]("a");
    document.head.appendChild(baseElement);

    // `resolve` and `getModule` combined into one function to save bytes
    function resolveAndGetModule(base, relative, resolved) {
        baseElement.href = base;
        // If the relative url begins with a letter (and not a "."), then it's
        // in node_modules
        relativeElement.href = relative.replace(/^(\w)/, "./node_modules/$1");
        resolved = relativeElement.href + ".js";
        baseElement.href = "";
        return (MODULES[resolved] = MODULES[resolved] || {l: resolved});
    }

    function deepLoad(module, callback, parentLocation, path, dep) {
        if (module.g) {
            return callback(module.e, module);
        }

        var location = module.g = module.l;

        var request = new XMLHttpRequest();
        request.onload = function (deps, count) {
            if (request.status == 200 || module.t) {
                deps = [];
                (module.t = module.t || request.response).replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
                    deps.push(id);
                });
                count = deps.length;
                function loaded() {
                    // We call loaded straight away below in case there
                    // are no dependencies. Putting this check first
                    // and the decrement after saves us an `if` for that
                    // special case
                    if (!count--) {
                        callback(undefined, module);
                    }
                }
                deps.map(function (dep) {
                    deepLoad(
                        resolveAndGetModule(module.l, dep),
                        loaded,
                        // If it doesn't begin with a ".", then we're searching
                        // node_modules, so pass in the info to make this
                        // possible
                        dep[0] != "." ? location : undefined ,
                        "/../",
                        dep
                    );
                });
                loaded();
            } else {
                module.e = request;
                // parentLocation is only given if we're searching in node_modules
                if (parentLocation) {
                    // Recurse up the tree trying to find the dependency
                    // (generating 404s on the way)
                    deepLoad(module.n = resolveAndGetModule(parentLocation + (path += "../"), dep), callback, parentLocation, path, dep);
                } else {
                    callback(request, module);
                }
            }
        };
        if (module.t) {
            request.onload();
        } else {
            request.open("GET", location, true);
            request.send();
        }
    }

    function getExports(module) {
        if (module.n) {
            return getExports(module.n);
        }

        if (!module[tmp]) {
            (module.f || globalEval("(function(require,exports,module){" + module.t + "\n})//# sourceURL=" + module.l))(
                function require (id) {
                    return getExports(resolveAndGetModule(module.l, id));
                }, // require
                module[tmp] = {}, // exports
                module // module
            );
        }

        return module[tmp];
    }

    function R(id, callback) {
        // If id has a `call` property, it is a function, so make a module with
        // a factory
        deepLoad(id.call ? {l: "", t: "" + id, f: id} : resolveAndGetModule("", id), function (err, module) {
            id = getExports(module);
            if (callback) {
                callback(err, id);
            }
        });
    }

    tmp = document.querySelector("script[data-main]");
    if (tmp) {
        R(tmp.getAttribute("data-main"));
    }
    tmp = "exports";

    return R;

}(this, document));
