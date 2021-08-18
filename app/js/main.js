'use strict';

const Notiflix = require('notiflix');


angular.module('app')
    .controller('AppCtrl', function ($scope, $timeout, $translate, $localStorage, $window, $state, $linq, $http, SweetAlert, $rootScope, endpoint, ChatHub, $modal, kendoExt, $ocLazyLoad) {
        // add 'ie' classes to html
        var isIE = !!navigator.userAgent.match(/MSIE/i);
        isIE && angular.element($window.document.body).addClass('ie');
        isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

        // config
        $scope.app = {
            name: 'HYBS',
            version: 'v2.2017.10',
            // for chart colors
            color: {
                primary: '#0097A7',
                info: '#1976D2',
                success: '#689F38',
                warning: '#E64A19',
                danger: '#D32F2F',
                light: '#9E9E9E',
                dark: '#263238',
                black: '#212121',

                red: '#F44336',
                blue: '#2196F3',
                greeen: '#8BC34A',
                orange: '#FF5722',
                ping: '#E91E63',
                lightblue: '#03A9F4',
                purple: '#9C27B0',
                teal: '#009688',
                yellow: '#FFEB3B',
                cyan: '#00BCD4',
                amber: '#FFC107',
                gray: '#9E9E9E'
            },
            settings: {
                "themeID": "4",
                "navbarHeaderColor": "gradient-45deg-light-blue-cyan gradient-shadow",
                "navbarCollapseColor": "gradient-45deg-light-blue-cyan gradient-shadow",
                "asideColor": "bg-black dker",
                "headerFixed": true,
                "asideFixed": true,
                "asideFolded": false,
                "asideDock": false,
                "container": false,
            },
            options: {
                UsePrinter: false,
                TcpPort: 5555,
                OgsEtiketStart: "1001",
                MinTonaj: 1000,
                WebApiUrl: "http://localhost:2023/HYS.WebApi/",
                //WebApiUrl: "http://hybs.kocaeli.bel.tr/HYS.WebApi/",
                SerialPort: {
                    portName: "COM2",
                    autoOpen: false,
                    baudRate: 9600,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'none'
                }
            },
        }

        $rootScope.app = $scope.app;


        if (angular.isDefined($localStorage.user)) {
            $http.defaults.headers.common = {
                'Authorization': 'Basic ' + $localStorage.user.authtoken
            };
            $scope.app.user = $localStorage.user;
        }

        // save settings to local storage
        if (angular.isDefined($localStorage.settings)) {
            $scope.app.settings = $localStorage.settings;
        }
        else {
            $localStorage.settings = $scope.app.settings;
        }







        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {


        });

        $scope.$on('$stateChangeSuccess',
            function () {

            })



        $rootScope.Logout = function () {
            $localStorage.$reset();
            $scope.app.user = {};
            $rootScope.login();
        };


        $ocLazyLoad.load([
            'ui/loginmodal/login.html'
        ]);


        $rootScope.loginIsOpen = false;
        $rootScope.login = function () {

            if ($rootScope.loginIsOpen) return;

            $rootScope.loginIsOpen = true;
            var modalInstance = $modal.open({
                keyboard: false,
                animation: false,
                templateUrl: 'loginModal',
                controller: 'loginCtrl',
                size: 'md',
            });

            modalInstance.result.then(function (e) {
                $rootScope.loginIsOpen = false;
                location.reload();
            });

        };




    });



app.controller('loginCtrl', function ($scope, $rootScope, $http, $modalInstance, kendoExt, $linq, SweetAlert, $localStorage, $state) {


    $scope.dsDepolamaAlan = kendoExt.getDs("api/kantar/depolamaList");



    $scope.login = function () {
        $scope.authError = null;
        // Try to login

        var data = {
            username: $scope.user.username,
            password: $scope.user.password,
            IsMobile: false
        }


        var url = $rootScope.app.options.WebApiUrl + 'api/User/CheckUser';


        $http.post(url, data)
            .then(function (response) {
                if (response.data == "Unauthorized") {

                    SweetAlert.swal("Giriş", 'Kullanici adi veya şifre dogru degil.', "error");

                } else if (response.data == "Locked") {
                    SweetAlert.swal("Giriş", 'Kullanici kilitlendi 10 dk bekleyiniz.', "error");
                } else {



                    if ($scope.user.DepolamaAlani.BirimFiyat.length == 0) {

                        SweetAlert.swal("Giriş", 'Depolama alanı birim fiyat bilgisi bulunamadı', "error");
                        return;
                    }


                    // AuthenticationService.SetCredentials($scope.user.username, $scope.user.password);
                    var enummerable = $linq.Enumerable().From(response.data.usergroup);

                    var loginuser = {
                        buyuksehirid: response.data.buyuksehirid,
                        buyuksehiradi: response.data.buyuksehiradi,
                        ilcebelediyeid: response.data.ilcebelediyeid,
                        il: response.data.il,
                        ilid: response.data.ilid,
                        tasimaizinsureleri_yil: response.data.tasimaizinsureleri_yil,
                        tasimaizinsureleri_ay: response.data.tasimaizinsureleri_ay,
                        tasimaizinsureleri_gun: response.data.tasimaizinsureleri_gun,
                        logo: response.data.logo,
                        depolamaalani: $scope.user.DepolamaAlani,
                        userid: response.data.userid,
                        username: response.data.username,
                        namelastname: response.data.namelastname,
                        usergroup: response.data.usergroup,
                        authtoken: response.data.authtoken,
                        issuedOn: response.data.issuedOn,
                        expiredOn: response.data.expiredOn,

                        user_admin: enummerable.Contains(1),
                        user_buyuksehir: enummerable.Contains(2),
                        user_ilcebelediye: enummerable.Contains(3),
                        user_hafriyatfirmasi: enummerable.Contains(4),
                        user_bayi: enummerable.Contains(5),
                        user_jandarmazabita: enummerable.Contains(6),
                        user_dokumsahaisletme: enummerable.Contains(7),
                        user_hafriyatkabul: enummerable.Contains(8),
                        user_readonly: enummerable.Contains(9),
                    }

                    $localStorage.user = loginuser;
                    $scope.app.user = loginuser;

                    $http.defaults.headers.common = {
                        'Authorization': 'Basic ' + $localStorage.user.authtoken
                    };


                    $modalInstance.close('ok');
                }
            }, function (x) {
                SweetAlert.swal("Giriş", 'Server Error ' + x.data.ExceptionMessage, "error");
            });
    };

    $scope.Iptal = function () {
        $modalInstance.dismiss('cancel');
    };
});