'use strict';

/* Controllers */
// signin controller
//angular.module('Authentication', []);
app.controller('SigninFormController', ['$scope', '$http', '$state', '$localStorage', '$linq', '$window', function ($scope, $http, $state, $localStorage, $linq, $window) {
    //AuthenticationService.ClearCredentials();

    if (!isSmartDevice($window))
        $scope.videosource = "/hf.mp4";

    var images = ['/HYS/img/login/1.jpg',
        '/HYS/img/login/1.jpg',
        '/HYS/img/login/1.jpg',
        '/HYS/img/login/1.jpg'];

    $('.login-container').css({ 'background-image': 'url(' + images[Math.floor(Math.random() * images.length)] + ')' });

    $scope.model = {
        key: $scope.app.options.RecaptchaKey
    };

    $scope.setResponse = function (response) {
        console.info('Response available');

        $scope.response = response;
    };

    $scope.setWidgetId = function (widgetId) {
        console.info('Created widget ID: %s', widgetId);

        $scope.widgetId = widgetId;
    };

    $scope.cbExpiration = function () {
        console.info('Captcha expired. Resetting response object');

        vcRecaptchaService.reload($scope.widgetId);

        $scope.response = null;
    };

    $scope.user = {};
    $scope.authError = null;
    $scope.login = function () {
        $scope.authError = null;
        // Try to login

        var data = {
            username: $scope.user.username,
            password: $scope.user.password,
            IsMobile: true
        }

        $http.post(url + 'api/User/CheckUser', data)
            .then(function (response) {
                if (response.data == "Unauthorized") {
                    $scope.authError = 'Kullanici adi veya Sifre dogru degil.';
                } else if (response.data == "Locked") {
                    $scope.authError = 'Kullanici kilitlendi!';
                } else {
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
                        depolamaalaniid: response.data.depolamaalaniid,
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
                    user = loginuser;
                    $scope.app.user = loginuser;

                    $http.defaults.headers.common = {
                        'Authorization': 'Basic ' + $localStorage.user.authtoken
                    };

                    var enummerable = $linq.Enumerable().From(user.usergroup);
                    if (enummerable.Contains(4))
                        $state.go('hafriyat.firma');
                    else if (enummerable.Contains(3))
                        $state.go('app.kabulbelgesi');
                    else if (enummerable.Contains(6))
                        $state.go('app.ara');
                    else
                        $state.go('app.dashboard-v1');
                }
            }, function (x) {
                $scope.authError = 'Server Error ' + x.data.ExceptionMessage;
            });
    };




}])
    ;