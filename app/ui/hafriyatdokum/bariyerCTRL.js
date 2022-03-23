app.controller(
    "bariyerCtrl",
    function (
        $scope,
        $rootScope,
        kendoExt,
        $linq,
        $timeout,
        $localStorage,
        $base64,
        $modalInstance
    ) {

        $scope.OK = function (s) {
            $modalInstance.close(s);
        };

        $scope.Iptal = function () {
            $modalInstance.close('OK');
        };

    }
);