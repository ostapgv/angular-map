/* global _ */
/* global alert */
/* global navigator */
'use strict';

import PagesController from '../pages.controller';
import Place from './Place';

class PlaceController extends PagesController {
    
    constructor($scope, basePlaces, places) {
        'ngInject';
        super();

        this.$scpope = $scope;

        this.places = places;
        this.initializeMap();
        this.initializeCurrentPlace($scope);
        this.showSavedMarkers(places);
        
        var self = this;
        $scope.autocomplete = {};
        $scope.$watch('autocomplete',
            (newVal, oldVal) => {
                if(newVal === oldVal) { return; }
                self.currentPlace.name = newVal;
                if (newVal && newVal.geometry && newVal.geometry.location) {
                    var loc = newVal.geometry.location;
                    self.setPlace(new Place(-1, self.currentPlace.name, loc.lat(), loc.lng()));
                    var currentPlaceMarker = self.getMarker(self.currentPlace);
                    self.showMarker(currentPlaceMarker, 'currentMarker');
                }
            },
            true
        );
        
    }
    
    // Map initialization
    initializeMap() {
        this.map = {
            center: { latitude: 0, longitude: 0 },
            zoom: 11,
            markers: [],
            markerMap: [],
            bounds: {},
            markerEvents: {
                //click: (map, eventName, originalEventArgs) => {
                //    alert('clicked');
                //},
                //rightclick: (map, eventName, originalEventArgs) => {
                //    alert('rightclick');
                //},
                dragend: (map, eventName, marker) => {
                    //alert("dragend");
                    //obj = _.find(myArray, (obj) => { return obj.id == '45' })
                    //place.save();
                    alert(JSON.stringify(marker));
                }
            }
        };
        this.options = { scrollwheel: true };
    }
    
    // Initializing current place
    initializeCurrentPlace($scope) {
        var self = this;
        this.currentPlace = new Place(-1, null, 0, 0);
        // Setting current position and marker on it
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    self.setCurrentPosition(pos, self);
                    $scope.$apply();
                },
                this.setCurrentPositionError,
                { enableHighAccuracy: false, maximumAge: Infinity, timeout: 6000 }
            );
        }
    }

    // Set current position to the map
    setCurrentPosition(pos, self) {
        if(_.isUndefined(self)) { self = this; }
        var crd = pos.coords;
        this.setPlace(new Place(-1, 'You are here', crd.latitude, crd.longitude), this);
        var currentPlaceMarker = this.getMarker(this.currentPlace);
        currentPlaceMarker.options.draggable = false;
        currentPlaceMarker.options.labelContent = '<div class="current-lable-content">' + currentPlaceMarker.name + '</div>';
        alert(JSON.stringify(currentPlaceMarker));
        this.showMarker(currentPlaceMarker);
    }
    // Set current position error handler
    setCurrentPositionError(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    }
    
    // Set place to the map
    setPlace(place) {
        this.currentPlace.id = place.id;
        this.currentPlace.latitude = this.map.center.latitude = place.latitude;
        this.currentPlace.longitude = this.map.center.longitude = place.longitude;
        // TODO ogv Define if the condition below is necessary
        if (!_.isUndefined(place.name)) {
            this.currentPlace.name = place.name;
        }
    }
    
    // Get marker object by the place
    getMarker(place) {
        return {
            id: _.isNull(place.id) || _.isUndefined(place.id) ? Date.now() : place.id,
            name: place.name,
            latitude: place.latitude,
            longitude: place.longitude,
            // TODO ogv Add the 'caption' field (including loopback)
            // caption: place.caption,
            options: {
                draggable: true,
                labelContent: '<div class="lable-content">' + place.name + '</div>',
                cursor: 'pointer',
            }
        };
    }
    
    // Show marker on the map
    showMarker(place) {
        this.map.markerMap.push(this.getMarker(place));
    }
    
    // Show markers for saved places
    showSavedMarkers() {
        var self = this;
        _(this.places).forEach( (place) => {
            self.showMarker(place);
        }).value();
    }
    
    // Check if we have saved place 
    hasPlace(id) {
        return !!this.getPlaceById(id);
    }
  
    // Get place by id
    getPlaceById(id) {
        return _.find(this.places, (obj) => { return obj.id === id; });
    }
  
    // Set place to the map by it's id
    setPlaceById(id) {
        var place = this.getPlaceById(id);
        if (place) {
            this.setPlace(place);
        }
    }

}

angular.module('angularMap.pages.place').controller('PlaceController', PlaceController);

export default PlaceController;
