/* global _ */
/* global $ */
'use strict';

angular.module('angularMap.pages.place', ['google.places', 'restangular', 'uiGmapgoogle-maps'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('root.place', {
                url: '/place',
                views: {
                    main: {
                        templateUrl: 'app/pages/map/place.main.html',
                        controller: 'PlaceCtrl',
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
    })
    .controller('PlaceCtrl', function ($scope, $log, $timeout, places) {
        var self = this;

        // Map initialization
        this.map = {
            center: { latitude: 0, longitude: 0 },
            zoom: 12,
            markers: [],
            events: {
                click: function (map, eventName, originalEventArgs) {
                    var e = originalEventArgs[0];
                    var lat = e.latLng.lat(), lon = e.latLng.lng();
                    var marker = self.getMarker(
                        new Place(-1, "new", lat, lon)
                        );
                    self.showMarker(marker, true);
                    $scope.$apply();
                }
            }
        };
        this.options = { scrollwheel: true };
      
        // Get marker object by the place
        this.getMarker = function (place) {
            return {
                id: _.isNull(place.id) || _.isUndefined(place.id)
                    ? Date.now() : place.id,
                name: place.name,
                coords: {
                    latitude: place.latitude,
                    longitude: place.longitude
                },
                options: {
                    draggable: true,
                    labelContent: "<div class='lableContent'>" + place.name + "</div>",
                    cursor: "pointer"
                },
                data: 'restaurant',
                closeClick: function () {
                    alert(1);
                }
            };
        }
      
        // Show marker on the map
        this.showMarker = function (marker, isPop) {
            if (isPop) {
                self.map.markers.pop();
            }
            self.map.markers.push(marker);
            console.log(self.map.markers);
        }
      
        // Check if we have saved place 
        this.hasPlace = function (id) {
            return !!this.getPlaceById(id);
        }
      
        // Get place by id
        this.getPlaceById = function (id) {
            return _.find(places, function (obj) { return obj.id == id });
        }
      
        // Set place to the map by it's id
        this.setPlaceById = function (id) {
            var place = self.getPlaceById(id);
            if (place) {
                self.setPlace(place);
                //alert(JSON.stringify(self.getMarker(place)));
                //self.showMarker(self.getMarker(place), false);
                self.setPlace(place);
            }
        }

        // Set place to the map
        this.setPlace = function (place) {
            self.currentPlace.id = place.id;
            self.currentPlace.latitude = self.map.center.latitude = place.latitude;
            self.currentPlace.longitude = self.map.center.longitude = place.longitude;
            // TODO ogv Define if the condition below is necessary
            if (typeof place.name != "undefined") {
                self.currentPlace.name = place.name;
            }
        }

        // Initializing 'currentPlace' object
        this.currentPlace = new Place(-1, null, 0, 0);
        $scope.autocomplete = {};
      
        // Set current position to the map
        this.setCurrentPosition = function (pos) {
            var crd = pos.coords;
            //self.setPlace(crd.latitude, crd.longitude, "you are here");
            self.setPlace(new Place(-1, "You are here", crd.latitude, crd.longitude));
            var currentPlaceMarker = self.getMarker(self.currentPlace);
            currentPlaceMarker.options.draggable = false;
            currentPlaceMarker.options.labelContent = "<div class='currentLableContent'>" + currentPlaceMarker.name + "</div>"
            self.showMarker(currentPlaceMarker, false);
            $scope.$apply();
        };
        // Set current position error handler
        this.setCurrentPositionError = function (err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        };
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(this.setCurrentPosition, this.setCurrentPositionError, { enableHighAccuracy: false, maximumAge: Infinity, timeout: 6000 });
        }
      
        // Drawing markers for saved places
        _(places).forEach(function (place) {
            self.showMarker(self.getMarker(place), false);
        }).value();
      
        // Watch for autocomplete field value
        $scope.$watch('autocomplete', function (newVal, oldVal, scope) {
            self.currentPlace.name = $("#autocomplete").val();
            if (newVal && newVal.geometry && newVal.geometry.location) {
                var loc = newVal.geometry.location;
                //self.setPlace(loc.lat(), loc.lng(), self.currentPlace.name);
                //alert(loc.lat());
                self.setPlace(new Place(-1, self.currentPlace.name, loc.lat(), loc.lng()));
                var currentPlaceMarker = self.getMarker(self.currentPlace);
                self.showMarker(currentPlaceMarker, "currentMarker");
            }
            //alert(JSON.stringify(scope.currentPlace));
        });
      
        // Watch for the map changes
        //$scope.$watch('map', function(newVal, oldVal, scope){
        //var loc = scope.map.center;
        //self.setPlace(loc.latitude, loc.longitude);
        //self.setPlace(new Place(-1, undefined, loc.latitude, loc.longitude));
        //}, true);
        
        //________________________________________________________________
        
        this.x = {};
        this.x.places = places;
        this.x.map = {
            center: {
                latitude: 40.1451,
                longitude: -99.6680
            },
            zoom: 12,
            bounds: {}
        };
        this.x.options = {
            scrollwheel: false
        };
        var createRandomMarker = function (i, bounds, idKey) {
            var lat_min = bounds.southwest.latitude,
                lat_range = bounds.northeast.latitude - lat_min,
                lng_min = bounds.southwest.longitude,
                lng_range = bounds.northeast.longitude - lng_min;

            if (idKey == null) {
                idKey = "id";
            }

            var latitude = lat_min + (Math.random() * lat_range);
            var longitude = lng_min + (Math.random() * lng_range);
            var ret = {
                latitude: latitude,
                longitude: longitude,
                title: 'm' + i,
                name: 'm' + i,
            };
            ret[idKey] = i;
            return ret;
        };
        this.x.options = { 
            draggable: true,
            cursor: "pointer" 
        };
        this.x.events = {
            click: function (map, eventName, originalEventArgs) {
                alert("clicked");
            },
            dragend: function (map, eventName, originalEventArgs) {
                alert("dragend");
            }
        };
        
        this.x.randomMarkers = [];
        // Get the bounds from the map once it's loaded
        $scope.$watch(function () {
            return self.x.map.bounds;
        }, function (nv, ov) {
            // Only need to regenerate once
            if (!ov.southwest && nv.southwest) {
                var markers = [];
                for (var i = 0; i < 5; i++) {
                    markers.push(createRandomMarker(i, self.x.map.bounds))
                }
                var marker = self.x.getMarker(
                    new Place(-1, "new", 2, 3)
                    );
                markers.push(marker);
                self.x.randomMarkers = markers;
            }
        }, true);
        
        // Get marker object by the place
        this.x.getMarker = function (place) {
            return {
                id: _.isNull(place.id) || _.isUndefined(place.id)
                    ? Date.now() : place.id,
                name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
                options: {
                    draggable: true,
                    labelContent: "<div class='lableContent'>" + place.name + "</div>",
                    cursor: "pointer",
                },
                events: {
                    dragend: function (map, eventName, originalEventArgs) {
                        console.log("dragend");
                        alert("dragend");
                    }
                }
            };
        }
        
    });

//import './place.controller';
import Place from './Place';
import config from '../../../../project-config';