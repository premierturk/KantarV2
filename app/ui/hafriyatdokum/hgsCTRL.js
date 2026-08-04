const { template } = require("lodash");

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
    TumAracListesi,
    kabul,
    $modal
  ) {

    $scope.kabul = kabul;

    var araclar = TumAracListesi;
    // $linq
    //   .Enumerable()
    //   .From(TumAracListesi)
    //   .Where(function (x) {
    //     return x.AracCinsiId == 30;
    //   })
    //   .ToArray();

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
              },
              {
                field: "Tur",
                text: "Sil",
                className: "btn-copAracSil",
                click: function (e) {

                  e.preventDefault();

                  var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

                  if (dataItem.AracCinsiId == 30) {

                    kendo.confirm("Aracı silmek istediğinize emin misiniz?").then(function () {

                      var aracId = dataItem.AracId;

                      kendoExt.delete(
                        "api/kantar/CopAraciSil?AracId=" + aracId + "&UserId=" + $localStorage.user.userid,
                        function (response) {
                          console.log(response);
                          Notiflix.Notify.success("Silindi.");

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

                  }

                },

                visible: function (dataItem) {
                  return dataItem.AracCinsiId == 30;
                },
              },
              {
                field: "Tur",
                text: "Düzenle",
                className: "btn-copAracDuzenle",
                click: function (e) {

                  e.preventDefault();

                  var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                  $scope.AracEdit(dataItem, true);


                },

                visible: function (dataItem) {
                  return dataItem.AracCinsiId == 30;
                },
              }
            ],
            width: "130px",

          },
          { field: "PlakaNo", title: "Plaka No", width: "80px" },
          {
            field: "FirmaAdi",
            title: "Firma",
            width: "150px",
            attributes: { style: "white-space:nowrap" },
          },
          { field: "Dara", title: "Dara", width: "80px" },
          { field: "AracCinsi", title: "Araç Cinsi", width: "100px" },
          { field: "OGSEtiket", title: "OGSEtiket", width: "80px" },
        ],
        selectable: "row"
      });



      $scope.AracEdit = function (data = null, isEdit = false) {
        if (data == null) {
          var parameter = {
            tur: "aracid",
            id: 0,
          };
          var modalInstance = $modal.open({
            animation: true,
            templateUrl: "aracedit",
            controller: "AracEditCtrl",
            size: "lg",
            resolve: {
              parameter: function () {
                return parameter;
              },
              isEdit: function () {
                return isEdit;
              }
            },
          });

          modalInstance.result.then(function (s) {
            $scope.Iptal();
          });
        } else {
          console.log(data);

          var arac = {
            AracCinsi: data.AracCinsi,
            AracCinsiId: data.AracCinsiId,
            AracId: data.AracId,
            AracTakipVarmi: data.AracTakipVarmi,
            Dara: data.Dara,
            FirmaAdi: data.FirmaAdi,
            FirmaId: data.FirmaId,
            IsDaraDegisimi: data.IsDaraDegisimi,
            Kapasitesi: data.Kapasitesi,
            OGSEtiket: data.OGSEtiket,
            PlakaNo: data.PlakaNo,
            TasimaIzinAktif: data.TasimaIzinAktif,
          };


          var parameter = {
            tur: "aracupdate",
            id: 0,
            data: arac
          };

          var modalInstance = $modal.open({
            animation: true,
            templateUrl: "aracedit",
            controller: "AracEditCtrl",
            size: "lg",
            resolve: {
              parameter: function () {
                return parameter;
              },
              isEdit: function () {
                return isEdit;
              }
            },
          });

          modalInstance.result.then(function (s) {
            $scope.Iptal();
          });
        }
      };



    }, 200);


    $scope.Iptal = function () {
      $modalInstance.close('OK');
    };


  }
);