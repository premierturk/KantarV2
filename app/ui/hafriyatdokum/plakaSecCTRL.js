app.controller(
    "plakasecCtrl",
    function (
      $scope,
      $rootScope,
      kendoExt,
      $linq,
      $timeout,
      $localStorage,
      $base64,
      $modalInstance,
      PlakaListesi
    ) {
      $scope.PlakaListesi = PlakaListesi;
      $scope.AracId = null;
  
      $timeout(function () {
        $("#gridAraclar").kendoGrid({
          dataSource: {
            data: $scope.PlakaListesi,
            pageSize: 20,
          },
          height: 850,
          scrollable: true,
          sortable: true,
          filterable: true,
          pageable: {
            alwaysVisible: false,
            pageSizes: [5, 10, 20, 100]
          },
          toolbar: ["search"],
          columns: [
            { field: "PlakaNo", title: "Plaka No", width: "130px" },
            {
              field: "FirmaAdi",
              title: "Firma",
              width: "130px",
              attributes: { style: "white-space:nowrap" },
            },
            { field: "Dara", title: "Dara", width: "130px" },
            { field: "AracCinsi", title: "Araç Cinsi", width: "130px" },
          ],
          selectable: "row",
          change: function (e) {
            var selectedRows = this.select();
  
            var selectedDataItems = [];
            for (var i = 0; i < selectedRows.length; i++) {
              var dataItem = this.dataItem(selectedRows[i]);
              selectedDataItems.push(dataItem);
            }
  
            var data = selectedDataItems[0];
  
  
            $scope.setSelected(data);
          },
        });
      }, 200);
  
      // $timeout(function () {
      //   $("#txtSearch").focus();
      //   if (PlakaListesi && PlakaListesi.length > 0) {
      //     $scope.TumPlakalar = angular.copy(PlakaListesi);
      //     if ($scope.TumPlakalar.length > 0) {
      //       $scope.AracId = $scope.TumPlakalar[0].AracId;
      //       $scope.PlakaNo = " | " + $scope.TumPlakalar[0].PlakaNo;
      //     }
      //   }
      // }, 200);
  
      $scope.setSelected = function (item) {
        $scope.AracId = item.AracId;
        $scope.PlakaNo = " | " + item.PlakaNo;
      };
  
      // $scope.$watch("filter", function () {
      //   $scope.TumPlakalar = $linq
      //     .Enumerable()
      //     .From($scope.PlakaListesi)
      //     .Where(function (x) {
      //       return x.PlakaNo.startsWith($scope.filter);
      //     })
      //     .ToArray();
  
      //   if ($scope.TumPlakalar.length > 0)
      //     $scope.AracId = $scope.TumPlakalar[0].AracId;
      // });
  
      $scope.Enter = function (e) {
        if (e.which === 13) {
          var selected = $linq
            .Enumerable()
            .From($scope.PlakaListesi)
            .Where(function (x) {
              return x.AracId === $scope.AracId;
            })
            .FirstOrDefault();
  
          $modalInstance.close(selected);
        }
      };
  
      $scope.Sec = function () {
        var selected = $linq
          .Enumerable()
          .From($scope.PlakaListesi)
          .Where(function (x) {
            return x.AracId === $scope.AracId;
          })
          .FirstOrDefault();
  
        $modalInstance.close(selected);
      };
    }
  );