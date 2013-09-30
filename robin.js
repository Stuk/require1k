/*jshint node:false, -W082, -W017 */
R = (function (global, document, undefined) {
    var MODULES = {};

    // By using a named "eval" most browsers will execute in the global scope.
    // http://www.davidflanagan.com/2010/12/global-eval-in.html
    var globalEval = eval;

    var tmp = "createElement",
        baseElement = document[tmp]("base"),
        relativeElement = document[tmp]("a");
    document.head.appendChild(baseElement);

    function resolve(base, relative, resolved) {
        baseElement.href = base;
        // If the relative url begins with a letter (and not a "."), then it's
        // in node_modules
        relativeElement.href = relative.replace(/^(\w)/, "./node_modules/$1");
        resolved = relativeElement.href;
        baseElement.href = "";
        return resolved;

    }

    // A module has the following properties (shorted to one letter to aid compression)
    // - g: booleany, loadinG, truthy if this module has been requested for loading
    //      before. Used to prevent the same module being loaded twice
    // - l: string, Location, the url location of this module
    // - t: string, Text, the text content of the module
    // - e: booleany, Error, truthy if there was an error (probably a 404) loading the module
    // - n: module object, Next, instead of using this module, use the object
    //      pointed to by this property. Used for dependencies in other packages
    // - exports, object, the exports of the module!
    function getModule(location) {
        return MODULES[location] = MODULES[location] || {l: location};
    }

    function deepLoad(module, callback, parentLocation, path, dep) {
        if (module.g) {
            return callback(module.e, module);
        }

        var location = module.g = module.l;

        var request = new XMLHttpRequest();
        request.onload = function (text, deps, count) {
            if (request.status == 200) {
                text = module.t = request.response;
                deps = {};
                text.replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
                    deps[id] = true;
                });
                deps = Object.keys(deps);
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
                        getModule(resolve(module.l, dep)),
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
                    deepLoad(module.n = getModule(resolve(parentLocation + (path += "../"), dep)), callback, parentLocation, path, dep);
                } else {
                    callback(request, module);
                }
            }
        };
        request.open("GET", location + ".js", true);
        request.send();
    }

    function getExports(module) {
        if (module.n) {
            return getExports(module.n);
        }

        if (!module[tmp]) {
            globalEval("(function(require,exports,module){"+module.t+"\n})")(
                function require (id) {
                    return getExports(MODULES[resolve(module.l, id)]);
                }, // require
                module[tmp] = {}, // exports
                module // module
            );
        }

        return module[tmp];
    }

    function R(id, callback) {
        deepLoad(getModule(resolve(location, id)), function (err, module) {
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
