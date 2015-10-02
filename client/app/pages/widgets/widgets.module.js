'use strict';

/**
 * @ngdoc object
 * @name widgets
 * @description
 *   - defines states and views for widgets
 */

import WidgetsController from './widgets.controller';
import WidgetsEditController from './edit/edit.controller';
import WidgetsViewController from './view/view.controller';

angular.module('angularMap.pages.widgets', [])
    .controller('WidgetsController', WidgetsController)
    .controller('WidgetsEditController', WidgetsEditController)
    .controller('WidgetsViewController', WidgetsViewController)

.config(function($stateProvider) {
    $stateProvider
        .state('root.widgets', {
            url: '/widgets',
            views: {
                '@': {
                    templateUrl: 'app/pages/widgets/widgets.page.html',
                },
                'main@root.widgets': {
                    templateUrl: 'app/pages/widgets/widgets.main.html',
                    controller: 'WidgetsController',
                    controllerAs: 'widgetsCtrl',
                    resolve: {
                        widgets: function(Widgets) {
                            return Widgets.getList();
                        }
                    }
                }
            }
        })
        .state('root.widgets.new', {
            url: '/new',
            views: {
                main: {
                    templateUrl: 'app/pages/widgets/edit/edit.main.html',
                    controller: 'WidgetsEditController',
                    controllerAs: 'widgetsEditCtrl',
                    resolve: {
                        widget: function(Widgets) {
                            return Widgets.new();
                        }
                    }
                }
            }
        })
        .state('root.widgets.edit', {
            url: '/edit/:id',
            views: {
                main: {
                    templateUrl: 'app/pages/widgets/edit/edit.main.html',
                    controller: 'WidgetsEditController',
                    controllerAs: 'widgetsEditCtrl',
                    resolve: {
                        widget: function(Widgets, $stateParams) {
                            return Widgets.get($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('root.widgets.view', {
            url: '/:id',
            views: {
                main: {
                    templateUrl: 'app/pages/widgets/view/view.main.html',
                    controller: 'WidgetsViewController',
                    controllerAs: 'widgetsViewCtrl',
                    resolve: {
                        widget: function(Widgets, $stateParams) {
                            return Widgets.get($stateParams.id);
                        }
                    }
                }
            }
        });
});
