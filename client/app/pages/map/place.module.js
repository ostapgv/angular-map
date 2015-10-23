'use strict';

angular.module('angularMap.pages.place', 
        ['google.places', 'restangular', 'uiGmapgoogle-maps', 'mgcrea.ngStrap'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('root.place', {
                url: '/place',
                views: {
                    main: {
                        templateUrl: 'app/pages/map/place.main.html',
                        controller: 'PlaceController',
                        controllerAs: 'placeCtrl',
                        resolve: {
                            authenticatedUser: function (AuthResolver) {
                                return AuthResolver.requireAuthenticatedUser();
                            },
                            user: function (Users) {
                                return Users.getCurrent();
                            },
                            places: function (Restangular) {
                                return Restangular.all(config.restApiRoot + 'places').getList();
                            }
                        }
                    }
                }
            });
    });
    
import './place.controller';
import config from '../../../../project-config';