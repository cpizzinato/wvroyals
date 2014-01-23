'use strict';

var app = angular.module('westvanfcApp', ['ngResource', 'ngAnimate', 'ngRoute', 'wu.masonry', 'ngProgressLite'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/news', {
        templateUrl: 'views/news.html',
        controller: 'NewsCtrl'
      })
      .when('/results', {
        templateUrl: 'views/results.html',
        controller: 'ResultsCtrl'
      })
      .when('/media', {
        templateUrl: 'views/media.html',
        controller: 'MediaCtrl'
      })
      .when('/team', {
        templateUrl: 'views/team.html',
        controller: 'TeamCtrl'
      })
      .when('/awards', {
        templateUrl: 'views/awards.html',
        controller: 'AwardsCtrl'
      })
      .when('/club', {
        templateUrl: 'views/club.html',
        controller: 'ClubCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);
  });
