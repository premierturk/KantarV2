'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )
    .config(
        ['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {


                $urlRouterProvider
                    .otherwise('/app/hafriyatdokumlist');

                $stateProvider

                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'tpl/layout.html'
                    })



                    .state('app.hafriyatdokumlist', {
                        url: '/hafriyatdokumlist',
                        templateUrl: 'ui/hafriyatdokum/list.html',
                        views: {
                            '': {
                                templateUrl: 'ui/hafriyatdokum/list.html'
                            },
                            // 'footer': {
                            //     templateUrl: 'tpl/layout_footer_fullwidth.html'
                            // }
                        },
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui/hafriyatdokum/list.js']);
                                }]
                        }
                    })

            }
        ]
    );