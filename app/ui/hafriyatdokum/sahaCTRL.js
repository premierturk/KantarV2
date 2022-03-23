app.controller(
    "sahaCtrl",
    function (
      $scope,
      $rootScope,
      kendoExt,
      $linq,
      $timeout,
      $localStorage,
      $base64,
      $modalInstance,
      SahaListesi
    ) {
      $scope.SahaListesi = SahaListesi;
      $scope.DepolamaAlaniSahaId = null;
  
      $scope.setSelected = function (item) {
        $scope.DepolamaAlaniSahaId = item.DepolamaAlaniSahaId;
      };
  
      $scope.Sec = function () {
        var selected = $linq
          .Enumerable()
          .From($scope.SahaListesi)
          .Where(function (x) {
            return x.DepolamaAlaniSahaId === $scope.DepolamaAlaniSahaId;
          })
          .FirstOrDefault();
  
        $modalInstance.close(selected);
      };
    }
  );