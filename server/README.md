# Node Server

[LooBack](http://loopback.io/) is the server software used for this project.

> LoopBack is a highly-extensible, open-source Node.js framework

> * [Quickly create dynamic end-to-end REST APIs](http://loopback.io/#core).
> * [Connect devices and browsers](http://loopback.io/#juggler) to data and services.
> * Use [Android, iOS, and AngularJS SDKs](http://loopback.io/#sdks) to easily create client apps.
> * [Add-on components](http://loopback.io/#components) for push, file management, 3rd-party login, and geolocation.
> * Use [StrongLoop Arc](http://loopback.io/#arc) to visually edit, deploy, and monitor LoopBack apps.
> * [LoopBack API gateway](http://loopback.io/#gateway) acts an intermediary between API consumers (clients) and API providers to externalize, secure, and manage APIs.
> * Runs on-premises or in the cloud

## Express
The LoopBack core extends one the most popular Node web frameworks, [Express](http://expressjs.com). By leveraging Express, LoopBack server configuration concepts are familiar and easy to work with.

## Getting Started with LoopBack
The project includes the following LoopBack dependencies:

* [loopback](https://github.com/strongloop/loopback)
* [loopback-boot](https://github.com/strongloop/loopback-boot)
* [loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler)

Other Express middleware dependencies include:

* [compression](https://github.com/expressjs/compression)
* [errorhandler](https://github.com/expressjs/errorhandler) (development only)
* [express-session](https://github.com/expressjs/session)
* [morgan](https://github.com/expressjs/morgan)
* [ua-parser](https://github.com/tobie/ua-parser)

The StrongLoop command-line tool, `slc`, is also available for creating LoopBack applications and various components within LoopBack, it can easily be installed by running:

```sh
$ npm install -g strongloop
```

### Additional Reading
* [Installing StrongLoop](http://docs.strongloop.com/display/public/LB/Installing+StrongLoop)
* [Getting started with LoopBack](http://docs.strongloop.com/display/public/LB/Getting+started+with+LoopBack)

## LoopBack Concepts
Please review [LoopBack Core Concepts](http://docs.strongloop.com/display/public/LB/LoopBack+core+concepts) for a brief overview. Below you will find additional information to expand on these concepts and custom implementations used.

### Starting Server
The server can be started in a number of different ways.

**`slc` CLI**
```sh
$ cd <app-root-dir>
$ slc run

```
Please see [running apps with `slc`](http://docs.strongloop.com/display/public/LB/Running+apps+with+slc)

**`node` CLI**
```sh
$ cd <app-root-dir>
$ node server/server

```

**`gulp` CLI**
```sh
$ cd <app-root-dir>
$ gulp serve

```

#### Run For Specific Environment
By default, the LoopBack server will run under the `development` environment. This can be changed by setting the environment when starting the server.

```sh
$ cd <app-root-dir>
$ NODE_ENV=production node server/server

```

For Windows users, please use:

```sh
C:\> cd <app-root-dir>
C:\> set NODE_ENV=production && node app
```

#### Run With Debug
You can specify debug strings when you run an application to display specific log output to the console. You can also redirect the output to a file, if desired. These techniques are often helpful in debugging applications.

Please see [setting debug strings](http://docs.strongloop.com/display/public/LB/Setting+debug+strings) for full information.

#### Using Node Inspector
Please see [debugging applications](http://docs.strongloop.com/display/SLC/Debugging+applications) for information on how to use the `slc` command-line tool to run your LoopBack server with Node Inspector.

### Configuration Files
Much of the LoopBack server configuration is done through JSON files within the server directory. This includes:

* [config.json](http://docs.strongloop.com/display/LB/config.json)
* [datasources.json](http://docs.strongloop.com/display/LB/datasources.json)
* [middleware.json](http://docs.strongloop.com/display/LB/middleware.json) - **Hybrid solution used, see Middleware section below.**
* [model-config.json](http://docs.strongloop.com/display/LB/model-config.json)
* angular-routes.json - custom JSON file not specific to LoopBack. This file will be generated automatically based on the configured routes for the Angular application and is used directly by custom middleware to server the `index.html` file to any requests for these configured routes.

### Adding Models
Models can be added using the [model generator](http://docs.strongloop.com/display/public/LB/Using+the+model+generator) or by manually adding [model definitions](http://docs.strongloop.com/display/public/LB/Model+definition+JSON+file) to the `./server/models` directory.

For additional information please see the LoopBack documentation on [creating models](http://docs.strongloop.com/display/public/LB/Creating+models).

The preferred model directory is located at `./server/models`, this differs from the default location at `./common/models`. If the `slc` model generated is used, any files generated will be at the default location and need to be moved mover manually to the desired directory.

### Configuring Data Sources
Configured models are linked to one of the available [database connectors](http://docs.strongloop.com/display/public/LB/Database+connectors) LoopBack provides.

* [Memory](http://docs.strongloop.com/display/LB/Memory+connector)
* [MongoDB](http://docs.strongloop.com/display/LB/MongoDB+connector)
* [MySQL](http://docs.strongloop.com/display/LB/MySQL+connector)
* [Oracle](http://docs.strongloop.com/display/LB/Oracle+connector)
* [PostgreSQL](http://docs.strongloop.com/display/LB/PostgreSQL+connector)
* [Redis](http://docs.strongloop.com/display/LB/Redis+connector)
* [SQL Server](http://docs.strongloop.com/display/LB/SQL+Server+connector)

For additional information please see [connecting models to data sources](http://docs.strongloop.com/display/public/LB/Connecting+models+to+data+sources).

### Server Configuration
The main server file at `./server/server.js` is intentionally kept lean. Middleware configuration should not be made here nor should heavy app configuration be done here as well. Please see the sections below for use of the boot directory and configuration of middleware.

### Boot Directory
> The LoopBack bootstrapper, [loopback-boot](https://github.com/strongloop/loopback-boot), performs application initialization (also called *bootstrapping*).  When an application starts, the bootstrapper:
>
> * Configures data sources.
> * Defines custom models
> * Configures models and attaches models to data-sources.
> * Configures application settings
> * Runs boot scripts in the `./server/boot` directory.

Middleware should not be defined within boot directory scripts, please see the middleware section below.

Boot scripts are a good location to make customization to built-in models provided by Loopback.

Application configuration made here should be sensitive to the fact that the boot scripts are loaded in alphabetically order (unless specifically ordered through the `bootScripts` [boot option](http://apidocs.strongloop.com/loopback-boot/#boot)).

Please see [defining boot scripts](http://docs.strongloop.com/display/public/LB/Defining+boot+scripts) for more information.

### Middleware Configuration

LoopBack structures middleware in phases to ensure the execution order is correct. The predefined phases are:

* **initial** - The first point at which middleware can run.
* **session** - Prepare the session object.
* **auth** - Handle authentication and authorization.
* **parse** - Parse the request body.
* **routes** - HTTP routes implementing your application logic. Middleware registered via the Express API `app.use`, `app.route`, `app.get` (and other HTTP verbs) runs at the beginning of this phase. Use this phase also for sub-apps like `loopback/server/middleware/rest` or `loopback-explorer`.
* **files** - Serve static assets (requests are hitting the file system here).
* **final** - Deal with errors and requests for unknown URLs.

Each phase has "before" and "after" subphases in addition to the main phase, encoded following the phase name, separated by a colon. For example, for the "initial" phase, middleware executes in this order:

* `initial:before`
* `initial`
* `initial:after`

Middleware within a single subphase executes in the order in which it is registered. However, you should not rely on such order. Always explicitly order the middleware using appropriate phases when order matters.

### Hybrid Approach
A hybrid solution is employed to manage and register middleware for each predefined phase. The `middleware.json` files can be used for configuration of basic/common middleware. More complex middlware may use the custom implementation approach defined below.

#### Custom Implementation
The file `./server/middleware.js` was created to provide a helper function for loading middleware configurations organized by phase.

Within the `./server/server.js` file, the middleware function is invoked, passing in the `app` variable.

```js
// setup middleware
middleware(app);
```

This will begin iterating through the predefined phase names and look within the `./server/middleware` directory for files matching the phase name. For example, the `initial` phase looks for `./server/middleware/initial.js`. Sub-phases can also be provided, they should be named `{phase-name}.before.js` and `{phase-name}.after.js`. For example, when considering the initial phase you could provide `./server/middleware/initial.before.js` and `./server/middleware/initial.after.js`.

As with other LoopBack configuration files, environment specific files can be used for the phase files. For example `./server/middleware/initial.development.js` or `./server/middleware/initial.after.production.js`. Unlike the LoopBack [environment specific configurations](http://docs.strongloop.com/display/public/LB/Environment-specific+configuration), the presence of an environment specific phase file will take complete precedence over the default one and override it completely. If you want to have the same middleware defined for both environments, the configuration will need to be repeated.

Each phase file is expected to return a function which receives two parameters, the main `app` and `phaseName`, which is a predefined name for each respective phase. Within the phase file, middleware is assigned using the [LoopBack Middleware API](http://docs.strongloop.com/display/public/LB/Defining+middleware#Definingmiddleware-UsingtheLoopBackAPI) and the `phaseName` provided.

Below is a sample `./server/middleware/initial.js` file:

```js
'use strict';

module.exports = function (app, phaseName) {
    var loopback = app.loopback;

    if (app.isLocal()) {
        app.middleware(phaseName, app.loopback.logger('dev'));
    }

    // request pre-processing middleware
    app.middleware(phaseName, loopback.compress());
};

```

Though middleware can be registered to the LoopBack server in a number of locations and ways, the selected solution should be based on the complexity of the middleware in which you are attempting to register and consideration to which environments the middleware will run on. Please avoid defining middleware within scripts in the `./server/boot` directory and within the `./server/server.js` file. Keeping the application middleware organized within the `./server/middleware/` directory and by phase will ensure everything is loaded within the proper order.

### Error Handling
**TODO**

#### Server Side Jade
**TODO**

### Passport Integration
**TODO**

### Setup Script
An interactive setup script will guide you through some basic setup tasks.

#### Run In Local Environment

```sh
$ npm run setup
```

#### Run In Development Environment

```sh
$ NODE_ENV=development npm run setup
```

#### Run In Production Environment

```sh
$ NODE_ENV=production npm run setup
```

### Generate `server/angular-routes.json`
This process will be greatly improved in the future with better integration into the updates taking place on the front end. For now, to generate the JSON file run the following command with `gulp server` running locally in another terminal window.

```sh
$ npm run fetchAngularRoutes
```
