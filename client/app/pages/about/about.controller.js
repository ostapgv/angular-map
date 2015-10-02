'use strict';

/**
 * @class
 * @name  AboutController
 * @requires PagesController @class
 * @description
 *
 * Controller for the about page:
 * - being extended from {@link PagesController}
 * - sets the list of awesome things
 */

import PagesController from '../pages.controller';

class AboutController extends PagesController {
    constructor() {
        super();
        this.initializeAwesomeThings();
    }

    initializeAwesomeThings() {
        this.awesomeThings = [{
            'title': 'AngularJS',
            'url': 'https://angularjs.org/',
            'description': 'HTML enhanced for web apps!',
            'logo': 'angular.png'
        }, {
            'title': 'BrowserSync',
            'url': 'http://browsersync.io/',
            'description': 'Time-saving synchronised browser testing.',
            'logo': 'browsersync.png'
        }, {
            'title': 'GulpJS',
            'url': 'http://gulpjs.com/',
            'description': 'The streaming build system.',
            'logo': 'gulp.png'
        }, {
            'title': 'Jasmine',
            'url': 'http://jasmine.github.io/',
            'description': 'Behavior-Driven JavaScript.',
            'logo': 'jasmine.png'
        }, {
            'title': 'Karma',
            'url': 'http://karma-runner.github.io/',
            'description': 'Spectacular Test Runner for JavaScript.',
            'logo': 'karma.png'
        }, {
            'title': 'Protractor',
            'url': 'https://github.com/angular/protractor',
            'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
            'logo': 'protractor.png'
        }, {
            'title': 'jQuery',
            'url': 'http://jquery.com/',
            'description': 'jQuery is a fast, small, and feature-rich JavaScript library.',
            'logo': 'jquery.jpg'
        }, {
            'title': 'Bootstrap',
            'url': 'http://getbootstrap.com/',
            'description': 'Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.',
            'logo': 'bootstrap.png'
        }, {
            'title': 'Angular Strap',
            'url': 'http://mgcrea.github.io/angular-strap/',
            'description': 'AngularJS 1.2+ native directives for Bootstrap 3.',
            'logo': 'angular-strap.png'
        }, {
            'title': 'Sass (Node)',
            'url': 'https://github.com/sass/node-sass',
            'description': 'Node.js binding to libsass, the C version of the popular stylesheet preprocessor, Sass.',
            'logo': 'node-sass.png'
        }, {
            'title': 'ES6 (Traceur)',
            'url': 'https://github.com/google/traceur-compiler',
            'description': 'A JavaScript.next-to-JavaScript-of-today compiler that allows you to use features from the future today.',
            'logo': 'traceur.png'
        }, {
            'key': 'jade',
            'title': 'Jade',
            'url': 'http://jade-lang.com/',
            'description': 'Jade is a high performance template engine heavily influenced by Haml and implemented with JavaScript for node.',
            'logo': 'jade.png'
        }];

        this.awesomeThings.forEach(function(awesomeThing) {
            awesomeThing.rank = Math.random();
        });
    }
}

export default AboutController;
