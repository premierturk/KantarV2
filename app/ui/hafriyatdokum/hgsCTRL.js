app.controller(
    "hgsCtrl",
    function (
      $scope,
      $rootScope,
      kendoExt,
      $linq,
      $timeout,
      $localStorage,
      $base64,
      $modalInstance,
      TumAracListesi
    ) {
  
  
      var araclar = $linq
        .Enumerable()
        .From(TumAracListesi)
        .Where(function (x) {
          return x.AracCinsiId == 30;
        })
        .ToArray();
  
  
      $timeout(function () {
        $("#gridAraclar").kendoGrid({
          dataSource: {
            data: araclar,
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
            {
              command: [
                {
                  field: "Tur",
                  text: "HGS Değiştir",
                  click: function (e) {
                    e.preventDefault();
  
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  
                    kendo.prompt(dataItem.PlakaNo + " için HGS No giriniz.", dataItem.OGSEtiket).then(function (data) {
  
                      if (!data) {
                        Notiflix.Notify.failure("HGS No giriniz.");
                        return;
                      }
  
                      var aracId = dataItem.AracId;
  
  
                      var data = {
                        AracId: aracId,
                        HgsNo: data
                      };
  
                      kendoExt.post(
                        "api/kantar/HGSNoDegisimi",
                        data,
                        function (response) {
  
                          Notiflix.Notify.success("Kaydedildi.");
  
                          $scope.Iptal();
                        },
                        function (err) {
                          console.log("SAVING failure :");
                          Notiflix.Notify.failure(err.data);
                          $scope.kabul.Temizle();
                        }
                      );
  
  
  
                    }, function () {
                      //kendo.alert("Cancel entering value.");
                    })
  
  
                  },
                },
                {
                  field: "Tur",
                  text: "Dara Değiştir",
                  click: function (e) {
                    e.preventDefault();
  
                    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  
                    kendo.prompt(dataItem.PlakaNo + " için Dara giriniz.", dataItem.Dara).then(function (data) {
  
                      if (!data) {
                        Notiflix.Notify.failure("Dara giriniz!");
                        return;
                      }
  
                      var aracId = dataItem.AracId;
  
                      var data = {
                        AracId: aracId,
                        Dara: parseInt(data)
                      };
  
                      kendoExt.post(
                        "api/kantar/DaraDegisimi",
                        data,
                        function (response) {
  
                          Notiflix.Notify.success("Kaydedildi.");
  
                          $scope.Iptal();
                        },
                        function (err) {
                          console.log("SAVING failure :");
                          Notiflix.Notify.failure(err.data);
                          $scope.kabul.Temizle();
                        }
                      );
  
  
  
                    }, function () {
                      //kendo.alert("Cancel entering value.");
                    })
  
  
                  },
                }
              ]
  
            },
            { field: "PlakaNo", title: "Plaka No", width: "130px" },
            {
              field: "FirmaAdi",
              title: "Firma",
              width: "130px",
              attributes: { style: "white-space:nowrap" },
            },
            { field: "Dara", title: "Dara", width: "130px" },
            { field: "AracCinsi", title: "Araç Cinsi", width: "130px" },
            { field: "OGSEtiket", title: "OGSEtiket", width: "130px" },
          ],
          selectable: "row"
        });
      }, 200);
  
  
      $scope.Iptal = function () {
        $modalInstance.close('OK');
      };
  
    }
  );