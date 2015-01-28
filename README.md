# CommonJS `require` in 1k, with no build needed

This project implements a minimal, and yet practically useful, CommonJS/Node.js `require` module loader for the browser in under 1000 bytes.

## Features

* Synchronous `require` in modules
* `exports` and `module.exports` object
* Works with npm, by searching `node_modules` directories (see Limitations)
* Handles circular dependencies
* It's 1k!

## Examples

* [Marked](examples/marked) markdown parser
* [React](examples/react) framework

## Usage

In your modules you can use the `require` function, `exports` object and `module.exports` object as you would in Node. There are two ways to kick off the require system:

### script `data-main` attribute

```html
<script src="require1k.min.js" data-main="./index"></script>
```

On start require1k will search for the first `<script>` tag with a `data-main` attribute. If found the named module will be resolved against the location of the html file, asynchronously loaded and then executed.

### global `R(function(require, module, exports), [callback(err, exports)])` function

```html
<script>
R(function (require, module, exports) {
    var index = require("./index");
    exports.hello = "World!"
}, function (err, exports) {
    if (err) {
        console.error(err.statusText);
        return;
    }

    console.log(exports.hello)
});
</script>
```

Require1k also adds a global function, `R`, that accepts either a function or a module ID and an optional `callback`. When given a function it will load all the dependencies of the function and then execute it. If there was an error the callback gets passed the XMLHttpRequest object that failed as the first argument. It also gets passed the `exports` of the function, which you may find useful.

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

Alternatively you can provide a module id and a optional callback. The named module is resolved against the location of the HTML file. If there was an error the callback gets passed the XMLHttpRequest object that failed as the first argument, otherwise the `exports` of the module are passed as the second argument. The callback may be called synchronously if the module is already in the internal module cache.

## Limitations

* `package.json` files are not loaded, and so the `"main"` property is ignored. Modules inside packages must be requested by their full path, e.g. `var _ = require("underscore/underscore");`
* Cross-package dependencies are found by walking up the URL path until a successful request is returned. This means that
    * loading cross-package dependencies is slow because requests are made sequentially until the module is found
    * 404 errors appear in the console
* Missing cross-package dependencies will exceed the stack size and halt script execution.
* Callback functions are called synchronously if the data is already available. This releases [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony), but hey, it's 1k.
* Does not load `.json` files

## License

BSD
