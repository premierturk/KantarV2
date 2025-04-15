app.controller(
  "AracEditCtrl",
  function ($scope, $localStorage, $modalInstance, $modal, parameter, isEdit, kendoExt, $log, $timeout, SweetAlert) {
    var firmaid;
    var aracid;

    $scope.onlyNumbers = function (text, type) {
      if ($scope.ilid != 1) {
        text = text.replace(/[^0-9]/g, '');

        if (type == 1)
          $scope.arac.Dara = text;
        else
          $scope.arac.Kapasitesi = text;
      }
    }

    $scope.ilid = $localStorage.user.ilid;
    $scope.AracTakipZorunlu = true;

    $scope.arac = {
      AracDurumId: 1,
      AracCinsiId: 30,
      MarkaId: 3,
      FirmaId: null
    }

    if (parameter.tur == "aracid") {
      aracid = parameter.id;
      firmaid = 0;
    }

    if (parameter.tur == "firmaid") {
      firmaid = parameter.id;
      aracid = 0;
    }

    if (parameter.tur == "firmaid") {
      $timeout(function () {
        $scope.firma_disabled = true;
        $scope.arac.FirmaId = firmaid;
      }, 500);
    } else
      $scope.firma_disabled = false;


    var urls = [
      "/Api/FirmaListesiCopMini?BuyukSehirId=1",
    ]




    kendoExt.Get$q(urls, function (response) {
      $scope.dsFirma = kendoExt.ConvertToDataSource(response[0].data);
    });


    $timeout(function () {
      if (isEdit) {
        aracid = parameter.data.AracId;
        firmaid = parameter.data.FirmaId;

        $scope.arac.AracId = aracid;
        $scope.arac.FirmaId = parameter.data.FirmaId;
        $scope.arac.PlakaNo = parameter.data.PlakaNo;
        if ($scope.ilid == 6) $scope.arac.HGSEtiketNo = parameter.data.OGSEtiket;
        $scope.arac.Dara = parameter.data.Dara;
        $scope.arac.Kapasitesi = parameter.data.Kapasitesi;
        $scope.uneditedHGS = parameter.data.OGSEtiket;
        $scope.arac.ChangeUser = $localStorage.user.userid;
      }
    }, 200)

    $scope.Kaydet = function () {
      var isValidate = true;
      if ($scope.arac == undefined) {
        $scope.ShowMessage("warning", "Uyarı", "Plaka no giriniz.");
        isValidate = false;
      }
      if ($scope.arac.Dara == null) {
        $scope.ShowMessage("warning", "Uyarı", "Dara giriniz.");
        isValidate = false;
      }
      if ($scope.arac.PlakaNo == null) {
        $scope.ShowMessage("warning", "Uyarı", "Plaka no giriniz.");
        isValidate = false;
      }
      if ($scope.arac.MarkaId == null) {
        $scope.ShowMessage("warning", "Uyarı", "Araç markası seçiniz.");
        isValidate = false;
      }

      if ($scope.arac.FirmaId == null || $scope.arac.FirmaId == undefined || $scope.arac.FirmaId == 0) {
        $scope.ShowMessage("warning", "Uyarı", "Firma seçiniz.");
        isValidate = false;
      }

      if ($scope.arac.AracCinsiId == null || $scope.arac.AracCinsiId == "" || $scope.arac.AracCinsiId == undefined) {
        $scope.ShowMessage("warning", "Uyarı", "Araç cinsi seçiniz.");
        isValidate = false;
      }
      if ($localStorage.user.ilid == 6 && $scope.arac.AracCinsiId == 30 && ($scope.arac.HGSEtiketNo == null || $scope.arac.HGSEtiketNo == "" || $scope.arac.AracCinsiId == undefined)) {
        $scope.ShowMessage("warning", "Uyarı", "HGS Etiket No giriniz.");
        isValidate = false;
      }
      if ($localStorage.user.ilid == 6 && $scope.hgs == true) {
        $scope.ShowMessage("warning", "Uyarı", "Lütfen geçerli bir HGS Etiket No giriniz.");
        isValidate = false;
      }

      if (!isValidate) return;

      $scope.arac.BuyukSehirId = 1;
      $scope.arac.CreateUser = $localStorage.user.userid;

      if (aracid == 0) { //create
        kendoExt.post("/Api/Arac", $scope.arac, function (response) {
          if (response.data == "") {
            Notiflix.Notify.success("Kaydedildi.");
            $modalInstance.close('reload');
          } else {
            $scope.ShowMessage("warning", "Uyarı", response.data);
          }
        });
      } else { //update
        kendoExt.put("api/kantar/CopAraciDuzenle", $scope.arac, function (response) {
          if (response) {
            Notiflix.Notify.success("Kaydedildi.");
            $modalInstance.close('reload');
          } else {
            $scope.ShowMessage("warning", "Uyarı", response.data);
          }
        })
      }
    };

    $scope.Iptal = function () {
      $modalInstance.dismiss('cancel');
    };


    $scope.HGSEtiketCtrl = function () {
      if ($scope.arac.HGSEtiketNo != null && $scope.arac.HGSEtiketNo != "" && $scope.arac.HGSEtiketNo != uneditedHGS)
        kendoExt.Get("/api/HGSEtiketNoKontrol?HGSEtiketNo=" + $scope.arac.HGSEtiketNo,
          function (response) {
            if (response.data != "") {
              $scope.hgs = true;
              SweetAlert.swal("Bu HGS Etiketi Kullanılmaktadır!", $scope.arac.HGSEtiketNo + " nolu etiket " + response.data + " plakalı araçta kullanılmaktadır.", "error");
            }
            else
              $scope.hgs = false;
          });

    };

    $scope.PlakaEntry = function (e) {
      var y = String.fromCharCode(e.keyCode);

      var transformedInput = y.replace(/[^0-9]/g, '');
      //if (transformedInput == "") {
      //    $scope.arac.PlakaNo = $scope.arac.PlakaNo.substring(0, $scope.arac.PlakaNo.length - 1);
      //    $scope.arac.PlakaNo = $scope.arac.PlakaNo + " " + y;
      //}
    };

    $scope.ShowMessage = function (type, title, text) {
      Notiflix.Notify.warning(text);
    }

  });