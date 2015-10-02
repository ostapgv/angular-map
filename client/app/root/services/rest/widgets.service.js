'use strict';

/**
 * @ngdoc service
 * @name Widgets
 * @requires loopback-utility
 * @description
 * Restangular's intance. Holds methods to work with Widgets REST API.
 */

import { addCommonMethods, addCustomMethods } from './loopback-utility';

function Widgets($q, Loopback) {
    'ngInject';
    let widgetsRoute = 'Widgets';

    Loopback.extendCollection(widgetsRoute, function extendCollection(widgets) {
        addCustomMethods(Loopback, widgets);
        addCommonMethods(widgets);
        return widgets;
    });

    return Loopback.all(widgetsRoute);
}

angular.module('angularMap.root').factory('Widgets', Widgets);
export default Widgets;
