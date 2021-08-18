angular.module('app')


    .directive('btnCreate', function ($http, $state) {
        return {
            restrict: 'EAC',
            scope: {
                selected: "@"
            },
            link: function (scope, element, attrs) {
                if (user.user_readonly)
                    element.addClass('hide');
            }


        };
    })
    .directive('btnUpdate', function ($http, $state) {
        return {
            restrict: 'EAC',
            scope: {
                selected: "@"
            },
            link: function (scope, element, attrs) {
                if (user.user_readonly)
                    element.addClass('hide');
            }


        };
    })
    .directive('btnDelete', function ($http, $state) {
        return {
            restrict: 'EAC',
            scope: {
                selected: "@"
            },
            link: function (scope, element, attrs) {
                if (user.user_readonly)
                    element.addClass('hide');
            }


        };
    })

     //<btn-new text="Ekle" icon="fa-plus" click="open()"></btn-new>
    .directive('btnNew', function () {
        return {

            restrict: 'E',


            template: "<button class=\"btn m-b-md  btn-success btn-addon\" ng-click=\"click()\" ng-class=\"{'hide' : isInVisible}\"\><i class=\"fa fa-plus\" ></i> {{buttontext}}</button>",
            replace: true,
            scope: {
                click: '&'
            },
            controller: function ($scope, $state) {

                var url = $state.$current.self.name

                $scope.isInVisible = false;
                $scope.getCSSClass = function () {
                    return "testclass ";
                }

            },
            // observe and manipulate the DOM
            link: function ($scope, element, attrs) {

                $scope.buttontext = attrs.text;
                $scope.faicon = attrs.icon;


                var isAuthorized = true;
                if (!isAuthorized) {
                    element.css('display', 'none');
                }

                //attrs.$observe('text', function(value) {
                //    element.find('button').innerHtml(value)
                //})

                //// attribute names change to camel case
                //attrs.$observe('photoSrc', function(value) {
                //    element.find('img').attr('src', value)
                //})
            }
        }
    });