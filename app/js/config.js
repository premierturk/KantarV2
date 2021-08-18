// config

var app =
    angular.module('app')
        .config(
        ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 'NotificationProvider', '$locationProvider', '$modalProvider','$provide',
            function ($controllerProvider, $compileProvider, $filterProvider, $provide, NotificationProvider, $locationProvider, $modalProvider, $provide) {

                $modalProvider.options = { dialogFade: true, backdrop: 'static', keyboard: true };
                //$locationProvider.html5Mode({
                //    enabled: true,
                //    requireBase: false
                //});


                $provide.decorator('$exceptionHandler', function ($delegate) {

                    return function (exception, cause) {
                        $delegate(exception, cause);

                        alert('Error occurred! Please contact admin.');
                    };
                });


                // lazy controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;
                app.constant = $provide.constant;
                app.value = $provide.value;


                NotificationProvider.setOptions({
                    delay: 6000,
                    startTop: 800,
                    startRight: 10,
                    verticalSpacing: 20,
                    horizontalSpacing: 20,
                    positionX: 'right',
                    positionY: 'bottom'
                });



            }
        ])      
        .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {

            cfpLoadingBarProvider.includeSpinner = true;
        }]);

app.value('endpoint', '/HYS.SingnalR/signalr');
app.value('ChatHub', 'Chat');
app.value('AracTakipHub', 'AracTakip');
app.value('DokumHub', 'dokum');












