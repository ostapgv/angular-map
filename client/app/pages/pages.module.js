'use strict';

/**
 * @ngdoc object 
 * @name pages
 * @requires widgets @object 
 * @requires $stateProvider
 * @description
 * Pages module consists of less static pages
 *   - defines states and views for pages
 */

import AboutController from './about/about.controller';

import './widgets/widgets.module.js';
import './account/account.module.js';

angular.module('angularMap.pages', ['angularMap.pages.widgets', 'angularMap.pages.account'])
    .controller('AboutController', AboutController)
    .config(function($stateProvider) {
        $stateProvider
            .state('root.home', {
                url: '/',
                views: {
                    main: {
                        templateUrl: 'app/pages/home/home.main.html'
                    }
                }
            })
            .state('root.about', {
                url: '/about',
                views: {
                    main: {
                        templateUrl: 'app/pages/about/about.main.html',
                        controller: 'AboutController',
                        controllerAs: 'aboutCtrl'
                    },
                    header: {
                        templateUrl: 'app/pages/about/about.header.html'
                    },
                    footer: {
                        templateUrl: 'app/pages/about/about.footer.html'
                    }
                }
            })
            .state('root.article', {
                url: '/article',
                views: {
                    '@': {
                        templateUrl: 'app/pages/article/article.page.html'
                    },
                    'aside@root.article': {
                        templateUrl: 'app/pages/article/article.aside.html'
                    },
                    'main@root.article': {
                        templateUrl: 'app/pages/article/article.main.html'
                    }
                }
            });
    });
