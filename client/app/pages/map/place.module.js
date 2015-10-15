'use strict';

angular.module('angularMap.pages.place', ['google.places','restangular','uiGmapgoogle-maps'])
  .config(function($stateProvider) {
      $stateProvider
        .state('root.place', {
            url: '/place',
            views: {
                main: {
                    templateUrl: 'app/pages/map/place.main.html',
                    controller: 'PlaceCtrl',
                    controllerAs: 'placeCtrl',
                    resolve: {
                        authenticatedUser: function(AuthResolver) {
                            return AuthResolver.requireAuthenticatedUser();
                        },
                        user: function(Users) {
                            return Users.getCurrent();
                        },
                        places: function(Restangular) {
                            return  Restangular.all(config.restApiRoot + 'places').getList();
                        }
                    }
                }
            }
        });
  })
  .controller('PlaceCtrl', function ($scope, $log, $timeout, places) {
      var self = this;

      // Map initialization
      $scope.map = {center: {latitude: 0, longitude: 0}, zoom: 12};
      $scope.options = { scrollwheel: true };
      
      // Show the marker on the map
      this.showMarker = function(place){
          self.marker = {
              id: place._id,
              coords: {
                  latitude: place.latitude,
                  longitude: place.longitude
              },
              options: { 
                  draggable: true,
                  labelContent: place.name,
                  cursor: "pointer"
              }
          };
      }

      // Common function to set the coords
      this.setPlace = function(place) {
          $scope.currentPlace._id = place._id;
          $scope.currentPlace.latitude = $scope.map.center.latitude = place.latitude;
          $scope.currentPlace.longitude = $scope.map.center.longitude = place.longitude;
          if(typeof place.name != "undefined") {
              $scope.currentPlace.name = place.name;
          }
      }

      // Initializing 'currentPlace' object
      $scope.currentPlace = new Place(-1, "", 0, 0);
      $scope.autocomplete = {};
      
      // Set current position to the map
      this.setPosition = function(pos) {
          var crd = pos.coords;
          //self.setPlace(crd.latitude, crd.longitude, "you are here");
          self.setPlace(new Place(-1 , "you are here", crd.latitude, crd.longitude));
          self.showMarker($scope.currentPlace);
          $scope.$digest();
      };
      this.error = function(err) {
          console.warn('ERROR(' + err.code + '): ' + err.message);
      };
      if("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(this.setPosition, this.error, {enableHighAccuracy:false, maximumAge:Infinity, timeout:6000});
      }
      
      // Watch for autocomplete field value
      $scope.$watch('currentPlace.name', function(newVal, oldVal, scope){
          if(newVal && newVal.geometry && newVal.geometry.location){
              var loc = newVal.geometry.location;
              //alert(loc.lat());
              //self.setPlace(loc.lat(), loc.lng(), $scope.currentPlace.name);
              self.setPlace(new Place(-1, $scope.currentPlace.name, loc.lat(), loc.lng()));
              self.showMarker($scope.currentPlace);
          }
          //alert(JSON.stringify(scope.currentPlace));
      });
      
      // Watch for the map changes
      $scope.$watch('map', function(newVal, oldVal, scope){
          var loc = scope.map.center;
          //self.setPlace(loc.latitude, loc.longitude);
          self.setPlace(new Place(-1, undefined, loc.latitude, loc.longitude));
      }, true);
      
      $scope.places = places;
      
  });

//import './place.controller';
import Place from './Place';
import config from '../../../../project-config';