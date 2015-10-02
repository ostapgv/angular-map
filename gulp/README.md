# Gulp Tasks

## Browserify

[Browserify](www.browserify.org) lets you ``require('modules')`` and ``import`` ones. With the help of ``babelify`` we convert our future js to nowadays one.

Bundle function takes a boolean argument, whether it should watch or no. So there're 2 corresponding tasks:

```shell
gulp browserify
gulp browserify-watch
```

## Build

```shell
gulp build
```

Performes following tasks: ``'lint', 'html', 'images', 'fonts', 'misc'``
Results is ready to use, minified application in a ``dist`` folder.

### Other tasks

```shell
gulp styles
```

Pipes all ``.scss``, converts and autoprefixes it into css.

```shell
gulp injector:css:preprocessor
```

Gathers scss and injects it into app.scss after ``// injector`` statement.

```shell
gulp injector:css
```

Injects css to ``index.jade``

```shell
gulp injector:js
```

Injects js to ``index.jade``

```shell
gulp partials
```

Converts jade templates to html, compresses and creates angular ready ``templateCacheHtml.js


```shell
gulp html
```

Gathers, glues and minifies to ``index.html``

```shell
gulp images
gulp fonts
gulp misc
```

Prepares appropriate things for production.

## Consolidate
```shell
gulp consolidate
```
Takes all ``.jade`` files and creates it's ``.html`` version in appropriate location.

## Docs
```shell
gulp docs
```

Contains sass, js and project wide documentation tasks which would be stored to ``docs`` folder.

## E2E tests
```shell
gulp protractor
```

Runs protractor based tests with help of Mocha.

## Lint

```shell
gulp lint
```
Lints js, json, scss files.

```shell
gulp lint:js
gulp lint:json
gulp lint:scss
gulp lint:tests
```
Lints appropriate stuff.

## Routes

```shell
gulp routes
```

Opens a phantomjs browser sync instance and runs ``npm fetchAngularRoutes`` to generate  ``server/angular-routes.json`` later to be used for server middlewares.

## Server

Contains tests, routes and other specific tasks as long as common ones.

```shell
gulp serve:loopback
```
Starts loopback node.js server with the help of nodemon. Mind to have a mongodb instance running in your system. Creates a browsersync instance and watches for file changes.

```shell
gulp serve:static
```
Creates a static server through browsersync instance. Watches for file changes.

## Unit tests

```shell
gulp tests
```

Starts unit tests using Karma (``test/karma.conf``) and Mocha.

## Watch

```shell
gulp watch
```
Watches for specified file changes. Used by server tasks.

## Wiredep

```shell
gulp wiredep
```

Wiredeps bower components assets. Used by build tasks.
