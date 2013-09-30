# CommonJS `require` in 1k

This project implements a minimal, and yet practically useful, CommonJS/Node.js `require` module loader in under 1000 bytes.

## Usage

In your modules you can use the `require` function, `exports` object and `module.exports` object as you would in Node. There are two ways to kick off the require system:

### script `data-main` attribute

```html
<script src="robin.js" data-main="./index"></script>
```

On start Robin will search for the first `<script>` tag with a `data-main` attribute. If found the named module will be resolved against the location of the html file, asynchronously loaded and then executed.

### global `R(id, [callback(err, exports)])` function

```html
<script>
R("./index", function (err, index) {
    if (err) {
        console.error(err.statusText);
        return;
    }
    // use the exports object as needed
});
</script>
```

Robin also adds a global function, `R`, that takes a module id and a optional callback. The named module is resolved against the location of the html file. If there was an error the callback gets passed the XMLHttpRequest object that failed as the first argument, otherwise the `exports` of the module are passed as the second argument. The callback may be called synchronously if the module is already in the internal module cache.

## Features

* Asynchronous dependency analysis and loading phase
* Synchronous `require` in modules
* `exports` object
* `module.exports` object
* Loads cross-package dependencies by searching `node_modules` (see Limitations)
* Handles circular dependencies

## Limitations

* `package.json` files are not loaded, and so the `"main"` property is ignored. Modules inside packages must be requested by their full path, e.g. `var _ = require("underscore/underscore");`
* Cross-package dependencies are found by walking up the URL path until a successful request is returned. This means that
    * loading cross-package dependencies is slow because requests are made sequentially until the module is found
    * 404 errors appear in the console
* Missing cross-package dependencies will exceed the stack size and halt script execution.
* Internal (with external consequences): callback functions are called synchronously if the data is already available
* Does not load `.json` files

## License

MIT
