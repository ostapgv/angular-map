'use strict';

class NavbarController {
    constructor(Auth) {
        
        'ngInject';
        this.auth = Auth;
        
        this.initializeNav();
    }

    initializeNav() {
        this.navList = [{
            sref: 'root.home',
            title: 'Home',
            show: true
        }, {
            sref: 'root.angmap',
            title: 'Map',
            show: true
        }, {
            sref: 'root.about',
            title: 'About',
            show: true
        }, {
            sref: 'root.article',
            title: 'Article',
            show: true
        }, {
            sref: 'root.widgets',
            title: 'Widgets',
            show: true
        }, {
            sref: 'root.account',
            title: 'Account',
            show: this.auth.isAuthenticated()
        }, {
            sref: 'root.login',
            title: 'Log in',
            show: !this.auth.isAuthenticated()
        }, {
            sref: 'root.logout',
            title: 'Logout',
            show: this.auth.isAuthenticated()
        }];
    }
}

angular.module('angularMap.root').controller('NavbarController', NavbarController);

