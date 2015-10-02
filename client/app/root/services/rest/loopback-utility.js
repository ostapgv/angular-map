'use strict';

/**
 * @ngdoc module
 * @name loopback-utility
 * @requires restangular
 * @description
 *
 * This module helps to create base Loopback services.
 */

export function addCommonMethods(model) {
    // replicating common Loopback methods, examples here
    // https://bitbucket.org/wkatg/ui-ace-dev-central/src/c32f27b0b027f61ce650ab3582dcfed7c5edf97b/app/scripts/auth/models/Token.js?at=develop
    model.addRestangularMethod('create', 'post');
    model.addRestangularMethod('upsert', 'put');
    model.addRestangularMethod('find', 'get');

    model.addRestangularMethod('count', 'get', 'count');
    model.addRestangularMethod('findOne', 'get', 'findOne');
    model.addRestangularMethod('updateAll', 'post', 'update');
}

export function addCustomMethods(Restangular, model) {
    model.new = function() {
        return Restangular.restangularizeElement(null, { }, model.route);
    };
}

// others to consider
//
// "exists": {
//     url: urlBase + "/Tokens/:id/exists",
//     method: "GET"
// },
//
// "findById": {
//     url: urlBase + "/Tokens/:id",
//     method: "GET"
// },
//
// "deleteById": {
//     url: urlBase + "/Tokens/:id",
//     method: "DELETE"
// },

//
// R["updateOrCreate"] = R["upsert"];
//
// R["update"] = R["updateAll"];
//
// R["destroyById"] = R["deleteById"];
//
// R["removeById"] = R["deleteById"];
