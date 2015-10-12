'use strict';

angular.module('angularMap.pages.angmap', ['uiGmapgoogle-maps'])
    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.angmap', {
                url: '/angmap',
                views: {
                    main: {
                        templateUrl: 'app/pages/map/angmap.main.html',
                        controller: 'AccountController',
                        controllerAs: 'mapCtrl',
                        resolve: {
                            authenticatedUser: function(AuthResolver) {
                                return AuthResolver.requireAuthenticatedUser();
                            },
                            user: function(Users) {
                                return Users.getCurrent();
                            }
                        }
                    }
                }
            });
    })

  .controller('mapCtrl', function ($scope, uiGmapGoogleMapApi) {
      $scope.map = { center: { latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
      $scope.options = { scrollwheel: true };
      $scope.aa = 123;
      
      uiGmapGoogleMapApi.then(function(maps) {

      });
  });

import './angmap.controller';
