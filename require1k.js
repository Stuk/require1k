/*jshint node:false, -W082, -W017 */
R = (function (document, undefined) {
    // Each module has the following properties (shorted to one letter to aid compression)
    // - g: booleany, loadinG, truthy if this module has been requested for loading
    //      before. Used to prevent the same module being loaded twice
    // - l: string, Location, the url location of this module
    // - t: string, Text, the text content of the module
    // - e: booleany, Error, truthy if there was an error (probably a 404) loading the module
    // - n: module object, Next, instead of using this module, use the object
    //      pointed to by this property. Used for dependencies in other packages
    // - f: function, Factory, a function to use instead of eval'ing module.t
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


    // Loads the given module and all of it dependencies, recursively
    // - module         The module object
    // - callback       Called when everything has been loaded
    // - parentLocation Location of the parent directory to look in. Only given
    // for non-relative dependencies
    // - id             The name of the dependency. Only used for non-relative
    // dependencies
    function deepLoad(module, callback, parentLocation, id) {
        // If this module is already loading then don't proceed.
        // This is a bug.
        // If a module is requested but not loaded then the module isn't ready,
        // but we callback as if it is. Oh well, 1k!
        if (module.g) {
            return callback(module.e, module);
        }

        var location = module.g = module.l;

        var request = new XMLHttpRequest();
        request.onload = function (deps, count) {
            if (request.status == 200 || module.t) {
                // Should really use an object and then Object.keys to avoid
                // duplicate dependencies. But that costs bytes.
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
                        resolveModuleOrGetExports(module.l, dep),
                        loaded,
                        // If it doesn't begin with a ".", then we're searching
                        // node_modules, so pass in the info to make this
                        // possible
                        dep[0] != "." ? location + "/../" : undefined,
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
                    deepLoad(
                        module.n = resolveModuleOrGetExports(parentLocation += "../", id),
                        callback,
                        parentLocation,
                        id
                    );
                } else {
                    callback(request, module);
                }
            }
        };

        // If the module already has text because we're using a factory
        // function, then there's no need to load the file!
        if (module.t) {
            request.onload();
        } else {
            request.open("GET", location, true);
            request.send();
        }
    }

    // Save bytes by combining two functions
    // - resolveModule which resolves a given relative path against the given
    //   base, and returns an existing or new module object
    // - getExports which returns the existing exports or runs the factory to
    //   create the exports for a module
    function resolveModuleOrGetExports(baseOrModule, relative, resolved) {
        // If 2 arguments are given, then we are resolving modules...
        if (relative) {
            baseElement.href = baseOrModule;
            // If the relative url begins with a letter (and not a "."), then it's
            // in node_modules
            relativeElement.href = relative.replace(/^(\w)/, "./node_modules/$1");
            resolved = relativeElement.href + ".js";
            baseElement.href = "";
            return (MODULES[resolved] = MODULES[resolved] || {l: resolved});
        }

        // ...otherwise we are getting the exports

        // Is this module is a redirect to another one?
        if (baseOrModule.n) {
            return resolveModuleOrGetExports(baseOrModule.n);
        }

        if (!baseOrModule[tmp]) {
            (baseOrModule.f || globalEval("(function(require,exports,module){" + baseOrModule.t + "\n})//# sourceURL=" + baseOrModule.l))(
                function require (id) {
                    return resolveModuleOrGetExports(resolveModuleOrGetExports(baseOrModule.l, id));
                }, // require
                baseOrModule[tmp] = {}, // exports
                baseOrModule // module
            );
        }

        return baseOrModule[tmp];
    }

    function R(id, callback) {
        // If id has a `call` property it is a function, so make a module with
        // a factory
        deepLoad(id.call ? {l: "", t: "" + id, f: id} : resolveModuleOrGetExports("", id), function (err, module) {
            id = resolveModuleOrGetExports(module);
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

}(document));
