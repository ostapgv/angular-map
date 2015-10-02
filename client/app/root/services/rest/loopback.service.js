'use strict';

import config from '../../../../../project-config';

/**
 * @ngdoc service
 * @name Loopback
 * @requires Restangular
 * @description
 * Starter service for our REST API and Loopback.
 * Responsible for base url for api.
 * Set's loopback specific up for restangular's fields.
 */

function Loopback(Restangular) {
    'ngInject';
    return Restangular.withConfig(function(RestangularConfigurer) {
        // The base Url is set to /api/ by default, but can be overriden.
        RestangularConfigurer.setBaseUrl(config.restApiRoot);
        // We use Mongo and the ID of the elements is _id not id as the default. Therefore requests are sent to undefined routes
        RestangularConfigurer.setRestangularFields({
            id: '_id'
        });
    });
}

angular.module('angularMap.root').factory('Loopback', Loopback);
