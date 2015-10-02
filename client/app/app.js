'use strict';

/**
 * @ngdoc object
 * @name app
 * @requires root @object
 * @requires pages @object
 * @description
 * This is the main application module, which does the following:
 *   - includes all other modules
 */

import './root/root.module.js';
import './pages/pages.module.js';

angular.module('angularMap', [
    'angularMap.root',
    'angularMap.pages'
]);
