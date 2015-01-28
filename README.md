# CommonJS `require` for the browser in 1k, with no build needed

This project implements a minimal, and yet practically useful, CommonJS/Node.js `require` module loader for the browser in under 1000 bytes.

## Features

* Synchronous `require` in modules
* `exports` and `module.exports` object
* Loaded modules are debuggable as normal in Chrome, Opera 15+, Firefox 36+ and Safari with `debugger` statement. (IE to be tested.)
* Works with npm, by searching `node_modules` directories (see Limitations)
* Handles circular dependencies
* Just runs, no need to build your JavaScript
* A pretty rich API, considering:
* it's 1k!

## Examples

* [Simple](examples/simple)
* [Marked](examples/marked) markdown parser
* [React](examples/react) framework (!!)

## Usage

In your modules you can use the `require` function, `exports` object and `module.exports` object as you would in Node. There are two ways to kick off the require system:

### script `data-main` attribute

```html
<script src="require1k.min.js" data-main="./index"></script>
```

On start require1k will search for the first `<script>` tag with a `data-main` attribute. If found the named module will be resolved against the location of the html file, asynchronously loaded and then executed.

### global `R(func, callback)`

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

### global `R(moduleId, callback)`

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

Alternatively you can provide a module ID and a optional `callback`. The named module is resolved against the location of the HTML file. If there was an error the callback gets passed the XMLHttpRequest object that failed as the first argument, otherwise the `exports` of the module are passed as the second argument. The callback may be called synchronously if the module is already in the internal module cache.

## Limitations

* `package.json` files are not loaded, and so the `"main"` property is ignored. Modules inside packages must be requested by their full path, e.g. `var _ = require("underscore/underscore");`
* Cross-package dependencies are found by walking up the URL path until a successful request is returned. This means that
    * loading cross-package dependencies is slow because requests are made sequentially until the module is found
    * 404 errors appear in the console
* Missing cross-package dependencies will exceed the stack size and halt script execution.
* Callback functions are called synchronously if the data is already available. This releases [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony), but hey, it's 1k.
* Does not load `.json` files


## The point

The short answer: because it's a fun hack.

The long answer?

Using `<script>` tags to manage the dependencies of your "complex" web app makes for an unmaintainable mess.

Yet that's what most people are doing today, and even what a large number of articles currently being published *still* recommend. People are writing large and sophisticated apps and then wasting their time managing dependencies by hand! There's just no need for it.

Package management ensures you have a system for adding and updating libraries to your project. It means that you can easily check if your libraries are out of date, and see exactly what libraries your project depends on. It means that you don't have to go spelunking around the web to find the site where you can report an issue or download an update for this random file you have in your `js/` directory. But module management is even more important.

Module management is where you actually say "load this code for my app". And when you do this with a (multitude of) `<script>` tags on your page you can no longer isolate your code, and say "this is what this bit of code depends on". Every library you load is global. And what happens when you write some JavaScript that needs an extra library? You have to go back to this completely different file, and add something to the `HTML`. This is nonsense.

What each part of your app depends on should be explicit. It should not require editing an unrelated file just to depend on a third party module.

If you're writing a web app of any significant size today, you owe it to yourself to manage your dependencies correctly.

This is what I recommend:

* Use npm to manage your client side dependencies
* Use [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/) to bundle up your application

That's it.

(And yep, I've noticed the irony of saying this while telling people to embed require1k on a page. But this is just a joke. Kind of.)

## Thanks

This project was largely inspired by working on [Mr](https://github.com/montagejs/mr), a CommonJS module loader and companion bundler that definitely isn't 1k.

Thanks to [Tom Robinson](https://twitter.com/tlrobinson) for writing the original version, and [Kris Kowal](https://twitter.com/kriskowal) for teaching me so much.

## License

BSD
